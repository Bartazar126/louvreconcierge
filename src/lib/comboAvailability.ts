import { LOUVRE_COMBO_CLOSED_WEEKDAYS } from "@/data/features";
import { Product, isComboProduct, products } from "@/data/site";

export type ComboAvailabilityComponent = "louvre" | "eiffel" | "seine";

export const COMBO_COMPONENT_ALL = "*";

export type ComboAvailabilityOption = {
  id: ComboAvailabilityComponent;
  label: string;
};

export function normalizeComboComponent(value: string | null | undefined) {
  const normalized = value?.trim() || COMBO_COMPONENT_ALL;
  return normalized === "" ? COMBO_COMPONENT_ALL : normalized;
}

export function getComboAvailabilityOptions(product: Product): ComboAvailabilityOption[] | null {
  if (!isComboProduct(product) || !product.comboExtraComponent) {
    return null;
  }

  const options: ComboAvailabilityOption[] = [
    { id: "louvre", label: "Louvre Museum" },
    {
      id: product.comboExtraComponent,
      label: product.comboExtraName || product.comboExtraComponent,
    },
  ];

  return options;
}

export function isValidComboAvailabilityComponent(
  product: Product,
  component: string,
): component is ComboAvailabilityComponent {
  const options = getComboAvailabilityOptions(product);

  if (!options) {
    return false;
  }

  return options.some((option) => option.id === component);
}

export function matchesAvailabilityComponent(
  storedComponent: string | null | undefined,
  requestedComponent: string | null | undefined,
) {
  const stored = normalizeComboComponent(storedComponent);
  const requested = normalizeComboComponent(requestedComponent);

  if (stored === COMBO_COMPONENT_ALL) {
    return true;
  }

  if (requested === COMBO_COMPONENT_ALL) {
    return stored === COMBO_COMPONENT_ALL;
  }

  return stored === requested;
}

export function isLouvreComponentDateClosed(
  comboComponent: string | null | undefined,
  dateKey: string,
) {
  if (normalizeComboComponent(comboComponent) !== "louvre") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return LOUVRE_COMBO_CLOSED_WEEKDAYS.includes(weekday);
}

export function formatComboComponentLabel(productId: string, component: string) {
  if (component === COMBO_COMPONENT_ALL || !component) {
    return "All components";
  }

  const product = products.find((item) => item.id === productId);

  if (component === "louvre") {
    return "Louvre Museum";
  }

  if (product?.comboExtraComponent === component) {
    return product.comboExtraName || component;
  }

  return component.charAt(0).toUpperCase() + component.slice(1);
}
