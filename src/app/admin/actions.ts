"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { products, timeSlots } from "@/data/site";
import {
  COMBO_COMPONENT_ALL,
  isValidComboAvailabilityComponent,
  normalizeComboComponent,
} from "@/lib/comboAvailability";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionValue,
  isAdminPassword,
  isAdminSessionValue,
} from "@/lib/adminAuth";
import { buildAvailabilityOpenPlan } from "@/lib/availabilityAdmin";
import { saveProductPrices } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type ActionResult = {
  ok: boolean;
  error?: string;
  change?: {
    productId: string;
    comboComponent: string;
    visitDate: string;
    visitTime: string;
    intent: "close" | "open";
    note: string | null;
  };
};

async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isAdminSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

async function requireAdmin() {
  const cookieStore = await cookies();

  if (!isAdminSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/admin?error=1");
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getPrice(formData: FormData, key: string) {
  const value = Number.parseFloat(getString(formData, key));

  return Number.isFinite(value) && value >= 0 ? value : null;
}

export async function loginAdmin(formData: FormData) {
  if (!isAdminPassword(formData.get("password"))) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), adminCookieOptions);

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  redirect("/admin");
}

export async function setAvailabilityOverride(formData: FormData): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized." };
  }

  const productId = getString(formData, "productId");
  const comboComponent = normalizeComboComponent(getString(formData, "comboComponent"));
  const visitDate = getString(formData, "visitDate");
  const visitTime = getString(formData, "visitTime") || "*";
  const intent = getString(formData, "intent");
  const note = getString(formData, "note");
  const selectedProduct = products.find((product) => product.id === productId);
  const isValidProduct = Boolean(selectedProduct);
  const isValidTime = visitTime === "*" || timeSlots.includes(visitTime);
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(visitDate);
  const isValidComponent =
    comboComponent === COMBO_COMPONENT_ALL ||
    (selectedProduct ? isValidComboAvailabilityComponent(selectedProduct, comboComponent) : false);

  if (!isValidProduct || !isValidDate || !isValidTime || !isValidComponent || !["close", "open"].includes(intent)) {
    return { ok: false, error: "Invalid availability request." };
  }

  const supabase = getSupabaseAdmin();

  if (intent === "open") {
    const { data: existingRows, error: existingError } = await supabase
      .from("product_availability_overrides")
      .select("combo_component, visit_time, is_closed")
      .eq("product_id", productId)
      .eq("visit_date", visitDate);

    if (existingError) {
      console.error("Availability override lookup failed:", existingError);
      return { ok: false, error: "Unable to update availability." };
    }

    const openPlan = buildAvailabilityOpenPlan(
      existingRows ?? [],
      productId,
      comboComponent,
      visitDate,
      visitTime,
    );

    for (const filter of openPlan.deleteFilters) {
      let query = supabase
        .from("product_availability_overrides")
        .delete()
        .eq("product_id", filter.product_id)
        .eq("combo_component", filter.combo_component)
        .eq("visit_date", filter.visit_date);

      if (filter.visit_time) {
        query = query.eq("visit_time", filter.visit_time);
      }

      const { error } = await query;

      if (error) {
        console.error("Availability override delete failed:", error);
        return { ok: false, error: "Unable to update availability." };
      }
    }

    if (openPlan.upserts.length > 0) {
      const { error } = await supabase
        .from("product_availability_overrides")
        .upsert(openPlan.upserts, {
          onConflict: "product_id,combo_component,visit_date,visit_time",
        });

      if (error) {
        console.error("Availability override reopen failed:", error);
        return { ok: false, error: "Unable to update availability." };
      }
    }
  } else {
    const { error } = await supabase
      .from("product_availability_overrides")
      .upsert(
        {
          product_id: productId,
          combo_component: comboComponent,
          visit_date: visitDate,
          visit_time: visitTime,
          is_closed: true,
          note: note || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id,combo_component,visit_date,visit_time" },
      );

    if (error) {
      console.error("Availability override update failed:", error);
      return { ok: false, error: "Unable to update availability." };
    }
  }

  revalidatePath("/api/availability");
  revalidatePath("/admin");

  return {
    ok: true,
    change: {
      productId,
      comboComponent,
      visitDate,
      visitTime,
      intent: intent as "close" | "open",
      note: note || null,
    },
  };
}

export async function updateProductPrices(formData: FormData): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized." };
  }

  const rows = products.map((product) => {
    const faceValue = getPrice(formData, `${product.id}-faceValue`);
    const eGuideFee = getPrice(formData, `${product.id}-eGuideFee`);
    const serviceFee = getPrice(formData, `${product.id}-serviceFee`);

    if (faceValue === null || eGuideFee === null || serviceFee === null) {
      return null;
    }

    return {
      product_id: product.id,
      face_value: faceValue,
      eguide_fee: eGuideFee,
      service_fee: serviceFee,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.some((row) => row === null)) {
    return { ok: false, error: "Invalid price values." };
  }

  try {
    await saveProductPrices(rows as Array<{
      product_id: string;
      face_value: number;
      eguide_fee: number;
      service_fee: number;
      updated_at: string;
    }>);
  } catch (error) {
    console.error("Product price update failed:", error);
    return { ok: false, error: "Unable to update prices." };
  }

  revalidatePath("/admin");
  revalidatePath("/");

  return { ok: true };
}
