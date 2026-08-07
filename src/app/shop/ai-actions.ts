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

  const catalog = products
    .map(
      (p) =>
        `${p.id} | ${p.name} | ₹${p.price} | ${p.quantity} ${p.unit} in stock | ${p.categories?.name ?? "General"} | sold by ${shopNameByOwner.get(p.user_id) ?? "Local shop"}`,
    )
    .join("\n");

  const systemPrompt = `You are Bharat AI, a shopping assistant inside a marketplace app connecting customers to real local shops. A customer describes what they want. Using ONLY the product catalog below (id | name | price | stock | category | shop), pick the most relevant real products — never invent products, prices, ids, or shops that are not in the catalog, and never recommend an item with 0 stock. If multiple shops carry a similar item, you may include options from more than one shop. Reply with ONLY compact JSON, no markdown, in this exact shape: {"message": "one short friendly sentence (max 25 words) explaining the picks and mentioning which shop(s) they're from", "product_ids": ["id1", "id2"]}. Pick at most 6 relevant products. If nothing in the catalog fits the request, return an empty product_ids array and say so briefly in message.

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
      temperature: 0.3,
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
