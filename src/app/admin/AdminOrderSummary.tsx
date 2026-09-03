"use client";

import { useDeferredValue, useMemo, useState } from "react";
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

type AdminOrderSummaryProps = {
  orders: SummaryOrder[];
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

type IndexedOrder = SummaryOrder & {
  purchaseDate: string;
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getDefaultRange() {
  const today = getParisDateKey();
  const monthStart = `${today.slice(0, 7)}-01`;

  return {
    from: monthStart,
    to: today,
  };
}

function isValidDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function getParisOrderDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(createdAt));
}

function getTicketCount(order: SummaryOrder) {
  return order.adult_count + order.youth_count + order.child_count + order.infant_count;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(Number(amount));
}

function formatRangeLabel(from: string, to: string) {
  if (!isValidDateKey(from) || !isValidDateKey(to)) {
    return "Select a valid date range";
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return `${formatter.format(new Date(`${from}T00:00:00`))} – ${formatter.format(new Date(`${to}T00:00:00`))}`;
}

function getProductName(productId: string, orderType: string) {
  return products.find((product) => product.id === productId)?.name || orderType || productId;
}

export function AdminOrderSummary({ orders }: AdminOrderSummaryProps) {
  const defaults = getDefaultRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const deferredFromDate = useDeferredValue(fromDate);
  const deferredToDate = useDeferredValue(toDate);

  // Index purchase dates once so date typing doesn't reformat thousands of timestamps.
  const indexedOrders = useMemo<IndexedOrder[]>(
    () =>
      orders.map((order) => ({
        ...order,
        purchaseDate: getParisOrderDate(order.created_at),
      })),
    [orders],
  );

  const summary = useMemo(() => {
    const rangeStart = isValidDateKey(deferredFromDate) ? deferredFromDate : defaults.from;
    const rawEnd = isValidDateKey(deferredToDate) ? deferredToDate : defaults.to;
    const rangeEnd = rawEnd >= rangeStart ? rawEnd : rangeStart;

    const filtered = indexedOrders.filter((order) => {
      if (order.status !== "paid" || !order.stripe_session_id) {
        return false;
      }

      return order.purchaseDate >= rangeStart && order.purchaseDate <= rangeEnd;
    });

    const checkoutIds = new Set(
      filtered.map((order) => order.stripe_session_id).filter((value): value is string => Boolean(value)),
    );

    const adults = filtered.reduce((total, order) => total + order.adult_count, 0);
    const youth = filtered.reduce((total, order) => total + order.youth_count, 0);
    const children = filtered.reduce((total, order) => total + order.child_count, 0);
    const infants = filtered.reduce((total, order) => total + order.infant_count, 0);
    const tickets = adults + youth + children + infants;
    const revenue = filtered.reduce((total, order) => total + Number(order.amount), 0);
    const currency = filtered[0]?.currency || "EUR";

    const byProduct = new Map<string, ProductBreakdownRow>();

    for (const order of filtered) {
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
      current.tickets += getTicketCount(order);
      current.revenue += Number(order.amount);
      byProduct.set(order.product_id, current);
    }

    return {
      rangeStart,
      rangeEnd,
      checkoutCount: checkoutIds.size,
      orderLines: filtered.length,
      adults,
      youth,
      children,
      infants,
      tickets,
      revenue,
      currency,
      breakdown: [...byProduct.values()].sort((left, right) => right.orders - left.orders),
    };
  }, [defaults.from, defaults.to, deferredFromDate, deferredToDate, indexedOrders]);

  return (
    <section className="admin-summary-panel">
      <div className="admin-summary-form">
        <label>
          Purchase from
          <input
            type="date"
            value={fromDate}
            max={isValidDateKey(toDate) ? toDate : undefined}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label>
          Purchase to
          <input
            type="date"
            value={toDate}
            min={isValidDateKey(fromDate) ? fromDate : undefined}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
      </div>

      <p className="admin-summary-range">
        Showing paid orders by <strong>purchase date</strong> (when checkout completed), between{" "}
        <strong>{formatRangeLabel(summary.rangeStart, summary.rangeEnd)}</strong> — not by visit date.
      </p>

      <div className="admin-summary-stats admin-summary-stats-wide">
        <article className="admin-summary-stat">
          <span>Orders received</span>
          <strong>{summary.checkoutCount}</strong>
          <small>
            {summary.orderLines} booking line{summary.orderLines === 1 ? "" : "s"} in database
          </small>
        </article>
        <article className="admin-summary-stat">
          <span>Adult tickets</span>
          <strong>{summary.adults}</strong>
          <small>Paid adult entries</small>
        </article>
        <article className="admin-summary-stat">
          <span>Youth tickets</span>
          <strong>{summary.youth}</strong>
          <small>12–24 age band where applicable</small>
        </article>
        <article className="admin-summary-stat">
          <span>Child tickets</span>
          <strong>{summary.children}</strong>
          <small>Child entries</small>
        </article>
        <article className="admin-summary-stat">
          <span>Infant tickets</span>
          <strong>{summary.infants}</strong>
          <small>Infant entries where applicable</small>
        </article>
        <article className="admin-summary-stat">
          <span>Revenue</span>
          <strong>{formatAmount(summary.revenue, summary.currency)}</strong>
          <small>{summary.tickets} tickets total in range</small>
        </article>
      </div>

      {summary.breakdown.length === 0 ? (
        <p className="admin-empty">No paid orders in this date range.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-orders-table admin-summary-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order lines</th>
                <th>Adult</th>
                <th>Youth</th>
                <th>Child</th>
                <th>Infant</th>
                <th>Total tickets</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summary.breakdown.map((row) => (
                <tr key={row.productId}>
                  <td>{row.label}</td>
                  <td>{row.orders}</td>
                  <td>{row.adults}</td>
                  <td>{row.youth}</td>
                  <td>{row.children}</td>
                  <td>{row.infants}</td>
                  <td>{row.tickets}</td>
                  <td>{formatAmount(row.revenue, summary.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
