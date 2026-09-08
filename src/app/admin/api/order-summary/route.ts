import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isAdminSessionValue } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type SummaryOrder = {
  created_at: string;
  product_id: string;
  order_type: string;
  adult_count: number;
  youth_count: number;
  child_count: number;
  infant_count: number;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string | null;
};

const SUMMARY_COLUMNS =
  "created_at, product_id, order_type, adult_count, youth_count, child_count, infant_count, amount, currency, status, stripe_session_id";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PAGE_SIZE = 1000;

function isValidDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function shiftDateKey(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getParisDateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!isAdminSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() || "";
  const to = searchParams.get("to")?.trim() || "";
  if (!isValidDateKey(from) || !isValidDateKey(to) || from > to) {
    return Response.json({ error: "Invalid date range." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const queryStart = `${shiftDateKey(from, -1)}T00:00:00.000Z`;
    const queryEnd = `${shiftDateKey(to, 2)}T00:00:00.000Z`;
    const baseQuery = () =>
      supabase
        .from("orders")
        .select(SUMMARY_COLUMNS)
        .eq("status", "paid")
        .not("stripe_session_id", "is", null)
        .gte("created_at", queryStart)
        .lt("created_at", queryEnd);

    const { count, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid")
      .not("stripe_session_id", "is", null)
      .gte("created_at", queryStart)
      .lt("created_at", queryEnd);
    if (countError) throw new Error(countError.message);

    const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
    const pages = await Promise.all(
      Array.from({ length: pageCount }, (_, index) =>
        baseQuery()
          .order("created_at", { ascending: false })
          .range(index * PAGE_SIZE, index * PAGE_SIZE + PAGE_SIZE - 1)
          .returns<SummaryOrder[]>(),
      ),
    );
    const orders: SummaryOrder[] = [];
    for (const page of pages) {
      if (page.error) throw new Error(page.error.message);
      orders.push(...(page.data ?? []));
    }

    return Response.json(
      {
        orders: orders.filter((order) => {
          const dateKey = getParisDateKey(order.created_at);
          return dateKey >= from && dateKey <= to;
        }),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Admin summary lookup failed:", error);
    return Response.json({ error: "Unable to load sales summary." }, { status: 502 });
  }
}
