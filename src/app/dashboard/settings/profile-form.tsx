"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/app/dashboard/settings/actions";
import type { Tables } from "@/lib/supabase/types";

type Profile = Tables<"user_profiles"> | null;

const DELIVERY_ESTIMATES = ["10-15 min", "15-20 min", "20-30 min", "30-45 min", "45-60 min"];

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
  const formKey = [
    profile?.full_name,
    profile?.business_name,
    profile?.phone,
    profile?.delivery_estimate,
    profile?.service_area,
    profile?.upi_id,
  ].join("|");

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
      <div className="flex flex-col gap-2">
        <Label htmlFor="delivery_estimate">Delivery estimate (shown to customers)</Label>
        <Select name="delivery_estimate" defaultValue={profile?.delivery_estimate ?? undefined}>
          <SelectTrigger id="delivery_estimate" className="w-full">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_ESTIMATES.map((estimate) => (
              <SelectItem key={estimate} value={estimate}>
                {estimate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="service_area">Service area (shown to customers)</Label>
        <Input
          id="service_area"
          name="service_area"
          placeholder="e.g. Sector 12, Sector 14"
          defaultValue={profile?.service_area ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="upi_id">UPI ID (for customer payments)</Label>
        <Input
          id="upi_id"
          name="upi_id"
          placeholder="e.g. shopname@okhdfcbank"
          defaultValue={profile?.upi_id ?? ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
