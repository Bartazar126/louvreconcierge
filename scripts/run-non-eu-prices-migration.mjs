// Hozzaadja a Non-EU ar oszlopokat a product_prices tablahoz.
//   node scripts/run-non-eu-prices-migration.mjs
//   node scripts/run-non-eu-prices-migration.mjs --revert
import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const { Client } = pg;

function loadEnvFile(path) {
  try {
    const contents = readFileSync(path, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Ignore missing env files.
  }
}

loadEnvFile(resolve(".env.local"));

const isRevert = process.argv.includes("--revert");
const sql = isRevert
  ? `alter table public.product_prices drop column if exists face_value_non_eu;
     alter table public.product_prices drop column if exists eguide_fee_non_eu;
     alter table public.product_prices drop column if exists service_fee_non_eu;`
  : readFileSync(resolve("supabase/product_prices_non_eu.sql"), "utf8");

const ref = new URL(process.env.SUPABASE_URL).hostname.split(".")[0];
const passwords = ["L,PzMFGHMbDXL4$", process.env.SUPABASE_DB_PASSWORD].filter(Boolean);
const hosts = [
  `postgresql://postgres.${ref}:__PW__@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:__PW__@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`,
];

for (const password of passwords) {
  for (const template of hosts) {
    const connectionString = template.replace("__PW__", encodeURIComponent(password));
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
      await client.connect();
      console.log("Connected:", connectionString.replace(/:[^:@/]+@/, ":***@"));
      await client.query(sql);
      const { rows } = await client.query(`
        select column_name from information_schema.columns
        where table_schema = 'public' and table_name = 'product_prices'
          and column_name in ('face_value_non_eu', 'eguide_fee_non_eu', 'service_fee_non_eu')
        order by column_name
      `);
      await client.end();
      console.log(isRevert ? "Revert kesz." : "Migracio kesz.");
      console.log("Non-EU oszlopok:", rows.map((row) => row.column_name).join(", ") || "(nincs)");
      process.exit(0);
    } catch (error) {
      console.log("Failed:", error instanceof Error ? error.message.split("\n")[0] : error);
      try {
        await client.end();
      } catch {
        // Ignore disconnect errors.
      }
    }
  }
}

process.exit(1);
