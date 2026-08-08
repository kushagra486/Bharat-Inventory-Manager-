"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateOrderStatus } from "@/app/dashboard/orders/actions";
import type { Tables } from "@/lib/supabase/types";

type Order = Tables<"sales_orders"> & {
  customers: { name: string; phone: string | null; auth_user_id: string | null } | null;
};

const STATUS_OPTIONS = ["completed", "pending", "cancelled", "refunded"];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  cancelled: "destructive",
  refunded: "outline",
};

export function OrdersTable({
  orders,
  itemCounts,
}: {
  orders: Order[];
  itemCounts: Record<string, number>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(orderId: string, status: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
        toast.success(`Order marked ${status}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No orders yet. Ring up a sale in Sales · POS, or share your storefront link.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => {
            const isOnline = Boolean(order.customers?.auth_user_id);
            return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>
                <Badge variant={isOnline ? "default" : "outline"} className="whitespace-nowrap">
                  {isOnline ? "Online" : "In-store"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{order.customers?.name ?? "Walk-in"}</span>
                  {isOnline && order.customers?.phone && (
                    <span className="text-xs text-muted-foreground">{order.customers.phone}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{itemCounts[order.id] ?? 0}</TableCell>
              <TableCell className="uppercase">{order.payment_method}</TableCell>
              <TableCell>₹{Number(order.total).toFixed(2)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    nativeButton={false}
                    render={
                      <Badge
                        variant={STATUS_VARIANT[order.status] ?? "outline"}
                        className="cursor-pointer capitalize"
                      >
                        {order.status}
                      </Badge>
                    }
                  />
                  <DropdownMenuContent align="start">
                    {STATUS_OPTIONS.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        disabled={isPending}
                        onClick={() => handleStatusChange(order.id, status)}
                        className="capitalize"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  nativeButton={false}
                  render={
                    <a href={`/api/invoices/${order.id}`} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <FileText />
                </Button>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
