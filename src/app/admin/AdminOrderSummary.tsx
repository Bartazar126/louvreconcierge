"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { products } from "@/data/site";
import { getParisDateKey } from "@/lib/bookingTime";

export type SummaryOrder = {
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

type ProductBreakdownRow = {
  productId: string;
  label: string;
  orders: number;
  adults: number;
  youth: number;
  children: number;
  infants: number;
  tickets: number;
  revenue: number;
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getDefaultRange() {
  const today = getParisDateKey();
  return { from: `${today.slice(0, 7)}-01`, to: today };
}

function isValidDateKey(value: string) {
  return DATE_KEY_PATTERN.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(Number(amount));
}

function formatRangeLabel(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return `${formatter.format(new Date(`${from}T00:00:00`))} - ${formatter.format(new Date(`${to}T00:00:00`))}`;
}

function getProductName(productId: string, orderType: string) {
  return products.find((product) => product.id === productId)?.name || orderType || productId;
}

async function fetchSummaryOrders(from: string, to: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(`/admin/api/order-summary?${params.toString()}`, {
    signal,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load sales summary.");
  return Array.isArray(result.orders) ? (result.orders as SummaryOrder[]) : [];
}

export function AdminOrderSummary() {
  const defaults = useMemo(() => getDefaultRange(), []);
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [activeRange, setActiveRange] = useState(defaults);
  const [orders, setOrders] = useState<SummaryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async (from: string, to: string) => {
    setIsLoading(true);
    setError("");
    try {
      setOrders(await fetchSummaryOrders(from, to));
      setActiveRange({ from, to });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sales summary.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchSummaryOrders(defaults.from, defaults.to, controller.signal)
      .then((rows) => {
        setOrders(rows);
        setActiveRange(defaults);
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load sales summary.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [defaults]);

  const summary = useMemo(() => {
    const checkoutIds = new Set(
      orders.map((order) => order.stripe_session_id).filter((value): value is string => Boolean(value)),
    );
    const adults = orders.reduce((total, order) => total + order.adult_count, 0);
    const youth = orders.reduce((total, order) => total + order.youth_count, 0);
    const children = orders.reduce((total, order) => total + order.child_count, 0);
    const infants = orders.reduce((total, order) => total + order.infant_count, 0);
    const revenue = orders.reduce((total, order) => total + Number(order.amount), 0);
    const currency = orders[0]?.currency || "EUR";
    const byProduct = new Map<string, ProductBreakdownRow>();

    for (const order of orders) {
      const current = byProduct.get(order.product_id) ?? {
        productId: order.product_id,
        label: getProductName(order.product_id, order.order_type),
        orders: 0,
        adults: 0,
        youth: 0,
        children: 0,
        infants: 0,
        tickets: 0,
        revenue: 0,
      };
      current.orders += 1;
      current.adults += order.adult_count;
      current.youth += order.youth_count;
      current.children += order.child_count;
      current.infants += order.infant_count;
      current.tickets += order.adult_count + order.youth_count + order.child_count + order.infant_count;
      current.revenue += Number(order.amount);
      byProduct.set(order.product_id, current);
    }

    return {
      checkoutCount: checkoutIds.size,
      orderLines: orders.length,
      adults,
      youth,
      children,
      infants,
      tickets: adults + youth + children + infants,
      revenue,
      currency,
      breakdown: [...byProduct.values()].sort((left, right) => right.orders - left.orders),
    };
  }, [orders]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDateKey(fromDate) || !isValidDateKey(toDate) || fromDate > toDate) {
      setError("Select a valid date range.");
      return;
    }
    void loadSummary(fromDate, toDate);
  };

  return (
    <section className="admin-summary-panel" aria-busy={isLoading}>
      <form className="admin-summary-form" onSubmit={handleSubmit}>
        <label>
          Purchase from
          <input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label>
          Purchase to
          <input type="date" value={toDate} min={fromDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
        <button type="submit" className="admin-primary-button" disabled={isLoading}>
          {isLoading ? "Loading..." : "Update summary"}
        </button>
      </form>

      <p className="admin-summary-range">
        Paid orders by purchase date: <strong>{formatRangeLabel(activeRange.from, activeRange.to)}</strong>
      </p>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      <div className={`admin-summary-stats admin-summary-stats-wide${isLoading ? " is-loading" : ""}`}>
        <article className="admin-summary-stat"><span>Orders</span><strong>{summary.checkoutCount}</strong><small>{summary.orderLines} booking lines</small></article>
        <article className="admin-summary-stat"><span>Adult tickets</span><strong>{summary.adults}</strong><small>Paid adult entries</small></article>
        <article className="admin-summary-stat"><span>Youth tickets</span><strong>{summary.youth}</strong><small>12-24 where applicable</small></article>
        <article className="admin-summary-stat"><span>Child tickets</span><strong>{summary.children}</strong><small>Child entries</small></article>
        <article className="admin-summary-stat"><span>Infant tickets</span><strong>{summary.infants}</strong><small>Infant entries</small></article>
        <article className="admin-summary-stat"><span>Revenue</span><strong>{formatAmount(summary.revenue, summary.currency)}</strong><small>{summary.tickets} tickets total</small></article>
      </div>

      {!isLoading && summary.breakdown.length === 0 ? (
        <p className="admin-empty">No paid orders in this date range.</p>
      ) : summary.breakdown.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-orders-table admin-summary-table">
            <thead><tr><th>Product</th><th>Order lines</th><th>Adult</th><th>Youth</th><th>Child</th><th>Infant</th><th>Total tickets</th><th>Revenue</th></tr></thead>
            <tbody>
              {summary.breakdown.map((row) => (
                <tr key={row.productId}><td>{row.label}</td><td>{row.orders}</td><td>{row.adults}</td><td>{row.youth}</td><td>{row.children}</td><td>{row.infants}</td><td>{row.tickets}</td><td>{formatAmount(row.revenue, summary.currency)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
