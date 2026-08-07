// Seed/mock data for modules that don't have a Supabase-backed schema yet
// (Sales, Orders, Customers, Reports, AI). Ported from the BIM AI design
// prototype's own seed data. Products/Categories/Suppliers stay real.

export type OrderStatus = "delivered" | "delivering" | "pending" | "returned";

export type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
  payment: "UPI" | "Cash" | "Card";
};

export const orders: Order[] = [
  { id: "#1042", customer: "Ramesh Kumar", items: 3, total: 420, status: "delivered", date: "Today, 10:32 AM", payment: "UPI" },
  { id: "#1041", customer: "Priya Sharma", items: 5, total: 860, status: "delivering", date: "Today, 9:50 AM", payment: "Cash" },
  { id: "#1040", customer: "Anita Verma", items: 2, total: 210, status: "pending", date: "Today, 9:12 AM", payment: "Card" },
  { id: "#1039", customer: "Suresh Patel", items: 7, total: 1240, status: "delivered", date: "Yesterday", payment: "UPI" },
  { id: "#1038", customer: "Kiran Devi", items: 1, total: 40, status: "returned", date: "Yesterday", payment: "Cash" },
];

export const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  delivered: { label: "Delivered", className: "bg-[var(--bim-accent-800)] text-[var(--bim-accent-100)]" },
  delivering: { label: "Out for delivery", className: "bg-[var(--bim-accent-2-800)] text-[var(--bim-accent-2-100)]" },
  pending: { label: "Pending", className: "border border-primary text-primary bg-transparent" },
  returned: { label: "Returned", className: "bg-[var(--bim-neutral-800)] text-foreground" },
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  membership: "Gold" | "Silver" | "Bronze";
  ltv: number;
  orders: number;
};

export const customers: Customer[] = [
  { id: "c1", name: "Ramesh Kumar", phone: "98xxxxx210", membership: "Gold", ltv: 42300, orders: 38 },
  { id: "c2", name: "Priya Sharma", phone: "97xxxxx884", membership: "Silver", ltv: 18650, orders: 21 },
  { id: "c3", name: "Anita Verma", phone: "99xxxxx012", membership: "Bronze", ltv: 6200, orders: 8 },
  { id: "c4", name: "Suresh Patel", phone: "96xxxxx573", membership: "Gold", ltv: 58900, orders: 54 },
];

export const revenueByDay = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 44 },
  { day: "Thu", value: 66 },
  { day: "Fri", value: 58 },
  { day: "Sat", value: 74 },
  { day: "Sun", value: 84 },
];

export const homeStats = {
  todayRevenue: 24580,
  profit: 9100,
  profitMargin: 37,
  ordersToday: 82,
  ordersPending: 6,
  customersTotal: 35,
  customersToday: 4,
};

export const reportSummary = {
  weekRevenue: 184200,
  weekGrowthPct: 18,
  bestCategory: "Dairy",
  avgOrderValue: 610,
  profitMargin: 37,
  weeklyLineY: [70, 55, 60, 35, 42, 20, 28, 10],
};

export const aiQuickReplies: Record<string, string> = {
  revenue: "Today's revenue is ₹24,580 across 82 orders, up 12% from yesterday.",
  forecast:
    "Based on current trends, next month's revenue is forecast at ₹7.4L, a 9% increase driven by dairy and snacks.",
  gst: "GST report for this month is ready — ₹18,240 collected. I've prepared it for export in Reports.",
};

export function formatINR(value: number) {
  return value.toLocaleString("en-IN");
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("");
}

/**
 * Heuristic AI score + recommendation for a real product, standing in for a
 * model until BIM AI's actual demand-forecast service exists (see VISION.md).
 */
export function computeAiInsight(product: { quantity: number; expiry_date: string }) {
  const daysToExpiry = Math.ceil(
    (new Date(product.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const stockUrgency = Math.max(0, 40 - product.quantity * 2);
  const expiryUrgency = daysToExpiry <= 30 ? Math.max(0, 60 - daysToExpiry * 2) : 0;
  const score = Math.max(5, Math.min(99, 35 + stockUrgency + expiryUrgency));

  let note: string;
  if (daysToExpiry < 0) {
    note = "This batch has expired — pull it from shelves and adjust stock.";
  } else if (daysToExpiry <= 7) {
    note = `Expires in ${daysToExpiry} day${daysToExpiry === 1 ? "" : "s"} — consider a discount push to clear remaining stock.`;
  } else if (product.quantity <= 5) {
    note = `Low stock — reorder soon. Recommended order qty: ${Math.max(20 - product.quantity, 10)} units.`;
  } else {
    note = `Demand is steady. Current stock covers roughly ${Math.round(product.quantity / 2)} days of sales.`;
  }

  return { score, note };
}
