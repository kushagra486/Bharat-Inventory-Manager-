"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Sparkles,
  Tags,
  Truck,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/app/auth-actions";

const ownerNavGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Inventory",
    items: [
      { title: "Products", url: "/dashboard/products", icon: Boxes },
      { title: "Categories", url: "/dashboard/categories", icon: Tags },
      { title: "Suppliers", url: "/dashboard/suppliers", icon: Truck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Sales", url: "/dashboard/sales", icon: ShoppingCart },
      { title: "Orders", url: "/dashboard/orders", icon: ClipboardList },
      { title: "Customers", url: "/dashboard/customers", icon: Users },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "AI Insights", url: "/dashboard/ai", icon: Sparkles },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Workspace",
    items: [{ title: "Settings", url: "/dashboard/settings", icon: Settings }],
  },
];

const staffNavGroups = [
  {
    label: "Operations",
    items: [
      { title: "Sales", url: "/dashboard/sales", icon: ShoppingCart },
      { title: "Orders", url: "/dashboard/orders", icon: ClipboardList },
    ],
  },
];

export function AppSidebar({
  email,
  pendingOrdersCount = 0,
  role = "owner",
}: {
  email?: string | null;
  pendingOrdersCount?: number;
  role?: "owner" | "staff";
}) {
  const pathname = usePathname();
  const navGroups = role === "staff" ? staffNavGroups : ownerNavGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">BIM AI</span>
            <span className="truncate text-xs text-muted-foreground">
              {role === "staff" ? "Staff POS" : "Owner Dashboard"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      render={
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                    {item.url === "/dashboard/orders" && pendingOrdersCount > 0 && (
                      <SidebarMenuBadge>{pendingOrdersCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="truncate px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              {email}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton type="submit" tooltip="Sign out">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
