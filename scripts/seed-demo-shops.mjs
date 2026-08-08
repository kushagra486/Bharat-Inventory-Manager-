// One-off script: creates 5 demo owner accounts (one per shop) through the
// normal public sign-up flow and populates each with categories + products
// from scripts/demo-data.json, so the marketplace has realistic browsable
// inventory to demo. Uses only the publishable (anon) key — every write goes
// through RLS as the authenticated demo user, exactly like the real app does.
// (No SUPABASE_SERVICE_ROLE_KEY is configured in this environment, so this
// intentionally avoids needing one.)
//
// Usage: node --env-file=.env.local scripts/seed-demo-shops.mjs
//
// Safe to re-run: signs back into an existing demo account instead of
// re-registering it, and wipes+reinserts that account's categories/products
// rather than duplicating them.

import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the environment.");
  process.exit(1);
}

const DEMO_PASSWORD = "BharatDemo2026!";

const CATEGORY_META = {
  "Dairy & Bakery": { icon: "🥛", color: "#60A5FA" },
  Fruits: { icon: "🍎", color: "#F87171" },
  Vegetables: { icon: "🥕", color: "#FB923C" },
  "Staples & Pulses": { icon: "🌾", color: "#D6A75B" },
  "Cooking & Snacks": { icon: "🍿", color: "#FBBF24" },
  "Cleaning & Home Care": { icon: "🧹", color: "#34D399" },
  "Personal Care": { icon: "🧴", color: "#A78BFA" },
  "Beverages & Frozen": { icon: "🧊", color: "#38BDF8" },
  "Daily Essentials": { icon: "🧺", color: "#60A5FA" },
  "Food & Drinks": { icon: "🥤", color: "#FB923C" },
  Household: { icon: "🏠", color: "#34D399" },
  "Utility & Mobile": { icon: "🔌", color: "#FBBF24" },
  Stationery: { icon: "✏️", color: "#A78BFA" },
  "Baby & Kids": { icon: "🍼", color: "#F472B6" },
  Mobiles: { icon: "📱", color: "#60A5FA" },
  Computers: { icon: "💻", color: "#818CF8" },
  "Audio & Wearables": { icon: "🎧", color: "#34D399" },
  "Mobile Accessories": { icon: "🔋", color: "#FBBF24" },
  "Electrical Solutions": { icon: "💡", color: "#FB923C" },
  "Gaming & Smart Accessories": { icon: "🎮", color: "#A78BFA" },
  "Women - Skin Care": { icon: "🧴", color: "#F472B6" },
  "Women - Makeup": { icon: "💄", color: "#FB7185" },
  "Hair Care": { icon: "💇", color: "#A78BFA" },
  "Men - Grooming": { icon: "🪒", color: "#60A5FA" },
  "Body & Hygiene": { icon: "🧼", color: "#34D399" },
  "Fragrance & Grooming Tools": { icon: "🌸", color: "#FB7185" },
  Writing: { icon: "🖊️", color: "#60A5FA" },
  "Paper & Notebooks": { icon: "📓", color: "#FBBF24" },
  "School Supplies": { icon: "🎒", color: "#34D399" },
  "Office Supplies": { icon: "📎", color: "#818CF8" },
  "Art & Craft": { icon: "🎨", color: "#FB923C" },
};

const SHOPS = [
  {
    sheet: "Shop 1 Inventory",
    email: "demo.grocery@bharatinventory.demo",
    fullName: "Demo Owner - Grocery",
    businessName: "Bharat Grocery Store",
    deliveryEstimate: "30-45 min",
    serviceArea: "Koramangala, Bengaluru",
    imageDir: "shop1-grocery",
  },
  {
    sheet: "Shop 2 Inventory",
    email: "demo.general@bharatinventory.demo",
    fullName: "Demo Owner - General Store",
    businessName: "Bharat General Store",
    deliveryEstimate: "20-30 min",
    serviceArea: "Indiranagar, Bengaluru",
    imageDir: "shop2-general",
  },
  {
    sheet: "Shop 3 Inventory",
    email: "demo.electronics@bharatinventory.demo",
    fullName: "Demo Owner - Electronics",
    businessName: "Bharat Electronics Hub",
    deliveryEstimate: "45-60 min",
    serviceArea: "MG Road, Bengaluru",
    imageDir: "shop3-electronics",
  },
  {
    sheet: "Shop 4 Inventory",
    email: "demo.cosmetics@bharatinventory.demo",
    fullName: "Demo Owner - Beauty & Care",
    businessName: "Bharat Beauty & Care",
    deliveryEstimate: "30-45 min",
    serviceArea: "HSR Layout, Bengaluru",
    imageDir: "shop4-cosmetics",
  },
  {
    sheet: "Shop 5 Inventory",
    email: "demo.stationery@bharatinventory.demo",
    fullName: "Demo Owner - Stationery",
    businessName: "Bharat Stationery Mart",
    deliveryEstimate: "20-30 min",
    serviceArea: "Jayanagar, Bengaluru",
    imageDir: "shop5-stationery",
  },
];

function unitFromPack(pack) {
  if (!pack) return "pcs";
  const words = String(pack).trim().split(/\s+/);
  return words[words.length - 1];
}

async function ensureDemoSession(shop) {
  // A fresh anon client per shop, so each demo user's session stays isolated.
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const signIn = await client.auth.signInWithPassword({ email: shop.email, password: DEMO_PASSWORD });
  if (signIn.data.session) return { client, userId: signIn.data.user.id };

  const signUp = await client.auth.signUp({
    email: shop.email,
    password: DEMO_PASSWORD,
    options: { data: { full_name: shop.fullName } },
  });
  if (signUp.error) throw signUp.error;
  if (!signUp.data.session) {
    throw new Error(`Sign-up for ${shop.email} did not return a session (email confirmation may be required).`);
  }
  return { client, userId: signUp.data.user.id };
}

async function seedShop(shop, items) {
  console.log(`\n=== ${shop.businessName} (${shop.email}) ===`);
  const { client, userId } = await ensureDemoSession(shop);
  console.log("user_id:", userId);

  const { error: profileError } = await client.from("user_profiles").upsert(
    {
      id: userId,
      full_name: shop.fullName,
      business_name: shop.businessName,
      delivery_estimate: shop.deliveryEstimate,
      service_area: shop.serviceArea,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  // Wipe this demo owner's previous categories/products so re-runs don't duplicate.
  await client.from("products").delete().eq("user_id", userId);
  await client.from("categories").delete().eq("user_id", userId);

  const categoryNames = [...new Set(items.map((it) => it.category))];
  const categoryRows = categoryNames.map((name) => ({
    name,
    icon: CATEGORY_META[name]?.icon ?? "🛍️",
    color: CATEGORY_META[name]?.color ?? "#94A3B8",
    user_id: userId,
  }));
  const { data: insertedCategories, error: catError } = await client
    .from("categories")
    .insert(categoryRows)
    .select("id, name");
  if (catError) throw catError;
  const categoryIdByName = new Map(insertedCategories.map((c) => [c.name, c.id]));

  const imageDirAbs = path.join(repoRoot, "public", "demo-products", shop.imageDir);
  const productRows = items.map((it) => {
    const imagePath = path.join(imageDirAbs, `${it.code}.png`);
    const hasImage = existsSync(imagePath);
    return {
      user_id: userId,
      category_id: categoryIdByName.get(it.category) ?? null,
      name: it.name,
      unit: unitFromPack(it.pack),
      quantity: 10,
      price: it.price,
      expiry_date: "2027-12-31",
      manufacture_date: "2026-01-01",
      batch_number: it.code,
      barcode: null,
      image_url: hasImage ? `/demo-products/${shop.imageDir}/${it.code}.png` : null,
      notes: `Pack: ${it.pack}`,
      is_archived: false,
    };
  });

  const { error: prodError } = await client.from("products").insert(productRows);
  if (prodError) throw prodError;

  const withImages = productRows.filter((p) => p.image_url).length;
  console.log(`Inserted ${insertedCategories.length} categories, ${productRows.length} products (${withImages} with photos).`);
}

async function main() {
  const demoData = JSON.parse(await readFile(path.join(__dirname, "demo-data.json"), "utf-8"));
  for (const shop of SHOPS) {
    const items = demoData[shop.sheet];
    if (!items || items.length === 0) throw new Error(`No items found for ${shop.sheet} in demo-data.json`);
    await seedShop(shop, items);
  }
  console.log("\nAll demo shops seeded. Shared demo password:", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
