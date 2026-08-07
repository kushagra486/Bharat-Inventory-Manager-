import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ShopContext = {
  /** The shop's id — either the owner's own id, or the shop they're staff at. */
  shopId: string;
  role: "owner" | "staff";
  staffName: string | null;
};

/** POS/Orders are the only dashboard routes staff can reach. */
export const STAFF_ALLOWED_PATH_PREFIXES = ["/dashboard/sales", "/dashboard/orders"];

export async function getShopContext(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<ShopContext> {
  const { data: staffRow } = await supabase
    .from("shop_staff")
    .select("owner_id, full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (staffRow) {
    return { shopId: staffRow.owner_id, role: "staff", staffName: staffRow.full_name };
  }

  return { shopId: user.id, role: "owner", staffName: null };
}
