"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { askAi, type ChatMessage } from "@/app/dashboard/ai/actions";

// Whether the browser supports SpeechRecognition can only be known
// client-side — loading this dynamically with ssr:false avoids a
// hydration mismatch on that check.
const VoiceInputButton = dynamic(
  () => import("@/components/voice-input-button").then((m) => m.VoiceInputButton),
  { ssr: false },
);

const SUGGESTIONS = [
  "What should I restock first?",
  "How's my revenue looking?",
  "Which products are about to expire?",
  "What are my best sellers?",
];

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const question = text.trim();
    if (!question || isPending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      try {
        const reply = await askAi(nextMessages);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "AI request failed");
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        });
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Ask BIM AI</p>
        </div>

        <div ref={listRef} className="flex max-h-80 min-h-24 flex-col gap-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Ask anything about your inventory, sales, or what to restock.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-muted"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {isPending && (
            <div className="self-start rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Badge key={s} variant="outline" className="cursor-pointer" onClick={() => send(s)}>
              {s}
            </Badge>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            placeholder={isListening ? "Listening…" : "Ask BIM AI anything…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isPending}
          />
          <VoiceInputButton
            disabled={isPending}
            onListeningChange={setIsListening}
            onTranscript={(transcript, isFinal) => {
              setInput(transcript);
              if (isFinal) send(transcript);
            }}
          />
          <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
