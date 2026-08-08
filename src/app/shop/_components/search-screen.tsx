"use client";

import { useState, useTransition } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { askShoppingAi } from "@/app/shop/ai-actions";
import { useVoiceInput } from "@/hooks/use-voice-input";
import type { ProductVM } from "@/app/shop/_components/types";

const PROMPTS = [
  { icon: "🥛", label: "Dairy & bakery essentials" },
  { icon: "🥦", label: "Fresh fruits & vegetables" },
  { icon: "🍚", label: "Rice, dal & pantry staples" },
  { icon: "🍪", label: "Snacks & beverages" },
  { icon: "🥗", label: "Plan dinner for 4" },
  { icon: "☕", label: "Breakfast on a budget" },
];

export function SearchScreen({
  products,
  onAddProducts,
}: {
  products: ProductVM[];
  onAddProducts: (products: ProductVM[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ message: string; items: ProductVM[] } | null>(null);

  const voice = useVoiceInput((transcript, isFinal) => {
    setQuery(transcript);
    if (isFinal) ask(transcript);
  });

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    setQuery(q);
    startTransition(async () => {
      try {
        const res = await askShoppingAi(q);
        const items = res.items
          .map((i) => products.find((p) => p.id === i.productId))
          .filter((p): p is ProductVM => Boolean(p));
        setResult({ message: res.message, items });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bharat AI couldn't answer that.");
        setResult(null);
      }
    });
  }

  return (
    <div className="px-4 py-5">
      <div className="text-[10px] font-extrabold tracking-wide text-[#5962b9] uppercase">
        Bharat AI assistant
      </div>
      <h1 className="my-2 text-[25px] font-extrabold text-foreground">What can I shop for you?</h1>
      <p className="mb-3 text-xs text-muted-foreground">
        Searches real stock across every shop in the marketplace.
      </p>

      <div className="flex gap-2 rounded-2xl bg-muted p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(query)}
          placeholder={voice.isListening ? "Listening…" : "e.g. healthy breakfast under ₹500"}
          className="flex-1 bg-transparent p-1.5 text-sm text-foreground outline-none"
        />
        {voice.isSupported && (
          <button
            type="button"
            onClick={() => (voice.isListening ? voice.stop() : voice.start())}
            aria-label={voice.isListening ? "Stop voice input" : "Ask by voice"}
            className={`grid size-9 shrink-0 place-items-center rounded-[11px] ${
              voice.isListening ? "bg-primary text-primary-foreground" : "bg-card text-primary"
            }`}
          >
            {voice.isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
        )}
        <button
          onClick={() => ask(query)}
          disabled={isPending}
          className="rounded-[11px] bg-primary px-3.5 py-2 text-xs font-extrabold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Asking…" : "Ask AI"}
        </button>
      </div>

      <div className="mt-6 mb-3">
        <h2 className="text-base font-extrabold text-foreground">Try asking</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => ask(p.label)}
            className="min-h-[83px] rounded-2xl bg-[#f5f3ff] p-3.5 text-left text-xs font-bold text-[#56499b]"
          >
            <span className="mb-1.5 block text-xl">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="mt-4.5 rounded-[18px] border border-[#dbe7ff] bg-[#f1f6ff] p-4 text-sm text-muted-foreground">
          Bharat AI is checking the shelf…
        </div>
      )}

      {result && !isPending && (
        <div className="mt-4.5 rounded-[18px] border border-[#dbe7ff] bg-[#f1f6ff] p-4">
          <h3 className="mb-1.5 text-sm font-extrabold text-foreground">✨ {result.message}</h3>
          {result.items.length > 0 ? (
            <>
              <ul className="mt-2 flex flex-col gap-1.5">
                {result.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {item.categoryIcon} {item.name}
                      <span className="ml-1.5 text-[10px]">· {item.shopName}</span>
                      {item.deliveryEstimate && (
                        <span className="ml-1 text-[10px] text-primary">· {item.deliveryEstimate}</span>
                      )}
                    </span>
                    <span className="font-mono text-foreground">₹{item.price}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onAddProducts(result.items)}
                className="mt-3.5 rounded-[11px] bg-primary px-3.5 py-2.5 text-xs font-extrabold text-primary-foreground"
              >
                Add all to cart · ₹{result.items.reduce((s, i) => s + i.price, 0)}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nothing in stock matched that yet — try a different search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
