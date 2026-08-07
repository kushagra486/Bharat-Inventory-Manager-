import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

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

  return (
    <SidebarProvider>
      <AppSidebar email={user.email} />
      <SidebarInset>
        <header className="hidden h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:flex">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <Input
            placeholder="Search products, orders, customers…"
            className="max-w-xs"
          />
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            render={
              <Link href="/dashboard/ai">
                <Sparkles />
              </Link>
            }
          />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pb-24 md:p-6 md:pb-6">{children}</div>
        <MobileTabBar />
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
