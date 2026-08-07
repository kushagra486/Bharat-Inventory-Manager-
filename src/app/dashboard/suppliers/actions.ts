"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toNullable(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function parseSupplierForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: toNullable(formData.get("phone")),
    email: toNullable(formData.get("email")),
    address: toNullable(formData.get("address")),
  };
}

export async function createSupplier(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const values = parseSupplierForm(formData);
  const { error } = await supabase.from("suppliers").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseSupplierForm(formData);
  const { error } = await supabase.from("suppliers").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
}
