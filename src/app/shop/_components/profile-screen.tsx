"use client";

import { CircleUserRound } from "lucide-react";
import type { CustomerProfileVM, OrderVM } from "@/app/shop/[ownerId]/_components/types";

export function ProfileScreen({
  isAuthenticated,
  email,
  customerProfile,
  orders,
  onSignOut,
  onRequireAuth,
}: {
  isAuthenticated: boolean;
  email: string | null;
  customerProfile: CustomerProfileVM | null;
  orders: OrderVM[] | null;
  onSignOut: () => void;
  onRequireAuth: () => void;
}) {
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-5">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground">Profile</h1>
        <div className="mt-16 text-center text-muted-foreground">
          <CircleUserRound className="mx-auto mb-3 size-12 text-muted-foreground/60" />
          <h2 className="mb-1.5 text-lg font-bold text-foreground">You&apos;re not signed in</h2>
          <p className="mx-auto max-w-[240px] text-xs leading-relaxed">
            Sign in to see your rewards, orders and account details.
          </p>
          <button
            onClick={onRequireAuth}
            className="mt-4 rounded-[11px] bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const orderCount = orders?.length ?? 0;
  const walletTotal = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0;

  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-2xl font-extrabold text-foreground">Profile</h1>

      <div className="rounded-[23px] bg-gradient-to-br from-[#273eaf] to-[#6b45d9] p-5 text-white">
        <div className="text-[10px] font-extrabold tracking-wide uppercase opacity-80">
          {customerProfile ? `${customerProfile.loyaltyPoints} loyalty points` : "New member"}
        </div>
        <div className="my-1.5 text-xl font-extrabold">{customerProfile?.name ?? "Welcome"}</div>
        <div className="text-xs opacity-85">{email}</div>
        <div className="mt-4.5 grid grid-cols-3 border-t border-white/25 pt-3.5">
          <div>
            <b className="block text-[15px]">{orderCount}</b>
            <span className="text-[10px] opacity-80">Orders</span>
          </div>
          <div>
            <b className="block text-[15px]">{customerProfile?.loyaltyPoints ?? 0}</b>
            <span className="text-[10px] opacity-80">Reward points</span>
          </div>
          <div>
            <b className="block text-[15px]">₹{walletTotal.toFixed(0)}</b>
            <span className="text-[10px] opacity-80">Lifetime spend</span>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-3">
        <h2 className="text-base font-extrabold text-foreground">Account</h2>
      </div>
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground">{email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="text-foreground">{customerProfile?.phone ?? "—"}</span>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="mt-4 w-full rounded-[13px] border border-border bg-card py-3 text-[13px] font-extrabold text-muted-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
