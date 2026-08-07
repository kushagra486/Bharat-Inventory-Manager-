"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toNullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function parseCustomerForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: toNullable(formData.get("phone")),
    email: toNullable(formData.get("email")),
    address: toNullable(formData.get("address")),
  };
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const values = parseCustomerForm(formData);
  const { error } = await supabase.from("customers").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/sales");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseCustomerForm(formData);
  const { error } = await supabase.from("customers").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/sales");
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/sales");
}
