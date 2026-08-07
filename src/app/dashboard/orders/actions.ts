"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sales_orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/reports");
}
