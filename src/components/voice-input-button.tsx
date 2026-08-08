"use client";

import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/use-voice-input";

export function VoiceInputButton({
  onTranscript,
  onListeningChange,
  disabled,
  variant = "shadcn",
}: {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
  /** "shadcn" renders the dashboard's <Button>; "plain" renders the storefront's raw <button>. */
  variant?: "shadcn" | "plain";
}) {
  const voice = useVoiceInput(onTranscript);

  useEffect(() => {
    onListeningChange?.(voice.isListening);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.isListening]);

  if (!voice.isSupported) return null;

  const label = voice.isListening ? "Stop voice input" : "Ask by voice";
  const onClick = () => (voice.isListening ? voice.stop() : voice.start());
  const Icon = voice.isListening ? MicOff : Mic;

  if (variant === "plain") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`grid size-9 shrink-0 place-items-center rounded-[11px] ${
          voice.isListening ? "bg-primary text-primary-foreground" : "bg-card text-primary"
        }`}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={voice.isListening ? "default" : "outline"}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      <Icon />
    </Button>
  );
}
