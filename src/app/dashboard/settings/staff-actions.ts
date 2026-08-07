"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function inviteStaff(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) throw new Error("Enter the staff member's name.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("shop_staff").insert({
    owner_id: user.id,
    full_name: trimmed,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}

export async function removeStaff(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("shop_staff").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}
