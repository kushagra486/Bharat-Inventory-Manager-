import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const LOW_STOCK_THRESHOLD = 5;
const RESTOCK_TARGET = 20;
const EXPIRY_RISK_DAYS = 7;

export async function getInsightsContext(supabase: SupabaseClient<Database>) {
  const [productsRes, itemsRes, ordersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, quantity, unit, expiry_date, price")
      .eq("is_archived", false),
    supabase
      .from("sales_order_items")
      .select("product_id, product_name, quantity, line_total, sales_orders(status)"),
    supabase.from("sales_orders").select("total, status"),
  ]);

  const products = productsRes.data ?? [];
  const items = (itemsRes.data ?? []).filter((i) => i.sales_orders?.status === "completed");
  const completedOrders = (ordersRes.data ?? []).filter((o) => o.status === "completed");

  const lowStock = products
    .filter((p) => p.quantity <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity);

  const now = Date.now();
  const riskCutoff = now + EXPIRY_RISK_DAYS * 24 * 60 * 60 * 1000;
  const expiryRisk = products
    .filter((p) => {
      const t = new Date(p.expiry_date).getTime();
      return t >= now && t <= riskCutoff;
    })
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const salesByProduct = new Map<string, number>();
  for (const item of items) {
    salesByProduct.set(item.product_name, (salesByProduct.get(item.product_name) ?? 0) + item.quantity);
  }
  const bestSellers = [...salesByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  const summaryParts: string[] = [];
  if (lowStock.length > 0) {
    summaryParts.push(`${lowStock.length} product${lowStock.length > 1 ? "s need" : " needs"} restocking`);
  }
  if (expiryRisk.length > 0) {
    summaryParts.push(
      `${expiryRisk.length} product${expiryRisk.length > 1 ? "s expire" : " expires"} within ${EXPIRY_RISK_DAYS} days`,
    );
  }
  const summary =
    summaryParts.length > 0
      ? summaryParts.join(" and ") + "."
      : "Inventory looks healthy — no urgent restocking or expiry risks right now.";

  return {
    products,
    lowStock,
    expiryRisk,
    bestSellers,
    totalRevenue,
    avgOrderValue,
    orderCount: completedOrders.length,
    summary,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    restockTarget: RESTOCK_TARGET,
    expiryRiskDays: EXPIRY_RISK_DAYS,
  };
}

export type InsightsContext = Awaited<ReturnType<typeof getInsightsContext>>;

export function insightsContextToPrompt(ctx: InsightsContext): string {
  const lines: string[] = [];
  lines.push(`Total products in stock: ${ctx.products.length}`);
  lines.push(`Completed orders: ${ctx.orderCount}, total revenue: ₹${ctx.totalRevenue.toFixed(2)}, avg order value: ₹${ctx.avgOrderValue.toFixed(2)}`);

  if (ctx.lowStock.length > 0) {
    lines.push(
      `Low stock (≤${ctx.lowStockThreshold} units): ` +
        ctx.lowStock.map((p) => `${p.name} (${p.quantity} ${p.unit})`).join(", "),
    );
  } else {
    lines.push("No products are low on stock.");
  }

  if (ctx.expiryRisk.length > 0) {
    lines.push(
      `Expiring within ${ctx.expiryRiskDays} days: ` +
        ctx.expiryRisk.map((p) => `${p.name} (expires ${p.expiry_date})`).join(", "),
    );
  } else {
    lines.push("Nothing is expiring soon.");
  }

  if (ctx.bestSellers.length > 0) {
    lines.push("Best sellers: " + ctx.bestSellers.map(([name, qty]) => `${name} (${qty} sold)`).join(", "));
  } else {
    lines.push("No completed sales yet.");
  }

  return lines.join("\n");
}
