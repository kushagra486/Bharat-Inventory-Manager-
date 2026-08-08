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

export async function updateDeliveryStatus(id: string, deliveryStatus: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_orders")
    .update({ delivery_status: deliveryStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/orders");
}

export async function updateDeliveryLocation(id: string, lat: number, lng: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_orders")
    .update({ delivery_lat: lat, delivery_lng: lng, delivery_updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
