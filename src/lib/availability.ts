import { timeSlots } from "@/data/site";

import { getPastSlotsForDate } from "@/lib/bookingTime";

import { COMBO_COMPONENT_ALL, matchesAvailabilityComponent, normalizeComboComponent } from "@/lib/comboAvailability";

import { isPriceOverrideRow } from "@/lib/products";



export type AvailabilityOverride = {

  product_id: string;

  visit_date: string;

  visit_time: string;

  is_closed: boolean;

  combo_component?: string | null;

};



export type DayAvailabilityStatus = "open" | "partial" | "closed";



export function getOverridesForProductDate(

  overrides: AvailabilityOverride[],

  productId: string,

  date: string,

  comboComponent: string = COMBO_COMPONENT_ALL,

) {

  return overrides.filter(

    (override) =>

      override.product_id === productId &&

      override.visit_date === date &&

      matchesAvailabilityComponent(override.combo_component, comboComponent),

  );

}



export function getClosedSlotsForDate(

  dateOverrides: Pick<AvailabilityOverride, "visit_time" | "is_closed">[],

  date: string,

) {

  const closedSlots = new Set<string>();

  const dayOverride = dateOverrides.find((item) => item.visit_time === "*");



  if (dayOverride?.is_closed) {

    timeSlots.forEach((slot) => closedSlots.add(slot));

  }



  dateOverrides

    .filter((item) => item.visit_time !== "*")

    .forEach((item) => {

      if (item.is_closed) {

        closedSlots.add(item.visit_time);

      } else {

        closedSlots.delete(item.visit_time);

      }

    });



  getPastSlotsForDate(date).forEach((slot) => closedSlots.add(slot));



  return closedSlots;

}



export function getDayAvailabilityStatus(closedSlots: Set<string>): DayAvailabilityStatus {

  const closedCount = timeSlots.filter((slot) => closedSlots.has(slot)).length;



  if (closedCount === 0) {

    return "open";

  }



  if (closedCount >= timeSlots.length) {

    return "closed";

  }



  return "partial";

}



export function isDayFullyClosed(

  dateOverrides: Pick<AvailabilityOverride, "visit_time" | "is_closed">[],

  date: string,

) {

  const closedSlots = getClosedSlotsForDate(dateOverrides, date);



  return timeSlots.every((slot) => closedSlots.has(slot));

}



export function getEffectiveDayStatus(

  overrides: AvailabilityOverride[],

  productId: string,

  date: string,

  comboComponent: string = COMBO_COMPONENT_ALL,

): DayAvailabilityStatus {

  const dateOverrides = getOverridesForProductDate(overrides, productId, date, comboComponent).filter(

    (override) => !isPriceOverrideRow(override),

  );

  const closedSlots = getClosedSlotsForDate(dateOverrides, date);



  return getDayAvailabilityStatus(closedSlots);

}



export function getMonthDateKeys(month: string) {

  const [year, monthNumber] = month.split("-").map(Number);

  const daysInMonth = new Date(year, monthNumber, 0).getDate();



  return Array.from({ length: daysInMonth }, (_, index) => {

    const day = String(index + 1).padStart(2, "0");

    return `${month}-${day}`;

  });

}



export function getClosedDatesForMonth(

  overrides: AvailabilityOverride[],

  productId: string,

  month: string,

  today: string,

  comboComponent: string = COMBO_COMPONENT_ALL,

) {

  const relevantOverrides = overrides.filter(

    (override) =>

      override.product_id === productId &&

      !isPriceOverrideRow(override) &&

      override.visit_date.startsWith(`${month}-`) &&

      matchesAvailabilityComponent(override.combo_component, comboComponent),

  );

  const overridesByDate = new Map<string, AvailabilityOverride[]>();



  for (const override of relevantOverrides) {

    const existing = overridesByDate.get(override.visit_date) ?? [];

    existing.push(override);

    overridesByDate.set(override.visit_date, existing);

  }



  return getMonthDateKeys(month).filter((dateKey) => {

    if (dateKey < today) {

      return false;

    }



    return isDayFullyClosed(overridesByDate.get(dateKey) ?? [], dateKey);

  });

}



export function getEffectiveSlotStatus(

  overrides: AvailabilityOverride[],

  productId: string,

  date: string,

  slot: string,

  comboComponent: string = COMBO_COMPONENT_ALL,

) {

  const dateOverrides = getOverridesForProductDate(overrides, productId, date, comboComponent).filter(

    (override) => !isPriceOverrideRow(override),

  );

  const closedSlots = getClosedSlotsForDate(dateOverrides, date);



  return closedSlots.has(slot);

}



export function getAvailabilityComponentKey(comboComponent: string | null | undefined) {

  return normalizeComboComponent(comboComponent);

}

