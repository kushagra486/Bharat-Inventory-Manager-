import { createClient } from "@/lib/supabase/server";
import { SuppliersTable } from "@/app/dashboard/suppliers/suppliers-table";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground">
          Keep track of who supplies your stock.
        </p>
      </div>
      <SuppliersTable suppliers={suppliers ?? []} />
    </div>
  );
}
