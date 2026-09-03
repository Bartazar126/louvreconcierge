import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import {
  getComboComponentAmount,
  getComboExtraUnitPrice,
  getProductUnitPrice,
  isComboProduct,
  isValidComboParticipantSelection,
  siteUrl,
  timeSlots,
} from "@/data/site";
import { EU_TICKET_FEATURE_ENABLED, isTicketRegion } from "@/data/features";
import { isSlotPastCutoff } from "@/lib/bookingTime";
import {
  COMBO_COMPONENT_ALL,
  isLouvreComponentDateClosed,
  matchesAvailabilityComponent,
} from "@/lib/comboAvailability";
import { findProductById } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutRequest = {
  productId?: string;
  date?: string;
  slot?: string;
  adults?: number;
  youth?: number;
  children?: number;
  infants?: number;
  comboComponents?: {
    louvre?: {
      date?: string;
      slot?: string;
      adults?: number;
      children?: number;
    };
    extra?: {
      component?: string;
      date?: string;
      slot?: string;
      adults?: number;
      youth?: number;
      children?: number;
      infants?: number;
    };
  };
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  locale?: string;
  ticketRegion?: string;
  visitorNames?: string[];
};

// Stripe metadata values are capped at 500 characters, so the visitor name
// list is split across numbered keys (visitorNames, visitorNames2, ...).
const VISITOR_NAMES_METADATA_KEYS = ["visitorNames", "visitorNames2", "visitorNames3", "visitorNames4"];
const VISITOR_NAMES_CHUNK_SIZE = 450;

function buildVisitorNamesMetadata(visitorNames: string[]) {
  const joined = visitorNames.join("; ");
  const metadata: Record<string, string> = {};

  for (let index = 0; index < VISITOR_NAMES_METADATA_KEYS.length; index += 1) {
    const chunk = joined.slice(index * VISITOR_NAMES_CHUNK_SIZE, (index + 1) * VISITOR_NAMES_CHUNK_SIZE);

    if (!chunk) {
      break;
    }

    metadata[VISITOR_NAMES_METADATA_KEYS[index]] = chunk;
  }

  return metadata;
}

function toStripeAmount(value: number) {
  return Math.round(value * 100);
}

function getInteger(value: unknown) {
  return Number.isInteger(value) ? Number(value) : 0;
}

function getOrigin(request: Request) {
  const origin = request.headers.get("origin");

  return origin || siteUrl;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function isUnavailable(
  productId: string,
  date: string,
  slot: string,
  comboComponent: string = COMBO_COMPONENT_ALL,
) {
  if (isSlotPastCutoff(date, slot)) {
    return true;
  }

  // Ismétlődő zárás: a Louvre keddenként zárva (kombó Louvre-komponens).
  if (isLouvreComponentDateClosed(comboComponent, date)) {
    return true;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("product_availability_overrides")
    .select("visit_time, combo_component, is_closed")
    .eq("product_id", productId)
    .eq("visit_date", date)
    .in("visit_time", ["*", slot]);

  if (error) {
    throw new Error(error.message);
  }

  const relevantRows = (data ?? []).filter((row) =>
    matchesAvailabilityComponent(row.combo_component, comboComponent),
  );
  const exactOverride = relevantRows.find((item) => item.visit_time === slot);
  const dayOverride = relevantRows.find((item) => item.visit_time === "*");

  if (exactOverride) {
    return exactOverride.is_closed;
  }

  return Boolean(dayOverride?.is_closed);
}

export async function POST(request: Request) {
  const stripe = getStripeClient();

  if (!stripe) {
    return Response.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let body: CheckoutRequest;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const product = await findProductById(body.productId || "");
  const adults = getInteger(body.adults);
  const children = getInteger(body.children);
  const firstName = body.customer?.firstName?.trim() || "";
  const lastName = body.customer?.lastName?.trim() || "";
  const email = body.customer?.email?.trim() || "";
  const phone = body.customer?.phone?.trim() || "";
  const date = body.date?.trim() || "";
  const slot = body.slot?.trim() || "";
  const isCombo = product ? isComboProduct(product) : false;
  const louvreComponent = body.comboComponents?.louvre;
  const extraComponent = body.comboComponents?.extra;
  const louvreDate = louvreComponent?.date?.trim() || "";
  const louvreSlot = louvreComponent?.slot?.trim() || "";
  const louvreAdults = getInteger(louvreComponent?.adults);
  const louvreChildren = getInteger(louvreComponent?.children);
  const extraDate = extraComponent?.date?.trim() || "";
  const extraSlot = extraComponent?.slot?.trim() || "";
  const extraAdults = getInteger(extraComponent?.adults);
  const extraYouth = getInteger(extraComponent?.youth);
  const extraChildren = getInteger(extraComponent?.children);
  const extraInfants = getInteger(extraComponent?.infants);

  if (!product || adults < 0 || children < 0 || !firstName || !lastName || !email) {
    return Response.json({ error: "Missing or invalid checkout details." }, { status: 400 });
  }

  const hasValidBaseDateTime = !isCombo && Boolean(date) && timeSlots.includes(slot);
  const hasValidComboDateTime = isCombo &&
    Boolean(louvreDate) &&
    timeSlots.includes(louvreSlot) &&
    Boolean(extraDate) &&
    timeSlots.includes(extraSlot) &&
    extraComponent?.component === product.comboExtraComponent;

  if (!hasValidBaseDateTime && !hasValidComboDateTime) {
    return Response.json({ error: "Missing or invalid checkout details." }, { status: 400 });
  }

  if (isCombo && (louvreAdults < 0 || louvreChildren < 0 || extraAdults < 0 || extraYouth < 0 || extraChildren < 0 || extraInfants < 0)) {
    return Response.json({ error: "Missing or invalid checkout details." }, { status: 400 });
  }

  const extraPaidVisitors = product.comboExtraComponent === "eiffel"
    ? extraAdults + extraYouth + extraChildren
    : extraAdults + extraChildren;
  const payingVisitors = isCombo ? louvreAdults + extraPaidVisitors : adults;

  if (isCombo && !isValidComboParticipantSelection(
    product,
    { adults: louvreAdults, children: louvreChildren },
    {
      adults: extraAdults,
      youth: extraYouth,
      children: extraChildren,
      infants: extraInfants,
    },
  )) {
    return Response.json(
      { error: "Combo bookings require at least one Louvre adult and one paid ticket for the second component." },
      { status: 400 },
    );
  }

  if (payingVisitors < 1) {
    return Response.json({ error: "Select at least one paid visitor." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const ticketRegion = typeof body.ticketRegion === "string" ? body.ticketRegion.trim() : "";
  const visitorNames = Array.isArray(body.visitorNames)
    ? body.visitorNames.map((name) => (typeof name === "string" ? name.trim() : ""))
    : [];
  // Felnőtt/gyerek jelöléssel tárolt nevek ("A:"/"C:" előtag) — a kiíró
  // program ezek alapján csoportosít. A felnőttek neve érkezik előre.
  let taggedVisitorNames: string[] = [];

  if (EU_TICKET_FEATURE_ENABLED) {
    const expectedAdultNames = isCombo
      ? Math.max(
          louvreAdults,
          extraAdults + (product.comboExtraComponent === "eiffel" ? extraYouth : 0),
        )
      : adults;
    const expectedChildNames = isCombo
      ? Math.max(
          louvreChildren,
          extraChildren + (product.comboExtraComponent === "eiffel" ? extraInfants : 0),
        )
      : children;
    const expectedVisitors = expectedAdultNames + expectedChildNames;

    if (!isTicketRegion(ticketRegion)) {
      return Response.json({ error: "Please select an EU or Non-EU ticket." }, { status: 400 });
    }

    if (
      visitorNames.length !== expectedVisitors ||
      visitorNames.some((name) => name.length === 0 || name.length > 120)
    ) {
      return Response.json({ error: "Please enter the full name of every visitor." }, { status: 400 });
    }

    taggedVisitorNames = visitorNames.map(
      (name, index) => `${index < expectedAdultNames ? "A" : "C"}:${name}`,
    );
  }

  try {
    const isClosed = isCombo
      ? await isUnavailable(product.id, louvreDate, louvreSlot, "louvre") ||
        await isUnavailable(
          product.id,
          extraDate,
          extraSlot,
          product.comboExtraComponent || COMBO_COMPONENT_ALL,
        )
      : await isUnavailable(product.id, date, slot);

    if (isClosed) {
      return Response.json(
        { error: "This product is not available for the selected date and time." },
        { status: 409 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check availability.";

    console.error("Availability check failed:", error);

    return Response.json(
      {
        error: process.env.NODE_ENV === "production"
          ? "Unable to check availability."
          : `Unable to check availability: ${message}`,
      },
      { status: 502 },
    );
  }

  const unitAmount = toStripeAmount(getProductUnitPrice(product));
  const origin = getOrigin(request);
  const customerName = `${firstName} ${lastName}`;
  const comboGroupId = isCombo ? randomUUID() : null;
  const comboExtraUnitPrice = getComboExtraUnitPrice(product);
  const louvreAmount = isCombo
    ? getComboComponentAmount(product, "louvre", { adults: louvreAdults, children: louvreChildren })
    : 0;
  const extraAmount = isCombo && product.comboExtraComponent
    ? getComboComponentAmount(product, product.comboExtraComponent, {
        adults: extraAdults,
        youth: product.comboExtraComponent === "eiffel" ? extraYouth : 0,
        children: extraChildren,
        infants: product.comboExtraComponent === "eiffel" ? extraInfants : 0,
      })
    : 0;
  const totalAmount = isCombo
    ? Number((louvreAmount + extraAmount).toFixed(2))
    : Number(((unitAmount / 100) * adults).toFixed(2));
  const lineItems = isCombo
    ? [
        ...(louvreAdults > 0
          ? [
              {
                quantity: louvreAdults,
                price_data: {
                  currency: "eur",
                  unit_amount: toStripeAmount(product.faceValue),
                  product_data: {
                    name: "Louvre Museum component",
                    description: `${product.name} · Louvre component`,
                  },
                },
              },
            ]
          : []),
        ...(extraPaidVisitors > 0
          ? [
              {
                quantity: extraPaidVisitors,
                price_data: {
                  currency: "eur",
                  unit_amount: toStripeAmount(comboExtraUnitPrice),
                  product_data: {
                    name: product.comboExtraName || product.name,
                    description: `${product.name} · Combo component`,
                  },
                },
              },
            ]
          : []),
      ]
    : [
        {
          quantity: adults,
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              description: `${product.duration} · ${product.address}`,
            },
          },
        },
      ];

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      metadata: {
        productId: product.id,
        productName: product.name,
        comboGroupId: comboGroupId || "",
        isCombo: String(isCombo),
        visitDate: isCombo ? louvreDate : date,
        visitTime: isCombo ? louvreSlot : slot,
        louvreDate: isCombo ? louvreDate : "",
        louvreTime: isCombo ? louvreSlot : "",
        extraDate: isCombo ? extraDate : "",
        extraTime: isCombo ? extraSlot : "",
        adults: String(adults),
        children: String(children),
        louvreAdults: String(isCombo ? louvreAdults : 0),
        louvreChildren: String(isCombo ? louvreChildren : 0),
        extraAdults: String(isCombo ? extraAdults : 0),
        extraYouth: String(isCombo ? extraYouth : 0),
        extraChildren: String(isCombo ? extraChildren : 0),
        extraInfants: String(isCombo ? extraInfants : 0),
        louvreAmount: louvreAmount.toFixed(2),
        extraAmount: extraAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        comboExtraComponent: product.comboExtraComponent || "",
        customerName,
        phone,
        locale: body.locale || "en",
        ticketFaceValue: product.faceValue.toFixed(2),
        eGuideFee: product.eGuideFee.toFixed(2),
        serviceFee: product.serviceFee.toFixed(2),
        ...(EU_TICKET_FEATURE_ENABLED && isTicketRegion(ticketRegion)
          ? {
              ticketRegion,
              ...buildVisitorNamesMetadata(taggedVisitorNames),
            }
          : {}),
      },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#booking`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";

    console.error("Stripe checkout session failed:", error);

    return Response.json({ error: message }, { status: 502 });
  }

  if (!session.url) {
    return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  }

  return Response.json({ url: session.url });
}
