"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "📦").trim() || "📦",
    color: String(formData.get("color") ?? "#94A3B8").trim() || "#94A3B8",
  };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const values = parseCategoryForm(formData);
  const { error } = await supabase.from("categories").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseCategoryForm(formData);
  const { error } = await supabase.from("categories").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}
