"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CartLine } from "@/app/shop/_components/types";

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
  total: number;
};

export async function placeOrder(
  ownerId: string,
  lines: CartLine[],
  customerName: string,
  customerPhone: string,
  paymentMethod: string,
): Promise<PlaceOrderResult> {
  if (lines.length === 0) throw new Error("Your cart is empty.");
  if (!customerName.trim()) throw new Error("Enter your name to place the order.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to place an order.");

  const { data, error } = await supabase.rpc("place_customer_order", {
    p_owner_id: ownerId,
    p_customer_name: customerName.trim(),
    p_customer_phone: customerPhone.trim(),
    p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
    p_payment_method: paymentMethod,
  });
  if (error) throw new Error(error.message);

  const result = data as { order_id: string; order_number: string; total: number };

  revalidatePath(`/shop/${ownerId}`);
  revalidatePath("/shop");

  return { orderId: result.order_id, orderNumber: result.order_number, total: result.total };
}
