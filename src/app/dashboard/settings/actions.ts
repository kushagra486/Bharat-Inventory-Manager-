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
  };

  const { error } = await supabase.from("user_profiles").upsert({ id: user.id, ...values });
  if (error) throw new Error(error.message);

  // Keep the auth metadata copy in sync so the dashboard greeting stays accurate.
  await supabase.auth.updateUser({ data: { full_name: values.full_name } });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
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
