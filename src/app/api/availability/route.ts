import { products, timeSlots } from "@/data/site";
import { getClosedDatesForMonth, getClosedSlotsForDate, getMonthDateKeys, isDayFullyClosed } from "@/lib/availability";
import { getParisDateKey } from "@/lib/bookingTime";
import {
  COMBO_COMPONENT_ALL,
  isLouvreComponentDateClosed,
  matchesAvailabilityComponent,
  normalizeComboComponent,
} from "@/lib/comboAvailability";
import { isPriceOverrideRow } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId")?.trim() || "";
  const date = searchParams.get("date")?.trim() || "";
  const month = searchParams.get("month")?.trim() || "";
  const comboComponent = normalizeComboComponent(searchParams.get("component"));

  if (!products.some((product) => product.id === productId)) {
    return Response.json({ error: "Missing or invalid availability request." }, { status: 400 });
  }

  try {
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return Response.json({ error: "Missing or invalid availability request." }, { status: 400 });
      }

      const [year, monthNumber] = month.split("-").map(Number);
      const monthStart = `${month}-01`;
      const monthEnd = `${month}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`;

      const { data, error } = await getSupabaseAdmin()
        .from("product_availability_overrides")
        .select("product_id, combo_component, visit_date, visit_time, is_closed")
        .eq("product_id", productId)
        .gte("visit_date", monthStart)
        .lte("visit_date", monthEnd)
        .neq("visit_time", "__price__");

      if (error) {
        throw new Error(error.message);
      }

      const closedDates = getClosedDatesForMonth(
        data ?? [],
        productId,
        month,
        getParisDateKey(),
        comboComponent,
      );

      // Ismétlődő zárás: a Louvre keddenként zárva (kombó Louvre-komponens).
      const today = getParisDateKey();
      const recurringClosedDates = getMonthDateKeys(month).filter(
        (dateKey) => dateKey >= today && isLouvreComponentDateClosed(comboComponent, dateKey),
      );

      return Response.json({
        closedDates: Array.from(new Set([...closedDates, ...recurringClosedDates])).sort(),
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: "Missing or invalid availability request." }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("product_availability_overrides")
      .select("visit_time, combo_component, is_closed")
      .eq("product_id", productId)
      .eq("visit_date", date);

    if (error) {
      throw new Error(error.message);
    }

    const availabilityRows = (data ?? []).filter(
      (row) =>
        !isPriceOverrideRow({ visit_date: date, visit_time: row.visit_time }) &&
        matchesAvailabilityComponent(row.combo_component, comboComponent),
    );
    if (isLouvreComponentDateClosed(comboComponent, date)) {
      return Response.json({ closedSlots: [...timeSlots], dayClosed: true });
    }

    const closedSlots = getClosedSlotsForDate(availabilityRows, date);
    const dayClosed = isDayFullyClosed(availabilityRows, date);

    return Response.json({
      closedSlots: Array.from(closedSlots),
      dayClosed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load availability.";

    console.error("Availability lookup failed:", error);

    return Response.json(
      {
        error: process.env.NODE_ENV === "production"
          ? "Unable to load availability."
          : `Unable to load availability: ${message}`,
      },
      { status: 502 },
    );
  }
}
