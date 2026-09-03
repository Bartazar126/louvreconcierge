import { products, timeSlots } from "@/data/site";
import {
  COMBO_COMPONENT_ALL,
  getComboAvailabilityOptions,
  normalizeComboComponent,
} from "@/lib/comboAvailability";

export type AvailabilityOverrideInput = {
  product_id: string;
  combo_component: string;
  visit_date: string;
  visit_time: string;
  is_closed: boolean;
  note?: string | null;
  updated_at?: string;
};

type AvailabilityOverrideRow = {
  combo_component?: string | null;
  visit_time: string;
  is_closed: boolean;
};

export function buildAvailabilityOpenPlan(
  existing: AvailabilityOverrideRow[],
  productId: string,
  comboComponent: string,
  visitDate: string,
  visitTime: string,
): {
  deleteFilters: Array<{
    product_id: string;
    combo_component: string;
    visit_date: string;
    visit_time?: string;
  }>;
  upserts: AvailabilityOverrideInput[];
} {
  const normalizedComponent = normalizeComboComponent(comboComponent);
  const timestamp = new Date().toISOString();
  const relevant = existing.filter((row) => row.is_closed);
  const fullDayComponent = relevant.find(
    (row) =>
      normalizeComboComponent(row.combo_component) === normalizedComponent &&
      row.visit_time === "*",
  );
  const fullDayWildcard = relevant.find(
    (row) =>
      normalizeComboComponent(row.combo_component) === COMBO_COMPONENT_ALL &&
      row.visit_time === "*",
  );

  if (visitTime === "*") {
    return {
      deleteFilters: [
        {
          product_id: productId,
          combo_component: normalizedComponent,
          visit_date: visitDate,
        },
      ],
      upserts: [],
    };
  }

  if (fullDayComponent) {
    return {
      deleteFilters: [
        {
          product_id: productId,
          combo_component: normalizedComponent,
          visit_date: visitDate,
        },
      ],
      upserts: timeSlots
        .filter((slot) => slot !== visitTime)
        .map((slot) => ({
          product_id: productId,
          combo_component: normalizedComponent,
          visit_date: visitDate,
          visit_time: slot,
          is_closed: true,
          updated_at: timestamp,
        })),
    };
  }

  if (fullDayWildcard && normalizedComponent !== COMBO_COMPONENT_ALL) {
    const product = products.find((item) => item.id === productId);
    const otherComponents = product
      ? getComboAvailabilityOptions(product)
          ?.filter((option) => option.id !== normalizedComponent)
          .map((option) => option.id) ?? []
      : [];

    return {
      deleteFilters: [
        {
          product_id: productId,
          combo_component: COMBO_COMPONENT_ALL,
          visit_date: visitDate,
          visit_time: "*",
        },
      ],
      upserts: otherComponents.map((component) => ({
        product_id: productId,
        combo_component: component,
        visit_date: visitDate,
        visit_time: "*",
        is_closed: true,
        updated_at: timestamp,
      })),
    };
  }

  return {
    deleteFilters: [
      {
        product_id: productId,
        combo_component: normalizedComponent,
        visit_date: visitDate,
        visit_time: visitTime,
      },
    ],
    upserts: [],
  };
}

export function applyAvailabilityOpenToOverrides<
  T extends {
    product_id: string;
    combo_component?: string | null;
    visit_date: string;
    visit_time: string;
    is_closed: boolean;
    note?: string | null;
    updated_at?: string;
    created_at?: string;
    id?: string;
  },
>(
  overrides: T[],
  productId: string,
  comboComponent: string,
  visitDate: string,
  visitTime: string,
): T[] {
  const plan = buildAvailabilityOpenPlan(
    overrides.filter(
      (override) =>
        override.product_id === productId && override.visit_date === visitDate,
    ),
    productId,
    comboComponent,
    visitDate,
    visitTime,
  );
  const normalizedComponent = normalizeComboComponent(comboComponent);
  const timestamp = new Date().toISOString();

  let next = overrides.filter((override) => {
    if (override.product_id !== productId || override.visit_date !== visitDate) {
      return true;
    }

    return !plan.deleteFilters.some((filter) => {
      if (normalizeComboComponent(override.combo_component) !== filter.combo_component) {
        return false;
      }

      if (!filter.visit_time) {
        return true;
      }

      return override.visit_time === filter.visit_time;
    });
  });

  for (const row of plan.upserts) {
    const existingIndex = next.findIndex(
      (override) =>
        override.product_id === row.product_id &&
        normalizeComboComponent(override.combo_component) === row.combo_component &&
        override.visit_date === row.visit_date &&
        override.visit_time === row.visit_time,
    );

    if (existingIndex >= 0) {
      next = next.map((override, index) =>
        index === existingIndex
          ? {
              ...override,
              is_closed: true,
              updated_at: timestamp,
            }
          : override,
      );
      continue;
    }

    next = [
      ...next,
      {
        id: `local-${row.product_id}-${row.combo_component}-${row.visit_date}-${row.visit_time}`,
        created_at: timestamp,
        updated_at: timestamp,
        note: null,
        ...row,
      } as T,
    ];
  }

  return next;
}
