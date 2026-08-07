import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const { count: pendingOrdersCount } = await supabase
    .from("sales_orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <SidebarProvider>
      <AppSidebar email={user.email} pendingOrdersCount={pendingOrdersCount ?? 0} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <Input
            placeholder="Search products, categories, suppliers…"
            className="hidden max-w-xs md:block"
          />
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
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
      <Toaster />
      <OrdersRealtime ownerId={user.id} />
    </SidebarProvider>
  );
}
