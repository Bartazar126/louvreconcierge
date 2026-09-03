import { getProducts, Locale } from "@/data/i18n";
import { Product, products as defaultProducts } from "@/data/site";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type ProductPriceRow = {
  product_id: string;
  face_value: number;
  eguide_fee: number;
  service_fee: number;
  updated_at: string;
};

export type ProductPriceInput = {
  faceValue: number;
  eGuideFee: number;
  serviceFee: number;
};

export const PRICE_OVERRIDE_DATE = "1970-01-01";
export const PRICE_OVERRIDE_TIME = "__price__";

export function isPriceOverrideRow(override: { visit_date: string; visit_time: string }) {
  return override.visit_date === PRICE_OVERRIDE_DATE && override.visit_time === PRICE_OVERRIDE_TIME;
}

type StoredPriceRow = Pick<ProductPriceRow, "product_id" | "face_value" | "eguide_fee" | "service_fee">;

function parsePriceNote(note: string | null) {
  if (!note) {
    return null;
  }

  try {
    const parsed = JSON.parse(note) as {
      face_value?: number;
      eguide_fee?: number;
      service_fee?: number;
    };

    if (
      typeof parsed.face_value !== "number" ||
      typeof parsed.eguide_fee !== "number" ||
      typeof parsed.service_fee !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function getProductPriceMapFromTable() {
  const { data, error } = await getSupabaseAdmin()
    .from("product_prices")
    .select("product_id, face_value, eguide_fee, service_fee")
    .returns<StoredPriceRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.product_id, row]));
}

async function getProductPriceMapFromOverrides() {
  const { data, error } = await getSupabaseAdmin()
    .from("product_availability_overrides")
    .select("product_id, note, updated_at")
    .eq("visit_date", PRICE_OVERRIDE_DATE)
    .eq("visit_time", PRICE_OVERRIDE_TIME);

  if (error) {
    throw new Error(error.message);
  }

  const priceMap = new Map<string, StoredPriceRow>();

  for (const row of data ?? []) {
    const parsed = parsePriceNote(row.note);

    if (!parsed) {
      continue;
    }

    priceMap.set(row.product_id, {
      product_id: row.product_id,
      face_value: parsed.face_value as number,
      eguide_fee: parsed.eguide_fee as number,
      service_fee: parsed.service_fee as number,
    });
  }

  return priceMap;
}

async function getProductPriceMap() {
  try {
    const tablePrices = await getProductPriceMapFromTable();

    if (tablePrices.size > 0) {
      return { source: "table" as const, priceMap: tablePrices };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("product_prices")) {
      console.error("Unable to load product_prices table:", error);
    }
  }

  try {
    const overridePrices = await getProductPriceMapFromOverrides();

    return { source: overridePrices.size > 0 ? ("overrides" as const) : ("none" as const), priceMap: overridePrices };
  } catch (error) {
    console.error("Unable to load fallback product prices:", error);
    return { source: "none" as const, priceMap: new Map<string, StoredPriceRow>() };
  }
}

async function seedProductPricesToOverrides() {
  const rows = defaultProducts.map((product) => ({
    product_id: product.id,
    combo_component: "*",
    visit_date: PRICE_OVERRIDE_DATE,
    visit_time: PRICE_OVERRIDE_TIME,
    is_closed: false,
    note: JSON.stringify({
      face_value: product.faceValue,
      eguide_fee: product.eGuideFee,
      service_fee: product.serviceFee,
    }),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await getSupabaseAdmin()
    .from("product_availability_overrides")
    .upsert(rows, { onConflict: "product_id,combo_component,visit_date,visit_time" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureProductPricesSeeded() {
  try {
    const rows = defaultProducts.map((product) => ({
      product_id: product.id,
      face_value: product.faceValue,
      eguide_fee: product.eGuideFee,
      service_fee: product.serviceFee,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await getSupabaseAdmin()
      .from("product_prices")
      .upsert(rows, { onConflict: "product_id", ignoreDuplicates: true });

    if (!error) {
      return;
    }
  } catch {
    // Fall back to override storage below.
  }

  await seedProductPricesToOverrides();
}

export async function saveProductPrices(rows: ProductPriceRow[]) {
  try {
    const { error } = await getSupabaseAdmin()
      .from("product_prices")
      .upsert(
        rows.map((row) => ({
          product_id: row.product_id,
          face_value: row.face_value,
          eguide_fee: row.eguide_fee,
          service_fee: row.service_fee,
          updated_at: row.updated_at,
        })),
        { onConflict: "product_id" },
      );

    if (!error) {
      return { storage: "table" as const };
    }
  } catch {
    // Fall back to override storage below.
  }

  const { error } = await getSupabaseAdmin()
    .from("product_availability_overrides")
    .upsert(
      rows.map((row) => ({
        product_id: row.product_id,
        combo_component: "*",
        visit_date: PRICE_OVERRIDE_DATE,
        visit_time: PRICE_OVERRIDE_TIME,
        is_closed: false,
        note: JSON.stringify({
          face_value: row.face_value,
          eguide_fee: row.eguide_fee,
          service_fee: row.service_fee,
        }),
        updated_at: row.updated_at,
      })),
      { onConflict: "product_id,combo_component,visit_date,visit_time" },
    );

  if (error) {
    throw new Error(error.message);
  }

  return { storage: "overrides" as const };
}

function applyPrices(product: Product, priceRow?: StoredPriceRow) {
  if (!priceRow) {
    return product;
  }

  return {
    ...product,
    faceValue: Number(priceRow.face_value),
    eGuideFee: Number(priceRow.eguide_fee),
    serviceFee: Number(priceRow.service_fee),
  };
}

export async function getProductsWithPrices(): Promise<Product[]> {
  let { priceMap } = await getProductPriceMap();

  if (priceMap.size === 0) {
    try {
      await ensureProductPricesSeeded();
      ({ priceMap } = await getProductPriceMap());
    } catch {
      return defaultProducts;
    }
  }

  return defaultProducts.map((product) => applyPrices(product, priceMap.get(product.id)));
}

export async function getLocalizedProductsWithPrices(locale: Locale): Promise<Product[]> {
  const { priceMap } = await getProductPriceMap();

  return getProducts(locale).map((product) => applyPrices(product, priceMap.get(product.id)));
}

export async function getProductPricesForAdmin(): Promise<{
  rows: ProductPriceRow[];
  tableReady: boolean;
  storage: "table" | "overrides" | "defaults";
}> {
  try {
    let { source, priceMap } = await getProductPriceMap();

    if (priceMap.size === 0) {
      await ensureProductPricesSeeded();
      ({ source, priceMap } = await getProductPriceMap());
    }

    return {
      tableReady: true,
      storage: source === "table" ? "table" : source === "overrides" ? "overrides" : "defaults",
      rows: defaultProducts.map((product) => {
        const row = priceMap.get(product.id);

        return {
          product_id: product.id,
          face_value: row ? Number(row.face_value) : product.faceValue,
          eguide_fee: row ? Number(row.eguide_fee) : product.eGuideFee,
          service_fee: row ? Number(row.service_fee) : product.serviceFee,
          updated_at: new Date().toISOString(),
        };
      }),
    };
  } catch (error) {
    console.error("Unable to load admin product prices:", error);

    return {
      tableReady: false,
      storage: "defaults",
      rows: defaultProducts.map((product) => ({
        product_id: product.id,
        face_value: product.faceValue,
        eguide_fee: product.eGuideFee,
        service_fee: product.serviceFee,
        updated_at: new Date().toISOString(),
      })),
    };
  }
}

export async function findProductById(productId: string): Promise<Product | undefined> {
  const products = await getProductsWithPrices();
  return products.find((product) => product.id === productId);
}
