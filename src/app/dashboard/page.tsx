import Link from "next/link";
import { AlertTriangle, Boxes, PackageX, Sparkles, Tags, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 30;

function getExpiryWindow() {
  const now = Date.now();
  return { now, cutoff: now + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000 };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [userRes, productsRes, categoriesRes, suppliersRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("products")
      .select("id, name, quantity, unit, expiry_date, categories(name, color)")
      .eq("is_archived", false),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("suppliers").select("id", { count: "exact", head: true }),
  ]);

  const displayName =
    (userRes.data.user?.user_metadata?.full_name as string | undefined) ||
    userRes.data.user?.email?.split("@")[0] ||
    "there";

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

  const categoryCounts = new Map<string, { count: number; color: string }>();
  for (const p of products) {
    const cat = p.categories;
    const name = cat?.name ?? "Uncategorized";
    const color = cat?.color ?? "var(--muted-foreground)";
    const entry = categoryCounts.get(name) ?? { count: 0, color };
    entry.count += 1;
    categoryCounts.set(name, entry);
  }
  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  const maxCategoryCount = Math.max(1, ...topCategories.map(([, v]) => v.count));

  const stats = [
    { title: "Total products", value: products.length, icon: Boxes, href: "/dashboard/products" },
    { title: "Categories", value: categoriesRes.count ?? 0, icon: Tags, href: "/dashboard/categories" },
    { title: "Suppliers", value: suppliersRes.count ?? 0, icon: Truck, href: "/dashboard/suppliers" },
    { title: "Low stock", value: lowStock.length, icon: PackageX, href: "/dashboard/products" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">Good to see you</p>
        <h1 className="text-2xl font-medium tracking-tight capitalize">{displayName}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="flex flex-col gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <stat.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-medium">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-medium tracking-wide text-primary uppercase">
              Products by category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add products to see a breakdown.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {topCategories.map(([name, { count, color }]) => (
                  <li key={name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{name}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </div>
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lowStock.length > 0
                ? `${lowStock.length} product${lowStock.length > 1 ? "s are" : " is"} running low on stock.`
                : "Everything looks well-stocked right now."}
            </p>
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
              render={<Link href="/dashboard/ai">Ask AI</Link>}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-[var(--color-warn)]" />
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
