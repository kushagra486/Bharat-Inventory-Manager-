import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Service-role client — bypasses RLS. Only ever import this from trusted
// server-only code with no user session, e.g. the notifications cron route.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
