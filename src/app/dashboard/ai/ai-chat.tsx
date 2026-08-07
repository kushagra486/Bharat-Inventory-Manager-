"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { aiQuickReplies } from "@/lib/mock-data";

type LowStockProduct = { name: string; quantity: number; unit: string };
type Message = { role: "user" | "ai"; text: string };

const initialMessages: Message[] = [
  {
    role: "ai",
    text: "Good morning! Inventory is running low on a few essentials. Want me to prep a purchase order?",
  },
];

export function AiChat({ lowStock }: { lowStock: LowStockProduct[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  function pushAi(userText: string | null, aiText: string) {
    setMessages((prev) => [
      ...prev,
      ...(userText ? [{ role: "user" as const, text: userText }] : []),
      { role: "ai" as const, text: aiText },
    ]);
    setInput("");
  }

  function askLowStock() {
    const text =
      lowStock.length === 0
        ? "All products are well stocked right now — nothing needs reordering."
        : `Low stock: ${lowStock
            .slice(0, 5)
            .map((p) => `${p.name} (${p.quantity} ${p.unit})`)
            .join(", ")}${lowStock.length > 5 ? `, +${lowStock.length - 5} more` : ""}. Want me to draft a purchase order?`;
    pushAi("Find low stock", text);
  }

  function sendInput() {
    if (!input.trim()) return;
    pushAi(input.trim(), "Here's what I found — let me know if you'd like more detail.");
  }

  const insightCards = [
    {
      label: "Business Score",
      value: "96 / 100",
      note: "Excellent — up 4 points this week",
    },
    {
      label: "Demand Forecast",
      value: "+9% next month",
      note: "Dairy and snacks driving growth",
    },
    {
      label: "Inventory Health",
      value: lowStock.length === 0 ? "All good" : `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} low`,
      note:
        lowStock.length === 0
          ? "No products need reordering"
          : lowStock
              .slice(0, 3)
              .map((p) => p.name)
              .join(", "),
    },
    {
      label: "Risk Detection",
      value: "No anomalies",
      note: "Cash flow and returns look normal",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start">
      <Card className="flex min-h-[520px] flex-1 flex-col py-4">
        <CardContent className="flex flex-1 flex-col gap-3 px-4">
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed lg:max-w-[70%]",
                  m.role === "user"
                    ? "self-end bg-[var(--bim-accent-800)] text-[var(--bim-accent-100)]"
                    : "self-start bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <QuickReply label="Show today's revenue" onClick={() => pushAi("Show today's revenue", aiQuickReplies.revenue)} />
            <QuickReply
              label="Predict next month's sales"
              onClick={() => pushAi("Predict next month's sales", aiQuickReplies.forecast)}
            />
            <QuickReply label="Find low stock" onClick={askLowStock} />
            <QuickReply label="Generate GST report" onClick={() => pushAi("Generate GST report", aiQuickReplies.gst)} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask BIM AI anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendInput()}
            />
            <Button size="icon" onClick={sendInput} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:w-72 lg:shrink-0 lg:grid-cols-1">
        {insightCards.map((card) => (
          <Card key={card.label} className="gap-1 py-3">
            <CardContent className="flex flex-col gap-0.5 px-3.5">
              <div className="flex items-center gap-1 text-[10px] font-medium tracking-wider text-primary uppercase">
                <Sparkles className="size-3" />
                {card.label}
              </div>
              <div className="text-lg font-semibold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuickReply({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-primary px-2.5 py-1 text-[11px] text-primary hover:bg-primary/10"
    >
      {label}
    </button>
  );
}
