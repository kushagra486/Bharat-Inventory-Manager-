"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useActionState } from "react";
import { staffSignUp, type AuthState } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: AuthState = {};

export default function StaffSignupPage() {
  const [state, formAction, isPending] = useActionState(staffSignUp, initialState);

  return (
    <div
      className="flex min-h-svh items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%), var(--background)",
      }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <CardTitle className="text-xl">Join as staff</CardTitle>
          <CardDescription>
            Create your account with the invite code your shop owner gave you — you&apos;ll get
            POS access to ring up sales and view orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" type="text" required autoComplete="name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteCode">Invite code</Label>
              <Input id="inviteCode" name="inviteCode" required className="font-mono" />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Joining..." : "Join shop"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Shop owner instead?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Create an owner account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
