"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

function parseProductForm(formData: FormData): Omit<TablesInsert<"products">, "user_id"> {
  const toNullable = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  };

  return {
    name: String(formData.get("name") ?? "").trim(),
    quantity: Number(formData.get("quantity") ?? 0),
    unit: String(formData.get("unit") ?? "pcs").trim() || "pcs",
    price: formData.get("price") ? Number(formData.get("price")) : null,
    expiry_date: String(formData.get("expiry_date") ?? ""),
    manufacture_date: toNullable(formData.get("manufacture_date")),
    batch_number: toNullable(formData.get("batch_number")),
    barcode: toNullable(formData.get("barcode")),
    location: toNullable(formData.get("location")),
    notes: toNullable(formData.get("notes")),
    category_id: toNullable(formData.get("category_id")),
    supplier_id: toNullable(formData.get("supplier_id")),
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const values = parseProductForm(formData);
  const { error } = await supabase.from("products").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseProductForm(formData) as TablesUpdate<"products">;
  const { error } = await supabase.from("products").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}
