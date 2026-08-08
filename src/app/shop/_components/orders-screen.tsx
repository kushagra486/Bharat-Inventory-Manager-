"use client";

import dynamic from "next/dynamic";
import { FileText, Package, Truck } from "lucide-react";
import type { OrderVM } from "@/app/shop/_components/types";

// Leaflet touches `window` at module scope, so it must never be evaluated
// during SSR — loaded client-only regardless of where it's used.
const DeliveryMap = dynamic(() => import("@/app/shop/_components/delivery-map"), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#fff3e4] text-[#b3651a]",
  completed: "bg-[#e5f9f1] text-[#07845e]",
  cancelled: "bg-[#fff0f5] text-[#f34984]",
};

const DELIVERY_STEPS = [
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
];

export function OrdersScreen({
  isAuthenticated,
  orders,
  onRequireAuth,
}: {
  isAuthenticated: boolean;
  orders: OrderVM[] | null;
  onRequireAuth: () => void;
}) {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-2xl font-extrabold text-foreground">Your orders</h1>

      {!isAuthenticated ? (
        <div className="mt-16 text-center text-muted-foreground">
          <Package className="mx-auto mb-3 size-12 text-muted-foreground/60" />
          <h2 className="mb-1.5 text-lg font-bold text-foreground">Sign in to see your orders</h2>
          <p className="mx-auto max-w-[240px] text-xs leading-relaxed">
            Your order history and delivery status will show up here.
          </p>
          <button
            onClick={onRequireAuth}
            className="mt-4 rounded-[11px] bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"
          >
            Sign in
          </button>
        </div>
      ) : orders === null ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <Package className="mx-auto mb-3 size-12 text-muted-foreground/60" />
          <h2 className="mb-1.5 text-lg font-bold text-foreground">Nothing on the way</h2>
          <p className="mx-auto max-w-[240px] text-xs leading-relaxed">
            Your next order will show up here with its status.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-foreground">{order.shopName}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{order.orderNumber}</span>
                </div>
                <span
                  className={`rounded-[8px] px-2 py-1 text-[10px] font-extrabold uppercase ${
                    STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </p>

              {order.deliveryStatus && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-[10px] bg-[#f1f6ff] px-2.5 py-2">
                  <Truck className="size-3.5 shrink-0 text-primary" />
                  <div className="flex flex-1 items-center gap-1">
                    {DELIVERY_STEPS.map((step, i) => {
                      const stepIndex = DELIVERY_STEPS.findIndex((s) => s.value === order.deliveryStatus);
                      const reached = i <= stepIndex;
                      return (
                        <span key={step.value} className="flex flex-1 items-center gap-1">
                          <span
                            className={`text-[10px] font-extrabold whitespace-nowrap ${
                              reached ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </span>
                          {i < DELIVERY_STEPS.length - 1 && (
                            <span className={`h-px flex-1 ${reached ? "bg-primary" : "bg-border"}`} />
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {order.deliveryStatus === "out_for_delivery" &&
                order.deliveryLat !== null &&
                order.deliveryLng !== null && (
                  <div className="mt-2.5">
                    <DeliveryMap lat={order.deliveryLat} lng={order.deliveryLng} shopName={order.shopName} />
                  </div>
                )}

              <ul className="mt-2.5 flex flex-col gap-1">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {item.quantity} × {item.productName}
                    </span>
                    <span className="font-mono">₹{item.lineTotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2.5 flex justify-between border-t border-border pt-2 text-sm font-extrabold text-foreground">
                <span>Total</span>
                <span className="font-mono">₹{order.total.toFixed(2)}</span>
              </div>
              <a
                href={`/api/invoices/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex items-center justify-center gap-1.5 rounded-[10px] bg-muted py-2 text-[11px] font-extrabold text-foreground"
              >
                <FileText className="size-3.5" />
                Download invoice
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
