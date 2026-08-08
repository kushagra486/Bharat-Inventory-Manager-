"use server";

import { createClient } from "@/lib/supabase/server";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_CATALOG_ITEMS = 400;

export type AiShoppingResult = {
  message: string;
  items: { productId: string; ownerId: string }[];
};

export async function askShoppingAi(query: string): Promise<AiShoppingResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) throw new Error("Ask Bharat AI something first.");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Bharat AI isn't configured yet — ask the app owner to add a Groq API key.");
  }

  const supabase = await createClient();
  const [productsRes, profilesRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, quantity, unit, user_id, categories(name)")
      .eq("is_archived", false)
      .gt("quantity", 0)
      .not("price", "is", null)
      .order("name")
      .limit(MAX_CATALOG_ITEMS),
    supabase.from("user_profiles").select("id, business_name, full_name"),
  ]);
  if (productsRes.error) throw new Error(productsRes.error.message);

  const products = productsRes.data ?? [];
  if (products.length === 0) {
    return { message: "No shops have listed in-stock products yet.", items: [] };
  }

  const shopNameByOwner = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.business_name || p.full_name || "Local shop"]),
  );

  // Group by category so the model reasons within a category instead of
  // scanning one long flat list and grabbing loosely-related items from
  // elsewhere in the catalog to pad out a count.
  const byCategory = new Map<string, typeof products>();
  for (const p of products) {
    const cat = p.categories?.name ?? "General";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(p);
  }
  const catalog = [...byCategory.entries()]
    .map(
      ([cat, items]) =>
        `## ${cat}\n` +
        items
          .map(
            (p) =>
              `${p.id} | ${p.name} | ₹${p.price} | ${p.quantity} ${p.unit} in stock | sold by ${shopNameByOwner.get(p.user_id) ?? "Local shop"}`,
          )
          .join("\n"),
    )
    .join("\n\n");

  const systemPrompt = `You are Bharat AI, a precise shopping assistant inside a marketplace app connecting customers to real local shops. A customer describes what they want. The product catalog below is grouped by category (## heading), each row: id | name | price | stock | shop.

Rules, in order of importance:
1. Precision over coverage. Only pick products that directly and specifically match the request. Do not pad the list with loosely related or same-shop-but-different-purpose items just to reach a target count — a short, accurate list beats a long, sloppy one.
2. Never invent products, prices, ids, or shops that are not in the catalog verbatim, and never recommend an item with 0 stock.
3. If the request names or implies a food/grocery need (a meal, an ingredient, a diet, a snack, a drink), prioritize matches from food-related categories (Dairy & Bakery, Fruits, Vegetables, Staples & Pulses, Cooking & Snacks, Beverages & Frozen, Food & Drinks, Daily Essentials) over unrelated categories like electronics or stationery, unless the customer explicitly asked for something else.
4. If multiple shops carry a genuinely matching item, you may include options from more than one shop — but each one you include must independently satisfy rule 1.
5. Pick at most 6 products, and fewer is correct when fewer genuinely match. If nothing in the catalog truly fits, return an empty product_ids array and say so briefly.

Reply with ONLY compact JSON, no markdown, in this exact shape: {"message": "one short friendly sentence (max 25 words) explaining the picks and mentioning which shop(s) they're from", "product_ids": ["id1", "id2"]}.

Product catalog:
${catalog}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmedQuery },
      ],
      temperature: 0.1,
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bharat AI is unavailable right now (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Bharat AI didn't return a response.");

  const productById = new Map(products.map((p) => [p.id, p]));
  try {
    const parsed = JSON.parse(raw);
    const message = typeof parsed.message === "string" ? parsed.message : "Here's what I found for you.";
    const items = Array.isArray(parsed.product_ids)
      ? parsed.product_ids
          .filter((id: unknown): id is string => typeof id === "string" && productById.has(id))
          .map((id: string) => ({ productId: id, ownerId: productById.get(id)!.user_id }))
      : [];
    return { message, items };
  } catch {
    return { message: raw.slice(0, 300), items: [] };
  }
}
