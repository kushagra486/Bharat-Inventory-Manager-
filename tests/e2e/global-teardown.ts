import fs from "node:fs";
import path from "node:path";

const CREATED_EMAILS_FILE = path.join(__dirname, ".created-emails.json");

/**
 * Deletes every test account created this run when a service-role key is
 * available (deleting from auth.users cascades to that user's owned rows
 * via the existing ON DELETE CASCADE foreign keys). Without the key, this
 * just prints the emails so they can be cleaned up manually:
 *   delete from auth.users where email like 'e2e-%@example.com';
 */
export default async function globalTeardown() {
  if (!fs.existsSync(CREATED_EMAILS_FILE)) return;
  const emails: string[] = JSON.parse(fs.readFileSync(CREATED_EMAILS_FILE, "utf-8"));
  fs.unlinkSync(CREATED_EMAILS_FILE);

  if (emails.length === 0) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(
      `\n[e2e] ${emails.length} test account(s) created this run — set SUPABASE_SERVICE_ROLE_KEY to auto-clean, ` +
        `or remove manually:\n  delete from auth.users where email like 'e2e-%@example.com';\n`,
    );
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const toDelete = (data?.users ?? []).filter((u) => u.email && emails.includes(u.email));
  for (const user of toDelete) {
    await admin.auth.admin.deleteUser(user.id);
  }
  console.log(`\n[e2e] Cleaned up ${toDelete.length}/${emails.length} test account(s).\n`);
}
