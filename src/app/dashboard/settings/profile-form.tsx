"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/dashboard/settings/actions";
import type { Tables } from "@/lib/supabase/types";

type Profile = Tables<"user_profiles"> | null;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateProfile(formData);
        toast.success("Profile updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  // Keying on the loaded values forces a remount (instead of an in-place
  // defaultValue update) whenever fresh data arrives after a save.
  const formKey = `${profile?.full_name ?? ""}|${profile?.business_name ?? ""}|${profile?.phone ?? ""}`;

  return (
    <form key={formKey} action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Your name</Label>
        <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="business_name">Business name</Label>
        <Input id="business_name" name="business_name" defaultValue={profile?.business_name ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
