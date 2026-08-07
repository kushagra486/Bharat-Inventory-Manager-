"use server";

import { createClient } from "@/lib/supabase/server";
import { getInsightsContext, insightsContextToPrompt } from "@/lib/insights";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askAi(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ctx = await getInsightsContext(supabase);
  const dataSummary = insightsContextToPrompt(ctx);

  const systemPrompt = `You are the AI assistant inside Bharat Inventory Manager AI, an inventory and sales dashboard for a small Indian retail shop. Answer questions about the shop's inventory, sales, and give practical restocking/business advice. Use only the data below — never invent numbers. Keep answers short (2-4 sentences unless asked for detail), use ₹ for currency, and speak like a helpful business assistant, not a generic chatbot.

Current shop data:
${dataSummary}`;

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
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("No response from the AI model.");
  return reply as string;
}
