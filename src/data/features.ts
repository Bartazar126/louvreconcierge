// Feature switch for the EU/Non-EU ticket selection + per-visitor names flow.
// Set to false to revert the site to the previous booking flow. The database
// columns (ticket_region, visitor_names) are optional, so no other change is
// needed to roll back — see EUJEGY-VISSZAALLITAS.md.
export const EU_TICKET_FEATURE_ENABLED = true;

// Optional recurring closure for the Louvre component of combo products
// (0 = Sunday, 1 = Monday, 2 = Tuesday, ...). Currently DISABLED — the
// Tuesday closures are managed as database rows instead (see
// scripts/close-louvre-combo-tuesdays.mjs), so they work without a deploy.
export const LOUVRE_COMBO_CLOSED_WEEKDAYS: number[] = [];

export type TicketRegion = "eu" | "non_eu";

export function isTicketRegion(value: unknown): value is TicketRegion {
  return value === "eu" || value === "non_eu";
}
