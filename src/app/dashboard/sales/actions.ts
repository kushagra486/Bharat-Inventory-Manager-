"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const GST_RATE = 0.05;

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type CheckoutResult = {
  orderNumber: string;
  total: number;
};

export async function checkout(
  lines: CartLine[],
  customerId: string | null,
  paymentMethod: string,
): Promise<CheckoutResult> {
  if (lines.length === 0) throw new Error("Cart is empty");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const productIds = lines.map((l) => l.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, quantity")
    .in("id", productIds);
  if (productsError) throw new Error(productsError.message);

  const stockById = new Map((products ?? []).map((p) => [p.id, p]));
  for (const line of lines) {
    const product = stockById.get(line.productId);
    if (!product) throw new Error(`Product not found: ${line.name}`);
    if (product.quantity < line.quantity) {
      throw new Error(`Not enough stock for ${product.name} (${product.quantity} left)`);
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + tax;
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .insert({
      user_id: user.id,
      customer_id: customerId,
      order_number: orderNumber,
      status: "completed",
      payment_method: paymentMethod,
      subtotal,
      tax,
      total,
    })
    .select("id")
    .single();
  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await supabase.from("sales_order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      product_name: l.name,
      quantity: l.quantity,
      unit_price: l.price,
      line_total: Math.round(l.price * l.quantity * 100) / 100,
    })),
  );
  if (itemsError) throw new Error(itemsError.message);

  for (const line of lines) {
    const product = stockById.get(line.productId)!;
    const { error: stockError } = await supabase
      .from("products")
      .update({ quantity: product.quantity - line.quantity })
      .eq("id", line.productId);
    if (stockError) throw new Error(stockError.message);
  }

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard");

  return { orderNumber, total };
}
