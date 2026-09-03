import { timeSlots } from "@/data/site";

export const bookingTimeZone = "Europe/Paris";

export function getParisDateKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: bookingTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getParisMinutesSinceMidnight(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: bookingTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return hour * 60 + minute;
}

export function slotToMinutes(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);

  return hours * 60 + minutes;
}

export function isSlotPastCutoff(visitDate: string, slot: string, now = new Date()) {
  if (visitDate !== getParisDateKey(now)) {
    return false;
  }

  return slotToMinutes(slot) < getParisMinutesSinceMidnight(now);
}

export function getPastSlotsForDate(visitDate: string, now = new Date()) {
  if (visitDate !== getParisDateKey(now)) {
    return [];
  }

  const nowMinutes = getParisMinutesSinceMidnight(now);

  return timeSlots.filter((slot) => slotToMinutes(slot) < nowMinutes);
}

export function getFirstBookableSlot(
  visitDate: string,
  closedSlots: Iterable<string>,
  now = new Date(),
) {
  const closedSet = new Set(closedSlots);

  return timeSlots.find(
    (slot) => !closedSet.has(slot) && !isSlotPastCutoff(visitDate, slot, now),
  );
}

export function isSlotUnavailable(
  visitDate: string,
  slot: string,
  closedSlots: Iterable<string>,
  now = new Date(),
) {
  return new Set(closedSlots).has(slot) || isSlotPastCutoff(visitDate, slot, now);
}
