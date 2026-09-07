import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { business, nonAffiliation } from "@/data/site";

// Google Workspace (sales@louvretickets-tourcierge.com) SMTP kapcsolat.
// Az alkalmazasjelszo a SMTP_PASS kornyezeti valtozoban van - soha nem a kodban.
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number.parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

let cachedTransport: Transporter | null = null;

export function isMailConfigured() {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function getTransport(): Transporter | null {
  if (!isMailConfigured()) {
    return null;
  }

  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return cachedTransport;
}

export type OrderEmailComponent = {
  label: string;
  visitDate: string;
  visitTime: string;
  adults: number;
  youth: number;
  children: number;
  infants: number;
  amount: number;
};

export type OrderEmailSummary = {
  customerName: string;
  email: string;
  productName: string;
  productAddress?: string;
  productDuration?: string;
  ticketRegion?: string | null;
  adultNames: string[];
  childNames: string[];
  components: OrderEmailComponent[];
  totalAmount: number;
  currency: string;
  reference: string;
};

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

function formatVisitors(component: OrderEmailComponent) {
  const parts: string[] = [];

  if (component.adults > 0) parts.push(`${component.adults} adult`);
  if (component.youth > 0) parts.push(`${component.youth} youth`);
  if (component.children > 0) parts.push(`${component.children} child`);
  if (component.infants > 0) parts.push(`${component.infants} infant`);

  return parts.join(", ") || "-";
}

function ticketRegionLabel(region?: string | null) {
  if (region === "eu") return "EU ticket";
  if (region === "non_eu") return "Non-EU ticket";
  return "";
}

function isSeineProduct(productName: string) {
  const lower = productName.toLowerCase();
  return lower.includes("seine") || lower.includes("boat") || lower.includes("cruise");
}

// A hajos termekeknel a regi LTG email is kiirta az indulasi infot.
const BOAT_INFO_LINES = [
  "BOATS DEPART EVERY HALF HOUR",
  "Address of the Boat Tour:",
  "At the foot of the Eiffel Tower",
  "Port de la Bourdonnais, 75007 Paris at: pier 3. (occasionally) or pier 5 or pier 7.",
];

function buildDetailRows(summary: OrderEmailSummary) {
  const rows: Array<[string, string]> = [
    ["Booking reference", summary.reference],
    ["Product", summary.productName],
  ];

  const region = ticketRegionLabel(summary.ticketRegion);
  if (region) {
    rows.push(["Ticket type", region]);
  }

  for (const component of summary.components) {
    const prefix = summary.components.length > 1 ? `${component.label} - ` : "";
    rows.push([`${prefix}Visit date`, `${component.visitDate} ${component.visitTime}`.trim()]);
    rows.push([`${prefix}Visitors`, formatVisitors(component)]);
  }

  if (summary.adultNames.length > 0) {
    rows.push(["Adults", summary.adultNames.join(", ")]);
  }

  if (summary.childNames.length > 0) {
    rows.push(["Children", summary.childNames.join(", ")]);
  }

  if (summary.productDuration) {
    rows.push(["Duration", summary.productDuration]);
  }

  if (summary.productAddress) {
    rows.push(["Address", summary.productAddress]);
  }

  rows.push(["Total paid", formatMoney(summary.totalAmount, summary.currency)]);

  return rows;
}

function buildConfirmationText(summary: OrderEmailSummary) {
  const lines = [
    `Dear ${summary.customerName || "Guest"},`,
    "",
    "Thank you for your booking - your payment has been received and your order is confirmed.",
    "",
    "BOOKING DETAILS",
  ];

  for (const [label, value] of buildDetailRows(summary)) {
    lines.push(`${label}: ${value}`);
  }

  lines.push(
    "",
    "WHAT HAPPENS NEXT",
    "Our team is preparing your tickets. You will receive them as a PDF file attached",
    "to a separate email from this address, before your visit date. Just show the",
    "ticket on your phone at the entrance - no printing needed.",
    "",
  );

  if (isSeineProduct(summary.productName)) {
    lines.push(...BOAT_INFO_LINES, "");
  }

  lines.push(
    "If you have any questions, feel free to reply to this email.",
    `Customer service hours: ${business.supportHours}`,
    "",
    "Best Regards,",
    business.brandName,
    "",
    nonAffiliation,
  );

  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildConfirmationHtml(summary: OrderEmailSummary) {
  const detailRows = buildDetailRows(summary)
    .map(
      ([label, value]) => `
          <tr>
            <td style="padding:8px 0;color:#667085;font-size:14px;vertical-align:top;width:42%;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;color:#172033;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
          </tr>`,
    )
    .join("");

  const boatBlock = isSeineProduct(summary.productName)
    ? `
        <div style="margin-top:24px;padding:16px 18px;background:#eef3fe;border-radius:12px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#24409a;">${escapeHtml(BOAT_INFO_LINES[0])}</p>
          <p style="margin:0;font-size:14px;color:#344054;line-height:1.6;">
            ${escapeHtml(BOAT_INFO_LINES[1])}<br />
            ${escapeHtml(BOAT_INFO_LINES[2])}<br />
            ${escapeHtml(BOAT_INFO_LINES[3])}
          </p>
        </div>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f6fc;font-family:Roboto,Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
      <div style="background:#3558c8;border-radius:14px 14px 0 0;padding:22px 26px;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.4px;">
          LOUVRETICKETS <span style="font-weight:400;opacity:0.85;">by TourCierge</span>
        </p>
      </div>
      <div style="background:#ffffff;padding:28px 26px;border-radius:0 0 14px 14px;">
        <h1 style="margin:0 0 8px;font-size:22px;color:#172033;">Your booking is confirmed</h1>
        <p style="margin:0 0 20px;font-size:15px;color:#344054;line-height:1.6;">
          Dear ${escapeHtml(summary.customerName || "Guest")},<br />
          Thank you for your booking - your payment has been received and your order is confirmed.
        </p>

        <table style="width:100%;border-collapse:collapse;border-top:1px solid #dde4f0;">
          ${detailRows}
        </table>

        <div style="margin-top:24px;padding:16px 18px;background:#f3f6fc;border-radius:12px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#24409a;">WHAT HAPPENS NEXT</p>
          <p style="margin:0;font-size:14px;color:#344054;line-height:1.6;">
            Our team is preparing your tickets. You will receive them as a PDF file attached to a
            separate email from this address, before your visit date. Just show the ticket on your
            phone at the entrance - no printing needed.
          </p>
        </div>
        ${boatBlock}

        <p style="margin:24px 0 0;font-size:14px;color:#344054;line-height:1.6;">
          If you have any questions, feel free to reply to this email.<br />
          Customer service hours: ${escapeHtml(business.supportHours)}
        </p>
        <p style="margin:18px 0 0;font-size:14px;color:#344054;">
          Best Regards,<br /><strong>${escapeHtml(business.brandName)}</strong>
        </p>
      </div>
      <p style="margin:16px 4px 0;font-size:11px;color:#667085;line-height:1.5;">
        ${escapeHtml(nonAffiliation)}
      </p>
    </div>
  </body>
</html>`;
}

function fromAddress() {
  return `"${business.brandName}" <${SMTP_USER}>`;
}

async function deliver(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const transport = getTransport();

  if (!transport) {
    console.warn("SMTP is not configured - skipping email:", options.subject);
    return false;
  }

  await transport.sendMail({
    from: fromAddress(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo || business.email,
  });

  return true;
}

export async function sendOrderConfirmationEmail(summary: OrderEmailSummary) {
  if (!summary.email) {
    return false;
  }

  const first = summary.components[0];
  const visitPart = first ? ` - ${first.visitDate} ${first.visitTime}`.trimEnd() : "";

  return deliver({
    to: summary.email,
    subject: `Booking confirmed - ${summary.productName}${visitPart}`,
    text: buildConfirmationText(summary),
    html: buildConfirmationHtml(summary),
  });
}

export async function sendNewOrderNotification(summary: OrderEmailSummary) {
  const recipient = process.env.SALES_NOTIFICATION_EMAIL || SMTP_USER;

  if (!recipient) {
    return false;
  }

  const lines = [
    `New paid order: ${summary.reference}`,
    "",
    `Customer: ${summary.customerName}`,
    `Email: ${summary.email}`,
    "",
  ];

  for (const [label, value] of buildDetailRows(summary)) {
    lines.push(`${label}: ${value}`);
  }

  return deliver({
    to: recipient,
    subject: `New order: ${summary.productName} - ${summary.customerName}`,
    text: lines.join("\n"),
    replyTo: summary.email || business.email,
  });
}
