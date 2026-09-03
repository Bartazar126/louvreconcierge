"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { products, timeSlots } from "@/data/site";
import { applyAvailabilityOpenToOverrides } from "@/lib/availabilityAdmin";
import {
  getEffectiveDayStatus,
  getEffectiveSlotStatus,
} from "@/lib/availability";
import { getParisDateKey } from "@/lib/bookingTime";
import {
  COMBO_COMPONENT_ALL,
  formatComboComponentLabel,
  getComboAvailabilityOptions,
  normalizeComboComponent,
} from "@/lib/comboAvailability";
import { isPriceOverrideRow } from "@/lib/products";
import { AvailabilityOverrideRow } from "@/lib/supabaseAdmin";
import { setAvailabilityOverride } from "./actions";

type ProductOption = {
  id: string;
  name: string;
};

type AdminAvailabilityCalendarProps = {
  products: ProductOption[];
  availabilityOverrides: AvailabilityOverrideRow[];
};

type StoredAvailabilityUi = {
  productId: string;
  comboComponent: string;
  selectedDate: string;
  visitTime: string;
  calendarMonth: string;
};

const UI_STORAGE_KEY = "admin-availability-ui";

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

function readStoredUi(): Partial<StoredAvailabilityUi> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(UI_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAvailabilityUi) : null;
  } catch {
    return null;
  }
}

function writeStoredUi(value: StoredAvailabilityUi) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(UI_STORAGE_KEY, JSON.stringify(value));
}

function getProductName(productId: string) {
  return products.find((product) => product.id === productId)?.name || productId;
}

function applyAvailabilityChange(
  overrides: AvailabilityOverrideRow[],
  change: {
    productId: string;
    comboComponent: string;
    visitDate: string;
    visitTime: string;
    intent: "close" | "open";
    note: string | null;
  },
) {
  const matches = (override: AvailabilityOverrideRow) =>
    override.product_id === change.productId &&
    normalizeComboComponent(override.combo_component) === change.comboComponent &&
    override.visit_date === change.visitDate &&
    override.visit_time === change.visitTime;

  if (change.intent === "open") {
    return applyAvailabilityOpenToOverrides(
      overrides,
      change.productId,
      change.comboComponent,
      change.visitDate,
      change.visitTime,
    );
  }

  const existing = overrides.find(matches);
  const timestamp = new Date().toISOString();

  if (existing) {
    return overrides.map((override) =>
      matches(override)
        ? {
            ...override,
            is_closed: true,
            note: change.note,
            updated_at: timestamp,
          }
        : override,
    );
  }

  return [
    ...overrides,
    {
      id: `local-${change.productId}-${change.comboComponent}-${change.visitDate}-${change.visitTime}`,
      created_at: timestamp,
      updated_at: timestamp,
      product_id: change.productId,
      combo_component: change.comboComponent,
      visit_date: change.visitDate,
      visit_time: change.visitTime,
      is_closed: true,
      note: change.note,
    },
  ];
}

export function AdminAvailabilityCalendar({
  products: productOptions,
  availabilityOverrides,
}: AdminAvailabilityCalendarProps) {
  const parisToday = getParisDateKey();
  const [localOverrides, setLocalOverrides] = useState(availabilityOverrides);
  const [uiReady, setUiReady] = useState(false);
  const [productId, setProductId] = useState(productOptions[0]?.id || "");
  const [comboComponent, setComboComponent] = useState<string>(COMBO_COMPONENT_ALL);
  const [visitTime, setVisitTime] = useState("*");
  const [selectedDate, setSelectedDate] = useState(parisToday);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(`${parisToday}T12:00:00`));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const bookingOverrides = useMemo(
    () => localOverrides.filter((override) => !isPriceOverrideRow(override)),
    [localOverrides],
  );
  const visibleOverrides = bookingOverrides;

  const selectedProduct = products.find((product) => product.id === productId);
  const comboOptions = selectedProduct ? getComboAvailabilityOptions(selectedProduct) : null;
  const activeComponent = comboOptions?.some((option) => option.id === comboComponent)
    ? comboComponent
    : comboOptions?.[0]?.id || COMBO_COMPONENT_ALL;

  const calendarDays = createCalendarDays(calendarMonth);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  const componentLabel = useMemo(() => {
    if (!comboOptions) {
      return null;
    }

    return comboOptions.find((option) => option.id === activeComponent)?.label || activeComponent;
  }, [activeComponent, comboOptions]);

  useEffect(() => {
    setLocalOverrides(availabilityOverrides);
  }, [availabilityOverrides]);

  useEffect(() => {
    const stored = readStoredUi();

    if (stored?.productId && productOptions.some((product) => product.id === stored.productId)) {
      setProductId(stored.productId);
    }

    if (stored?.comboComponent) {
      setComboComponent(stored.comboComponent);
    }

    if (stored?.selectedDate) {
      setSelectedDate(stored.selectedDate);
    }

    if (stored?.visitTime) {
      setVisitTime(stored.visitTime);
    }

    if (stored?.calendarMonth) {
      setCalendarMonth(new Date(`${stored.calendarMonth}T12:00:00`));
    }

    setUiReady(true);
  }, [productOptions]);

  useEffect(() => {
    if (!uiReady) {
      return;
    }

    writeStoredUi({
      productId,
      comboComponent: activeComponent,
      selectedDate,
      visitTime,
      calendarMonth: formatDateKey(calendarMonth),
    });
  }, [activeComponent, calendarMonth, productId, selectedDate, uiReady, visitTime]);

  const changeCalendarMonth = (step: number) => {
    setCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + step);
      return nextMonth;
    });
  };

  const handleProductChange = (nextProductId: string) => {
    setProductId(nextProductId);

    const nextProduct = products.find((product) => product.id === nextProductId);
    const nextOptions = nextProduct ? getComboAvailabilityOptions(nextProduct) : null;
    setComboComponent(nextOptions?.[0]?.id || COMBO_COMPONENT_ALL);
  };

  const handleSubmit = (formData: FormData) => {
    setMessage("");
    setError("");

    const intent = formData.get("intent");

    startTransition(async () => {
      const result = await setAvailabilityOverride(formData);

      if (result.ok && result.change) {
        setLocalOverrides((current) => applyAvailabilityChange(current, result.change!));
        setMessage(intent === "open" ? "Selection opened." : "Selection closed.");
        return;
      }

      if (result.ok) {
        setMessage("Availability updated.");
        return;
      }

      setError(result.error || "Unable to update availability.");
    });
  };

  return (
    <>
      <form action={handleSubmit} className="admin-availability-form">
        <input type="hidden" name="visitDate" value={selectedDate} />
        <input type="hidden" name="visitTime" value={visitTime} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="comboComponent" value={activeComponent} />

        <div className="admin-availability-controls">
          <label>
            Product
            <select value={productId} onChange={(event) => handleProductChange(event.target.value)} required>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          {comboOptions ? (
            <label>
              Combo component
              <select
                value={activeComponent}
                onChange={(event) => setComboComponent(event.target.value)}
                required
              >
                {comboOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Note
            <input type="text" name="note" placeholder="Optional internal note" />
          </label>
        </div>

        {comboOptions ? (
          <p className="admin-summary-range">
            Closing or opening only affects <strong>{componentLabel}</strong> within this combo. The other component stays bookable unless you close it separately.
          </p>
        ) : null}

        <div className="admin-calendar-card">
          <div className="admin-calendar-head">
            <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <strong>{monthLabel}</strong>
            <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="admin-calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="admin-calendar-weekday">
                {day}
              </span>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="admin-calendar-empty" />;
              }

              const dateKey = formatDateKey(day);
              const dayStatus = getEffectiveDayStatus(bookingOverrides, productId, dateKey, activeComponent);
              const className = [
                "admin-calendar-day",
                selectedDate === dateKey ? "selected" : "",
                dayStatus === "closed" ? "closed" : "",
                dayStatus === "partial" ? "partial" : "",
                dayStatus === "open" ? "open" : "",
                dateKey < parisToday ? "past" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={className}
                  disabled={dateKey < parisToday}
                  onClick={() => setSelectedDate(dateKey)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-selected-date">
          Selected date: <strong>{selectedDate}</strong>
          {visitTime === "*" ? " · Full day" : ` · ${visitTime}`}
          {componentLabel ? ` · ${componentLabel}` : ""}
        </div>

        <div className="admin-time-card">
          <div className="admin-time-card-head">
            <strong>Select time</strong>
            <span>{visitTime === "*" ? "Full day" : visitTime}</span>
          </div>
          <div className="admin-time-grid">
            {["*", ...timeSlots].map((slot) => {
              const slotClosed =
                slot === "*"
                  ? getEffectiveDayStatus(bookingOverrides, productId, selectedDate, activeComponent) === "closed"
                  : getEffectiveSlotStatus(
                      bookingOverrides,
                      productId,
                      selectedDate,
                      slot,
                      activeComponent,
                    );
              const className = [
                "admin-time-button",
                visitTime === slot ? "selected" : "",
                slotClosed ? "closed" : "open",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button key={slot} type="button" className={className} onClick={() => setVisitTime(slot)}>
                  {slot === "*" ? "Full day" : slot}
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-availability-actions">
          <button type="submit" name="intent" value="close" className="admin-danger-button" disabled={isPending}>
            {isPending ? "Saving..." : "Close Selection"}
          </button>
          <button type="submit" name="intent" value="open" className="admin-success-button" disabled={isPending}>
            {isPending ? "Saving..." : "Open Selection"}
          </button>
        </div>

        {message ? <p className="admin-success">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </form>

      {visibleOverrides.length === 0 ? (
        <p className="admin-empty">No availability overrides yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-orders-table admin-availability-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Component</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {visibleOverrides.map((override) => (
                <tr key={override.id}>
                  <td>{getProductName(override.product_id)}</td>
                  <td>{formatComboComponentLabel(override.product_id, override.combo_component || "*")}</td>
                  <td>{override.visit_date}</td>
                  <td>{override.visit_time === "*" ? "Full day" : override.visit_time}</td>
                  <td>
                    <span className={override.is_closed ? "admin-closed-status" : "admin-open-status"}>
                      {override.is_closed ? "Closed" : "Open"}
                    </span>
                  </td>
                  <td>{override.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
