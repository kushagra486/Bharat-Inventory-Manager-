import { createClient } from "@/lib/supabase/server";
import { CategoriesTable } from "@/app/dashboard/categories/categories-table";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize your products into categories.
        </p>
      </div>
      <CategoriesTable categories={categories ?? []} />
    </div>
  );
}
