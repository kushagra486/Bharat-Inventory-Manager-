import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  Receipt,
  Sparkles,
  Tags,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueBars } from "@/components/charts/revenue-bars";
import { CategoryDonut, type DonutSegment } from "@/components/charts/category-donut";
import { formatINR, homeStats, orders, revenueByDay, statusMeta } from "@/lib/mock-data";

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 30;

const donutSegments: DonutSegment[] = [
  { name: "Dairy", pct: 34, color: "var(--primary)" },
  { name: "Snacks", pct: 28, color: "var(--bim-accent-400)" },
  { name: "Grocery", pct: 24, color: "var(--bim-accent-600)" },
  { name: "Other", pct: 14, color: "var(--bim-neutral-600)" },
];

function getExpiryWindow() {
  const now = Date.now();
  return { now, cutoff: now + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000 };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, quantity, unit, expiry_date")
      .eq("is_archived", false),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("suppliers").select("id", { count: "exact", head: true }),
  ]);

  const products = productsRes.data ?? [];
  const { now, cutoff: warningCutoff } = getExpiryWindow();

  const lowStock = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);
  const expiringSoon = products
    .filter((p) => {
      const t = new Date(p.expiry_date).getTime();
      return t >= now && t <= warningCutoff;
    })
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));
  const expired = products.filter((p) => new Date(p.expiry_date).getTime() < now);

  const inventoryStats = [
    { title: "Total products", value: products.length, icon: Boxes, href: "/dashboard/products" },
    { title: "Categories", value: categoriesRes.count ?? 0, icon: Tags, href: "/dashboard/categories" },
    { title: "Suppliers", value: suppliersRes.count ?? 0, icon: Truck, href: "/dashboard/suppliers" },
    { title: "Low stock", value: lowStock.length, icon: PackageX, href: "/dashboard/products" },
  ];

  const salesStats = [
    {
      key: "rev",
      label: "Today Revenue",
      value: `₹${formatINR(homeStats.todayRevenue)}`,
      trend: "+12%",
      icon: TrendingUp,
      href: "/dashboard/sales",
    },
    {
      key: "profit",
      label: "Profit",
      value: `₹${formatINR(homeStats.profit)}`,
      trend: `${homeStats.profitMargin}% mgn`,
      icon: TrendingUp,
      href: "/dashboard/reports",
    },
    {
      key: "orders",
      label: "Orders",
      value: String(homeStats.ordersToday),
      trend: `${homeStats.ordersPending} pending`,
      icon: Receipt,
      href: "/dashboard/orders",
    },
    {
      key: "cust",
      label: "Customers",
      value: String(homeStats.customersTotal),
      trend: `+${homeStats.customersToday} today`,
      icon: Users,
      href: "/dashboard/customers",
    },
  ];

  const aiMessage =
    lowStock.length > 0
      ? `Inventory is running low. Recommended purchase: ${lowStock
          .slice(0, 3)
          .map((p) => p.name)
          .join(", ")}${lowStock.length > 3 ? `, +${lowStock.length - 3} more` : ""}.`
      : "Inventory levels look healthy across the board — nothing urgent to reorder today.";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Good morning</p>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        </div>
        <Badge className="bg-[var(--bim-accent-800)] text-[var(--bim-accent-100)]">
          Business Health 96%
        </Badge>
      </div>

      <section className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {salesStats.map((stat) => (
            <Link key={stat.key} href={stat.href}>
              <Card className="gap-2 py-4 transition-colors hover:bg-muted/50">
                <CardContent className="flex flex-col gap-2 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-md bg-[var(--bim-accent-800)] text-[var(--bim-accent-200)]">
                      <stat.icon className="size-3.5" />
                    </div>
                    <span className="text-[11px] text-primary">{stat.trend}</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                    <div className="text-xl font-semibold">{stat.value}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="gap-2 py-4">
            <CardContent className="flex flex-col gap-2 px-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium tracking-wider text-primary uppercase">
                  Revenue · last 7 days
                </span>
                <span className="text-[11px] text-primary">+18%</span>
              </div>
              <RevenueBars data={revenueByDay} />
            </CardContent>
          </Card>
          <Card className="gap-2 py-4">
            <CardContent className="flex flex-col gap-2 px-4">
              <span className="text-[10px] font-medium tracking-wider text-primary uppercase">
                Sales by Category
              </span>
              <CategoryDonut segments={donutSegments} />
            </CardContent>
          </Card>
        </div>

        <Card className="gap-3 border-primary/40 py-4">
          <CardContent className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 sm:flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">AI Assistant</div>
                <p className="text-sm text-muted-foreground">{aiMessage}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" render={<Link href="/dashboard/ai" />}>
                Ask AI
              </Button>
              <Button render={<Link href="/dashboard/sales" />}>Order now</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-2 py-4">
          <CardContent className="flex flex-col gap-2 px-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium tracking-wider text-primary uppercase">
                Recent Orders
              </span>
              <Link href="/dashboard/orders" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {orders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{o.customer}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {o.id} · {o.items} items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{formatINR(o.total)}</div>
                    <Badge className={statusMeta[o.status].className}>
                      {statusMeta[o.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          Inventory
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inventoryStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Expiring within {EXPIRY_WARNING_DAYS} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSoon.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing expiring soon.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {expiringSoon.slice(0, 8).map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span>{p.name}</span>
                      <Badge variant="outline">{p.expiry_date}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageX className="size-4 text-destructive" />
                Low stock ({LOW_STOCK_THRESHOLD} or fewer)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All stock levels look healthy.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lowStock.slice(0, 8).map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span>{p.name}</span>
                      <Badge variant="secondary">
                        {p.quantity} {p.unit}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {expired.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                {expired.length} product{expired.length > 1 ? "s" : ""} already expired
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}
