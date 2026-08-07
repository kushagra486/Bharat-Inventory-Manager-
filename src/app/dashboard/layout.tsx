import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getShopContext, STAFF_ALLOWED_PATH_PREFIXES } from "@/lib/shop-context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrdersRealtime } from "@/components/orders-realtime";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const context = await getShopContext(supabase, user);

  if (context.role === "staff") {
    const pathname = (await headers()).get("x-pathname") ?? "";
    const isAllowed = STAFF_ALLOWED_PATH_PREFIXES.some((p) => pathname.startsWith(p));
    if (pathname && !isAllowed) {
      redirect("/dashboard/sales");
    }
  }

  const { count: pendingOrdersCount } = await supabase
    .from("sales_orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.shopId)
    .eq("status", "pending");

  return (
    <SidebarProvider>
      <AppSidebar
        email={user.email}
        pendingOrdersCount={pendingOrdersCount ?? 0}
        role={context.role}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          {context.role === "staff" ? (
            <Badge variant="secondary">Staff — {context.staffName}</Badge>
          ) : (
            <Input
              placeholder="Search products, categories, suppliers…"
              className="hidden max-w-xs md:block"
            />
          )}
          {context.role === "owner" && (
            <div className="ml-auto">
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/dashboard/ai">
                    <Sparkles />
                    Ask AI
                  </Link>
                }
              />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
      <Toaster />
      <OrdersRealtime ownerId={context.shopId} />
    </SidebarProvider>
  );
}
