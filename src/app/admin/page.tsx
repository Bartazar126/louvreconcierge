import type { Metadata } from "next";
import { cookies } from "next/headers";
import { products } from "@/data/site";
import { getProductPricesForAdmin } from "@/lib/products";
import { ADMIN_COOKIE_NAME, isAdminSessionValue } from "@/lib/adminAuth";
import { AvailabilityOverrideRow, getSupabaseAdmin, OrderRow } from "@/lib/supabaseAdmin";
import { AdminAvailabilityCalendar } from "./AdminAvailabilityCalendar";
import { AdminOrderSummary } from "./AdminOrderSummary";
import { AdminProductPrices } from "./AdminProductPrices";
import { loginAdmin, logoutAdmin } from "./actions";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Orders",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    availabilityError?: string;
    availabilityUpdated?: string;
    pricesError?: string;
    pricesUpdated?: string;
  }>;
};

const BASE_ORDER_COLUMNS =
  "id, order_number, combo_group_id, combo_component, created_at, customer_name, email, phone, visit_date, visit_time, order_type, product_id, adults, children, adult_count, youth_count, child_count, infant_count, amount, currency, status, stripe_session_id";
const EU_TICKET_ORDER_COLUMNS = `${BASE_ORDER_COLUMNS}, ticket_region, visitor_names`;

async function fetchAllOrders(selectColumns: string) {
  const pageSize = 1000;
  const supabase = getSupabaseAdmin();
  const orders: OrderRow[] = [];
  let from = 0;

  // Supabase/PostgREST caps a single response at 1000 rows by default.
  // Without pagination the admin summary silently undercounts revenue.
  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .select(selectColumns)
      .not("stripe_session_id", "is", null)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1)
      .returns<OrderRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    const page = data ?? [];
    orders.push(...page);

    if (page.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return orders;
}

async function getOrders() {
  try {
    // Prefer the EU ticket columns; fall back to the original column list if
    // the migration has not been applied (or was reverted).
    try {
      return { orders: await fetchAllOrders(EU_TICKET_ORDER_COLUMNS), error: "" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (!message.includes("ticket_region") && !message.includes("visitor_names")) {
        throw error;
      }

      return { orders: await fetchAllOrders(BASE_ORDER_COLUMNS), error: "" };
    }
  } catch (error) {
    return {
      orders: [],
      error: error instanceof Error ? error.message : "Unable to load orders.",
    };
  }
}

async function getAvailabilityOverrides() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("product_availability_overrides")
      .select("id, created_at, updated_at, product_id, combo_component, visit_date, visit_time, is_closed, note")
      .order("visit_date", { ascending: true })
      .order("visit_time", { ascending: true })
      .returns<AvailabilityOverrideRow[]>();

    if (error) {
      return { availabilityOverrides: [], error: error.message };
    }

    return { availabilityOverrides: data ?? [], error: "" };
  } catch (error) {
    return {
      availabilityOverrides: [],
      error: error instanceof Error ? error.message : "Unable to load availability.",
    };
  }
}

function formatVisitDate(order: OrderRow) {
  const date = new Date(`${order.visit_date}T00:00:00`);

  return `${new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date)} ${order.visit_time}`;
}

function formatAmount(order: OrderRow) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order.currency || "EUR",
  }).format(Number(order.amount));
}

function formatOrderId(order: OrderRow) {
  return String(order.order_number).padStart(4, "0");
}

function formatComboId(order: OrderRow) {
  return order.combo_group_id ? order.combo_group_id.slice(0, 8) : "-";
}

function getProductName(productId: string) {
  return products.find((product) => product.id === productId)?.name || productId;
}

function formatVisitorNames(value: string) {
  const names = value.split(";").map((name) => name.trim()).filter(Boolean);
  const adults: string[] = [];
  const children: string[] = [];
  const untagged: string[] = [];

  for (const name of names) {
    const tag = name.slice(0, 2).toLowerCase();
    if (tag === "a:") {
      adults.push(name.slice(2).trim());
    } else if (tag === "c:") {
      children.push(name.slice(2).trim());
    } else {
      untagged.push(name);
    }
  }

  const parts: string[] = [];
  if (adults.length) parts.push(`Adults: ${adults.join(", ")}`);
  if (children.length) parts.push(`Children: ${children.join(", ")}`);
  if (untagged.length) parts.push(untagged.join(", "));
  return parts.join(" · ");
}

function LoginPanel({ hasError }: { hasError: boolean }) {
  return (
    <main className="admin-page">
      <section className="admin-login-card">
        <span className="admin-eyebrow">Admin</span>
        <h1>Orders Login</h1>
        <p>Enter the admin password to view incoming booking orders.</p>
        <form action={loginAdmin} className="admin-login-form">
          <label>
            Password
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          {hasError ? <p className="admin-error">Invalid admin password.</p> : null}
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}

function OrdersTable({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return <p className="admin-empty">No orders have arrived yet.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Combo</th>
            <th>Name</th>
            <th>Date</th>
            <th>Order Type</th>
            <th>Adult</th>
            <th>Youth</th>
            <th>Child</th>
            <th>Infant</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="admin-order-id">{formatOrderId(order)}</td>
              <td>
                <span className={order.combo_group_id ? "admin-combo-id" : "admin-muted-cell"}>
                  {formatComboId(order)}
                </span>
              </td>
              <td>
                <strong>{order.customer_name}</strong>
                <span>{order.email}</span>
                {order.ticket_region ? (
                  <span>{order.ticket_region === "eu" ? "EU ticket" : "Non-EU ticket"}</span>
                ) : null}
                {order.visitor_names ? <span>{formatVisitorNames(order.visitor_names)}</span> : null}
              </td>
              <td>{formatVisitDate(order)}</td>
              <td>
                {order.order_type}
                {order.combo_component ? <span>{order.combo_component}</span> : null}
                <span className="admin-status">{order.status}</span>
              </td>
              <td>{order.adult_count}</td>
              <td>{order.youth_count}</td>
              <td>{order.child_count}</td>
              <td>{order.infant_count}</td>
              <td>{formatAmount(order)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricesPanel({
  productPrices,
  tableReady,
  storage,
  hasError,
}: {
  productPrices: Awaited<ReturnType<typeof getProductPricesForAdmin>>["rows"];
  tableReady: boolean;
  storage: Awaited<ReturnType<typeof getProductPricesForAdmin>>["storage"];
  hasError: boolean;
}) {
  return (
    <section className="admin-dashboard admin-prices-panel">
      <div className="admin-dashboard-head">
        <div>
          <span className="admin-eyebrow">Pricing</span>
          <h2>Product Prices</h2>
          <p>Set face value, e-guide fee, and service fee per product. Checkout uses these values immediately.</p>
        </div>
      </div>

      {!tableReady ? (
        <p className="admin-error">Unable to load or save prices right now.</p>
      ) : null}

      <AdminProductPrices
        products={products.map((product) => ({ id: product.id, name: product.name }))}
        productPrices={productPrices}
        disabled={!tableReady}
      />

      {hasError ? <p className="admin-error">Unable to load or save prices.</p> : null}
    </section>
  );
}

function AvailabilityPanel({
  availabilityOverrides,
  hasError,
}: {
  availabilityOverrides: AvailabilityOverrideRow[];
  hasError: boolean;
}) {
  return (
    <section className="admin-dashboard admin-availability-panel">
      <div className="admin-dashboard-head">
        <div>
          <span className="admin-eyebrow">Availability</span>
          <h2>Close or Open Dates</h2>
          <p>Manage full-day and time-slot availability per product. Combo products can be closed per component (Louvre, Eiffel, Seine). Paris timezone is used for dates.</p>
        </div>
      </div>

      <AdminAvailabilityCalendar
        products={products.map((product) => ({ id: product.id, name: product.name }))}
        availabilityOverrides={availabilityOverrides}
      />

      {hasError ? <p className="admin-error">Unable to update availability.</p> : null}
    </section>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies();
  const isAuthenticated = isAdminSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    const params = await searchParams;
    return <LoginPanel hasError={params?.error === "1"} />;
  }

  const params = await searchParams;
  const { orders, error } = await getOrders();
  const { availabilityOverrides, error: availabilityLoadError } = await getAvailabilityOverrides();
  const productPriceState = await getProductPricesForAdmin();

  return (
    <main className="admin-page">
      <section className="admin-dashboard admin-summary-dashboard">
        <div className="admin-dashboard-head">
          <div>
            <span className="admin-eyebrow">E-Guide</span>
            <h1>Sales Summary</h1>
            <p>Paid orders, tickets sold, and revenue by purchase date.</p>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="admin-secondary-button">Sign out</button>
          </form>
        </div>
        {error ? <p className="admin-error">Unable to load orders: {error}</p> : null}
        <AdminOrderSummary orders={orders} />
      </section>
      <PricesPanel
        productPrices={productPriceState.rows}
        tableReady={productPriceState.tableReady}
        storage={productPriceState.storage}
        hasError={params?.pricesError === "1"}
      />
      <AvailabilityPanel
        availabilityOverrides={availabilityOverrides}
        hasError={params?.availabilityError === "1" || Boolean(availabilityLoadError)}
      />
      <section className="admin-dashboard admin-orders-panel">
        <div className="admin-dashboard-head">
          <div>
            <span className="admin-eyebrow">Orders</span>
            <h2>Incoming Bookings</h2>
            <p>Incoming booking requests from the checkout flow.</p>
          </div>
        </div>
        <OrdersTable orders={orders} />
      </section>
    </main>
  );
}
