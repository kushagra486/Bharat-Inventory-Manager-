"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

export function OrdersRealtime({ ownerId }: { ownerId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`owner-orders-${ownerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sales_orders", filter: `user_id=eq.${ownerId}` },
        (payload) => {
          const order = payload.new as Tables<"sales_orders">;
          toast.success(`New order ${order.order_number} — ₹${Number(order.total).toFixed(2)}`, {
            description: "Placed on your storefront",
          });
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, router]);

  return null;
}
