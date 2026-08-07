"use client";

import { Button } from "@/components/ui/button";

type OrderRow = {
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  customers: { name: string } | null;
};

function toCsv(orders: OrderRow[]) {
  const header = ["Order", "Customer", "Payment", "Total", "Status", "Date"];
  const rows = orders.map((o) => [
    o.order_number,
    o.customers?.name ?? "Walk-in",
    o.payment_method,
    Number(o.total).toFixed(2),
    o.status,
    new Date(o.created_at).toLocaleString(),
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function ExportButtons({ orders }: { orders: OrderRow[] }) {
  function exportCsv() {
    const csv = toCsv(orders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bim-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={exportCsv}>
        Export CSV
      </Button>
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        Export PDF
      </Button>
    </div>
  );
}
