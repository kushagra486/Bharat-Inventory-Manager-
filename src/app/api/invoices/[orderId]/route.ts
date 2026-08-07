import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [orderRes, itemsRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("*, customers(name, phone)")
      .eq("id", orderId)
      .maybeSingle(),
    supabase
      .from("sales_order_items")
      .select("product_name, quantity, unit_price, line_total")
      .eq("order_id", orderId),
  ]);

  const order = orderRes.data;
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: shopProfile } = await supabase
    .from("user_profiles")
    .select("business_name, full_name, business_address, gstin, phone")
    .eq("id", order.user_id)
    .maybeSingle();

  const pdf = await renderInvoicePdf({
    orderNumber: order.order_number,
    createdAt: order.created_at,
    paymentMethod: order.payment_method,
    status: order.status,
    shop: {
      name: shopProfile?.business_name || shopProfile?.full_name || "Local shop",
      address: shopProfile?.business_address ?? null,
      gstin: shopProfile?.gstin ?? null,
      phone: shopProfile?.phone ?? null,
    },
    customer: {
      name: order.customers?.name ?? "Walk-in customer",
      phone: order.customers?.phone ?? null,
    },
    items: (itemsRes.data ?? []).map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    total: Number(order.total),
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.order_number}.pdf"`,
    },
  });
}
