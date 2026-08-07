import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR, orders, statusMeta } from "@/lib/mock-data";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">Track and manage customer orders.</p>
      </div>

      <div className="hidden md:block">
        <Card>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>{o.items}</TableCell>
                    <TableCell>₹{formatINR(o.total)}</TableCell>
                    <TableCell>{o.payment}</TableCell>
                    <TableCell>{o.date}</TableCell>
                    <TableCell>
                      <Badge className={statusMeta[o.status].className}>{statusMeta[o.status].label}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {orders.map((o) => (
          <Card key={o.id} className="gap-1 py-3">
            <CardContent className="flex flex-col gap-1 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {o.id} · {o.customer}
                </span>
                <Badge className={statusMeta[o.status].className}>{statusMeta[o.status].label}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {o.date} · {o.payment} · {o.items} items
              </div>
              <div className="text-sm font-semibold">₹{formatINR(o.total)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
