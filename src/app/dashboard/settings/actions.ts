"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toNullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const values = {
    full_name: toNullable(formData.get("full_name")),
    business_name: toNullable(formData.get("business_name")),
    phone: toNullable(formData.get("phone")),
    delivery_estimate: toNullable(formData.get("delivery_estimate")),
    service_area: toNullable(formData.get("service_area")),
    upi_id: toNullable(formData.get("upi_id")),
    gstin: toNullable(formData.get("gstin"))?.toUpperCase() ?? null,
    business_address: toNullable(formData.get("business_address")),
  };

  const { error } = await supabase.from("user_profiles").upsert({ id: user.id, ...values });
  if (error) throw new Error(error.message);

  // Keep the auth metadata copy in sync so the dashboard greeting stays accurate.
  await supabase.auth.updateUser({ data: { full_name: values.full_name } });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/shop");
}

export async function createNotificationSetting(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const daysBefore = Number(formData.get("days_before"));
  const channel = String(formData.get("channel") ?? "push");

  const { error } = await supabase.from("notification_settings").insert({
    user_id: user.id,
    days_before: daysBefore,
    channel,
    is_enabled: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}

export async function toggleNotificationSetting(id: string, isEnabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_settings")
    .update({ is_enabled: isEnabled })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}

export async function deleteNotificationSetting(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notification_settings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error(error.message);
}

export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw new Error(error.message);
}
