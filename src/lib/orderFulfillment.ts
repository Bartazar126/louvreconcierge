import type Stripe from "stripe";
import { after } from "next/server";
import { products as defaultProducts } from "@/data/site";
import type { OrderEmailComponent, OrderEmailSummary } from "@/lib/email";
import { sendNewOrderNotification, sendOrderConfirmationEmail } from "@/lib/email";
import { findProductById } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripeClient } from "@/lib/stripe";

function getMetadataValue(metadata: Stripe.Metadata | null, key: string) {
  return metadata?.[key]?.trim() || "";
}

function getMetadataInteger(metadata: Stripe.Metadata | null, key: string) {
  const value = Number.parseInt(getMetadataValue(metadata, key), 10);

  return Number.isInteger(value) ? value : 0;
}

function getMetadataAmount(metadata: Stripe.Metadata | null, key: string) {
  const value = Number.parseFloat(getMetadataValue(metadata, key));

  return Number.isFinite(value) ? value : 0;
}

async function orderExistsForSession(sessionId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

async function resolveSessionProduct(session: Stripe.Checkout.Session) {
  const productId = getMetadataValue(session.metadata, "productId");

  return (await findProductById(productId)) ?? defaultProducts.find((item) => item.id === productId);
}

async function buildOrderRows(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const product = await resolveSessionProduct(session);

  if (!product) {
    throw new Error("Checkout session is missing a valid product.");
  }

  const customerName = getMetadataValue(metadata, "customerName");
  const email = session.customer_email || session.customer_details?.email || "";
  const phone = getMetadataValue(metadata, "phone") || null;
  const isCombo = getMetadataValue(metadata, "isCombo") === "true";
  const comboGroupId = getMetadataValue(metadata, "comboGroupId") || null;
  const stripeSessionId = session.id;

  if (!customerName || !email || !stripeSessionId) {
    throw new Error("Checkout session is missing required customer details.");
  }

  // EU ticket metadata is optional: older sessions (and the reverted flow)
  // simply leave these null. Visitor names may be chunked across keys because
  // Stripe caps metadata values at 500 characters.
  const ticketRegion = getMetadataValue(metadata, "ticketRegion") || null;
  const visitorNames =
    ["visitorNames", "visitorNames2", "visitorNames3", "visitorNames4"]
      .map((key) => metadata?.[key] ?? "")
      .join("")
      .trim() || null;

  const baseOrderRow = {
    customer_name: customerName,
    email,
    phone,
    product_id: product.id,
    currency: "EUR",
    status: "paid",
    stripe_session_id: stripeSessionId,
    combo_group_id: comboGroupId,
    ticket_region: ticketRegion,
    visitor_names: visitorNames,
  };

  if (isCombo) {
    const louvreDate = getMetadataValue(metadata, "louvreDate");
    const louvreSlot = getMetadataValue(metadata, "louvreTime");
    const extraDate = getMetadataValue(metadata, "extraDate");
    const extraSlot = getMetadataValue(metadata, "extraTime");
    const louvreAdults = getMetadataInteger(metadata, "louvreAdults");
    const louvreChildren = getMetadataInteger(metadata, "louvreChildren");
    const extraAdults = getMetadataInteger(metadata, "extraAdults");
    const extraYouth = getMetadataInteger(metadata, "extraYouth");
    const extraChildren = getMetadataInteger(metadata, "extraChildren");
    const extraInfants = getMetadataInteger(metadata, "extraInfants");
    const louvreAmount = getMetadataAmount(metadata, "louvreAmount");
    const extraAmount = getMetadataAmount(metadata, "extraAmount");
    const comboExtraComponent = getMetadataValue(metadata, "comboExtraComponent") || product.comboExtraComponent || "combo";

    return [
      {
        ...baseOrderRow,
        order_type: "Louvre Museum component",
        visit_date: louvreDate,
        visit_time: louvreSlot,
        adults: louvreAdults,
        children: louvreChildren,
        adult_count: louvreAdults,
        youth_count: 0,
        child_count: louvreChildren,
        infant_count: 0,
        combo_component: "louvre",
        amount: louvreAmount,
      },
      {
        ...baseOrderRow,
        order_type: product.comboExtraName || "Combo component",
        visit_date: extraDate,
        visit_time: extraSlot,
        adults: extraAdults,
        children: extraChildren,
        adult_count: extraAdults,
        youth_count: product.comboExtraComponent === "eiffel" ? extraYouth : 0,
        child_count: extraChildren,
        infant_count: product.comboExtraComponent === "eiffel" ? extraInfants : 0,
        combo_component: comboExtraComponent,
        amount: extraAmount,
      },
    ];
  }

  const visitDate = getMetadataValue(metadata, "visitDate");
  const visitTime = getMetadataValue(metadata, "visitTime");
  const adults = getMetadataInteger(metadata, "adults");
  const children = getMetadataInteger(metadata, "children");
  const totalAmount = getMetadataAmount(metadata, "totalAmount");

  return [
    {
      ...baseOrderRow,
      order_type: product.name,
      visit_date: visitDate,
      visit_time: visitTime,
      adults,
      children,
      adult_count: adults,
      youth_count: 0,
      child_count: children,
      infant_count: 0,
      combo_component: null,
      amount: totalAmount,
    },
  ];
}

export type ConversionData = {
  transactionId: string;
  value: number;
  currency: string;
};

export type OrderFulfillmentResult =
  | { ok: true; reason: "created" | "already_exists"; conversion: ConversionData }
  | { ok: false; reason: "unpaid" | "invalid_session" };

function getConversionDataFromSession(session: Stripe.Checkout.Session): ConversionData {
  const value =
    typeof session.amount_total === "number" ? session.amount_total / 100 : 1;
  const currency = (session.currency || "eur").toUpperCase();

  return {
    transactionId: session.id,
    value,
    currency,
  };
}

type OrderRow = Awaited<ReturnType<typeof buildOrderRows>>[number];

// A latogatonevek "A:" / "C:" elotaggal tarolodnak (felnott / gyerek).
function splitVisitorNames(value: string | null | undefined) {
  const names = (value || "")
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);
  const adultNames: string[] = [];
  const childNames: string[] = [];

  for (const name of names) {
    const tag = name.slice(0, 2).toLowerCase();

    if (tag === "c:") {
      childNames.push(name.slice(2).trim());
    } else if (tag === "a:") {
      adultNames.push(name.slice(2).trim());
    } else {
      adultNames.push(name);
    }
  }

  return { adultNames, childNames };
}

async function lookupOrderReference(sessionId: string) {
  try {
    const { data } = await getSupabaseAdmin()
      .from("orders")
      .select("order_number")
      .eq("stripe_session_id", sessionId)
      .order("order_number", { ascending: true })
      .limit(1)
      .returns<Array<{ order_number: number | null }>>();
    const orderNumber = data?.[0]?.order_number;

    if (typeof orderNumber === "number") {
      return `#${String(orderNumber).padStart(4, "0")}`;
    }
  } catch (error) {
    console.error("Unable to load order reference:", error);
  }

  return sessionId;
}

async function sendOrderEmails(session: Stripe.Checkout.Session, orderRows: OrderRow[]) {
  const [firstRow] = orderRows;
  const product = await resolveSessionProduct(session);

  if (!firstRow || !product) {
    return;
  }

  const components: OrderEmailComponent[] = orderRows.map((row) => ({
    label: row.order_type,
    visitDate: row.visit_date,
    visitTime: row.visit_time,
    adults: row.adult_count,
    youth: row.youth_count,
    children: row.child_count,
    infants: row.infant_count,
    amount: Number(row.amount) || 0,
  }));
  const { adultNames, childNames } = splitVisitorNames(firstRow.visitor_names);
  const totalAmount =
    typeof session.amount_total === "number"
      ? session.amount_total / 100
      : components.reduce((sum, component) => sum + component.amount, 0);

  const summary: OrderEmailSummary = {
    customerName: firstRow.customer_name,
    email: firstRow.email,
    productName: product.name,
    productAddress: product.address,
    productDuration: product.duration,
    ticketRegion: firstRow.ticket_region,
    adultNames,
    childNames,
    components,
    totalAmount,
    currency: (session.currency || "eur").toUpperCase(),
    reference: await lookupOrderReference(session.id),
  };

  await Promise.allSettled([
    sendOrderConfirmationEmail(summary),
    sendNewOrderNotification(summary),
  ]);
}

// A leveleket a valasz elkuldese utan kuldjuk ki, hogy ne lassitsak a
// koszono oldalt, es egy SMTP hiba se akadalyozza meg a rendeles rogziteset.
function scheduleOrderEmails(session: Stripe.Checkout.Session, orderRows: OrderRow[]) {
  const task = async () => {
    try {
      await sendOrderEmails(session, orderRows);
    } catch (error) {
      console.error("Order confirmation email failed:", error);
    }
  };

  try {
    after(task);
  } catch {
    void task();
  }
}

export async function fulfillOrderFromStripeSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" || session.status !== "complete") {
    return { ok: false as const, reason: "unpaid" as const };
  }

  if (!session.id) {
    throw new Error("Checkout session is missing an ID.");
  }

  if (await orderExistsForSession(session.id)) {
    return {
      ok: true as const,
      reason: "already_exists" as const,
      conversion: getConversionDataFromSession(session),
    };
  }

  const orderRows = await buildOrderRows(session);
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .insert(orderRows as Array<Record<string, string | number | null>>);

  if (error) {
    // If the EU ticket columns are missing (migration not applied, or
    // reverted), store the order without them instead of losing it.
    const isEuColumnError =
      error.message.includes("ticket_region") || error.message.includes("visitor_names");

    if (!isEuColumnError) {
      throw new Error(error.message);
    }

    const legacyRows = orderRows.map((row) => {
      const legacyRow = { ...row } as Record<string, string | number | null>;
      delete legacyRow.ticket_region;
      delete legacyRow.visitor_names;
      return legacyRow;
    });

    const { error: legacyError } = await getSupabaseAdmin().from("orders").insert(legacyRows);

    if (legacyError) {
      throw new Error(legacyError.message);
    }
  }

  scheduleOrderEmails(session, orderRows);

  return {
    ok: true as const,
    reason: "created" as const,
    conversion: getConversionDataFromSession(session),
  };
}

export async function getConversionDataFromSessionId(
  sessionId: string,
): Promise<ConversionData | null> {
  const stripe = getStripeClient();

  if (!stripe || !sessionId.startsWith("cs_")) {
    return null;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid" || session.status !== "complete") {
    return null;
  }

  return getConversionDataFromSession(session);
}

export async function fulfillOrderFromSessionId(sessionId: string): Promise<OrderFulfillmentResult> {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  if (!sessionId.startsWith("cs_")) {
    return { ok: false, reason: "invalid_session" };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return fulfillOrderFromStripeSession(session);
}
