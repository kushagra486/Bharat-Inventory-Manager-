"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export function AuthOverlay({ shopName, onAuthed }: { shopName: string; onAuthed: () => void }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSignup = mode === "signup";

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !password || (isSignup && (!name.trim() || !phone.trim()))) {
      setError("Please complete the required details to continue.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), phone: phone.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
          setMode("signin");
          return;
        }
        toast.success(`Welcome to ${shopName}, ${name.trim()}!`);
        onAuthed();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        toast.success(`Welcome back to ${shopName}!`);
        onAuthed();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end justify-center bg-gradient-to-b from-[#1e369dcc] to-[#3929a9de] p-4 sm:place-items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[430px] rounded-[28px] bg-card px-5 pt-6 pb-5 shadow-[0_12px_38px_#0b174b66]"
      >
        <div className="flex items-center gap-2.5 text-[15px] font-extrabold text-primary">
          <span className="grid size-[35px] place-items-center rounded-[13px] bg-gradient-to-br from-[#623de6] to-[#3169f3] text-white">
            <Sparkles className="size-4" />
          </span>
          {shopName}
        </div>
        <h2 className="mt-4 mb-1 text-[22px] font-extrabold text-foreground">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {isSignup
            ? "Save smart baskets, earn rewards and get personal AI picks."
            : "Sign in to keep your baskets, rewards and smart lists in sync."}
        </p>

        <div className="mb-3.5 flex gap-1 rounded-[13px] bg-muted p-1">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`flex-1 rounded-[10px] py-2 text-xs font-extrabold transition-colors ${
              mode === "signin" ? "bg-card text-primary shadow-[0_2px_8px_#1d327c18]" : "text-muted-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 rounded-[10px] py-2 text-xs font-extrabold transition-colors ${
              mode === "signup" ? "bg-card text-primary shadow-[0_2px_8px_#1d327c18]" : "text-muted-foreground"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="grid gap-2.5">
          {isSignup && (
            <input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
          {isSignup && (
            <input
              type="tel"
              placeholder="Phone number"
              autoComplete="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
          )}
          <input
            type="password"
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
        </div>

        {error && <div className="mt-1.5 text-[11px] text-destructive">{error}</div>}
        {message && <div className="mt-1.5 text-[11px] text-emerald-600">{message}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3.5 w-full rounded-[13px] bg-gradient-to-r from-[#365cf3] to-[#663ee4] py-3.5 text-[13px] font-extrabold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
        <div className="mt-2.5 text-center text-[10px] text-muted-foreground">
          By continuing, you agree to {shopName}&apos;s Terms &amp; Privacy Policy.
        </div>
      </form>
    </div>
  );
}
