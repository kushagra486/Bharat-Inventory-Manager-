"use server";

import { createClient } from "@/lib/supabase/server";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export type AiShoppingResult = {
  message: string;
  productIds: string[];
};

export async function askShoppingAi(ownerId: string, query: string): Promise<AiShoppingResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) throw new Error("Ask Bharat AI something first.");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Bharat AI isn't configured for this shop yet — ask the owner to add a Groq API key.");
  }

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, quantity, unit, categories(name)")
    .eq("user_id", ownerId)
    .eq("is_archived", false)
    .gt("quantity", 0)
    .not("price", "is", null)
    .order("name");
  if (error) throw new Error(error.message);

  if (!products || products.length === 0) {
    return { message: "This shop hasn't listed any in-stock products yet.", productIds: [] };
  }

  const catalog = products
    .map((p) => `${p.id} | ${p.name} | ₹${p.price} | ${p.quantity} ${p.unit} in stock | ${p.categories?.name ?? "General"}`)
    .join("\n");

  const systemPrompt = `You are Bharat AI, a shopping assistant inside a hyperlocal Indian grocery/retail app. A customer describes what they want. Using ONLY the product catalog below (id | name | price | stock | category), pick the most relevant real products — never invent products, prices, or ids that are not in the catalog, and never recommend an item with 0 stock. Reply with ONLY compact JSON, no markdown, in this exact shape: {"message": "one short friendly sentence (max 25 words) explaining the picks", "product_ids": ["id1", "id2"]}. Pick at most 6 relevant products. If nothing in the catalog fits the request, return an empty product_ids array and say so briefly in message.

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

  const validIds = new Set(products.map((p) => p.id));
  try {
    const parsed = JSON.parse(raw);
    const message = typeof parsed.message === "string" ? parsed.message : "Here's what I found for you.";
    const productIds = Array.isArray(parsed.product_ids)
      ? parsed.product_ids.filter((id: unknown): id is string => typeof id === "string" && validIds.has(id))
      : [];
    return { message, productIds };
  } catch {
    return { message: raw.slice(0, 300), productIds: [] };
  }
}
