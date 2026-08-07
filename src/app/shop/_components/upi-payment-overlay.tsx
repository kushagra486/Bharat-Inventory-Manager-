"use client";

import { ScanLine, X } from "lucide-react";
import { QrCode } from "@/app/shop/_components/qr-code";

export type PendingPayment = {
  orderNumber: string;
  shopName: string;
  upiId: string;
  amount: number;
};

function buildUpiUri(payment: PendingPayment) {
  const params = new URLSearchParams({
    pa: payment.upiId,
    pn: payment.shopName,
    am: payment.amount.toFixed(2),
    cu: "INR",
    tn: `Order ${payment.orderNumber}`,
  });
  return `upi://pay?${params.toString()}`;
}

export function UpiPaymentOverlay({
  payments,
  onClose,
}: {
  payments: PendingPayment[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end justify-center bg-gradient-to-b from-[#1e369dcc] to-[#3929a9de] p-4 sm:place-items-center">
      <div className="w-full max-w-[430px] rounded-[28px] bg-card px-5 pt-6 pb-5 shadow-[0_12px_38px_#0b174b66]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-[15px] font-extrabold text-primary">
            <span className="grid size-[35px] place-items-center rounded-[13px] bg-gradient-to-br from-[#623de6] to-[#3169f3] text-white">
              <ScanLine className="size-4" />
            </span>
            Pay via UPI
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 mb-4 text-xs leading-relaxed text-muted-foreground">
          Your order{payments.length > 1 ? "s are" : " is"} placed. Scan the QR with any UPI app,
          or tap &quot;Open UPI app&quot; on your phone to pay.
        </p>

        <div className="flex flex-col gap-4">
          {payments.map((payment) => {
            const uri = buildUpiUri(payment);
            return (
              <div
                key={payment.orderNumber}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border p-4"
              >
                <div className="text-center">
                  <p className="text-xs font-extrabold text-foreground">{payment.shopName}</p>
                  <p className="text-[11px] text-muted-foreground">Order {payment.orderNumber}</p>
                </div>
                <QrCode data={uri} size={160} />
                <p className="font-mono text-base font-extrabold text-primary">
                  ₹{payment.amount.toFixed(2)}
                </p>
                <a
                  href={uri}
                  className="w-full rounded-[13px] bg-gradient-to-r from-[#365cf3] to-[#663ee4] py-3 text-center text-[13px] font-extrabold text-white"
                >
                  Open UPI app
                </a>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-[13px] bg-muted py-3 text-[13px] font-extrabold text-foreground"
        >
          Done
        </button>
      </div>
    </div>
  );
}
