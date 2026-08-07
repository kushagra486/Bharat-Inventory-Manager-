import Link from "next/link";
import { AlertTriangle, Boxes, PackageX, Tags, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 30;

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

  const stats = [
    { title: "Total products", value: products.length, icon: Boxes, href: "/dashboard/products" },
    { title: "Categories", value: categoriesRes.count ?? 0, icon: Tags, href: "/dashboard/categories" },
    { title: "Suppliers", value: suppliersRes.count ?? 0, icon: Truck, href: "/dashboard/suppliers" },
    { title: "Low stock", value: lowStock.length, icon: PackageX, href: "/dashboard/products" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A quick look at your shop&apos;s inventory health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
    </div>
  );
}
