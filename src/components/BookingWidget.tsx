"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EU_TICKET_FEATURE_ENABLED, TicketRegion } from "@/data/features";
import { Locale, ui } from "@/data/i18n";
import {
  business,
  getComboBookingTotal,
  getComboExtraPaidVisitors,
  getComboExtraUnitPrice,
  getProductUnitPrice,
  isComboProduct,
  isValidComboParticipantSelection,
  Product,
  timeSlots,
} from "@/data/site";
import {
  getFirstBookableSlot,
  getParisDateKey,
  isSlotPastCutoff,
} from "@/lib/bookingTime";

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

function formatMonthKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function useClosedDatesForMonth(
  productId: string | null,
  monthKey: string,
  component: string = "*",
) {
  const [closedDates, setClosedDates] = useState<string[]>([]);

  useEffect(() => {
    if (!productId) {
      setClosedDates([]);
      return;
    }

    let isCurrent = true;

    async function loadClosedDates() {
      try {
        const params = new URLSearchParams({
          productId: productId as string,
          month: monthKey,
          component,
        });
        const response = await fetch(`/api/availability?${params.toString()}`);
        const result = await response.json();

        if (!isCurrent) {
          return;
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load availability.");
        }

        setClosedDates(Array.isArray(result.closedDates) ? result.closedDates : []);
      } catch {
        if (isCurrent) {
          setClosedDates([]);
        }
      }
    }

    loadClosedDates();

    return () => {
      isCurrent = false;
    };
  }, [component, monthKey, productId]);

  return useMemo(() => new Set(closedDates), [closedDates]);
}

function getNextOpenDateInMonth(
  monthDate: Date,
  today: string,
  closedDates: Set<string>,
) {
  const days = createCalendarDays(monthDate).filter((day): day is Date => Boolean(day));

  return days
    .map((day) => formatDateKey(day))
    .find((dateKey) => dateKey >= today && !closedDates.has(dateKey));
}

function useClosedSlotSet(
  productId: string | null,
  date: string,
  component: string = "*",
) {
  const [closedSlots, setClosedSlots] = useState<string[]>([]);
  const [dayClosed, setDayClosed] = useState(false);

  useEffect(() => {
    if (!productId) {
      setClosedSlots([]);
      setDayClosed(false);
      return;
    }

    let isCurrent = true;

    async function loadAvailability() {
      try {
        const params = new URLSearchParams({
          productId: productId as string,
          date,
          component,
        });
        const response = await fetch(`/api/availability?${params.toString()}`);
        const result = await response.json();

        if (!isCurrent) {
          return;
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load availability.");
        }

        setClosedSlots(Array.isArray(result.closedSlots) ? result.closedSlots : []);
        setDayClosed(Boolean(result.dayClosed));
      } catch {
        if (isCurrent) {
          setClosedSlots([]);
          setDayClosed(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isCurrent = false;
    };
  }, [component, date, productId]);

  return useMemo(
    () => ({
      closedSet: productId ? new Set(closedSlots) : new Set<string>(),
      dayClosed,
    }),
    [closedSlots, dayClosed, productId],
  );
}

function isSlotDisabled(visitDate: string, slotName: string, closedSet: Set<string>) {
  return closedSet.has(slotName) || isSlotPastCutoff(visitDate, slotName);
}

type BookingWidgetProps = {
  product: Product | null;
  products: Product[];
  copy: typeof ui.en.booking;
  locale: Locale;
};

function TermsConsentText() {
  return (
    <span className="checkbox-text">
      I accept the <Link href="/terms-of-service">Terms of Service</Link>,{" "}
      <Link href="/privacy-policy">Privacy Policy</Link>, and price breakdown.
    </span>
  );
}

export function BookingWidget({
  product: selectedProduct,
  products,
  copy,
  locale,
}: BookingWidgetProps) {
  const parisToday = getParisDateKey();
  const [parisTodayYear, parisTodayMonth] = parisToday.split("-").map(Number);
  const [timeTick, setTimeTick] = useState(0);
  const [date, setDate] = useState(() => getParisDateKey());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(`${getParisDateKey()}T00:00:00`));
  const [slot, setSlot] = useState(() => getFirstBookableSlot(getParisDateKey(), []) ?? timeSlots[0]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [louvreDate, setLouvreDate] = useState(() => getParisDateKey());
  const [louvreSlot, setLouvreSlot] = useState(() => getFirstBookableSlot(getParisDateKey(), []) ?? timeSlots[0]);
  const [louvreCalendarMonth, setLouvreCalendarMonth] = useState(() => new Date(`${getParisDateKey()}T00:00:00`));
  const [louvreAdults, setLouvreAdults] = useState(1);
  const [louvreChildren, setLouvreChildren] = useState(0);
  const [extraDate, setExtraDate] = useState(() => getParisDateKey());
  const [extraSlot, setExtraSlot] = useState(() => getFirstBookableSlot(getParisDateKey(), []) ?? timeSlots[0]);
  const [extraCalendarMonth, setExtraCalendarMonth] = useState(() => new Date(`${getParisDateKey()}T00:00:00`));
  const [extraAdults, setExtraAdults] = useState(1);
  const [extraYouth, setExtraYouth] = useState(0);
  const [extraChildren, setExtraChildren] = useState(0);
  const [extraInfants, setExtraInfants] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketRegion, setTicketRegion] = useState<TicketRegion | "">("");
  const [visitorNames, setVisitorNames] = useState<string[]>([]);
  const [acceptSubstitution, setAcceptSubstitution] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = selectedProduct ?? products[0];
  const isCombo = isComboProduct(product);
  const isEiffelCombo = product.comboExtraComponent === "eiffel";
  const productIdForAvailability = selectedProduct?.id || null;
  const calendarDays = createCalendarDays(calendarMonth);
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  const canGoToPreviousMonth =
    calendarMonth.getFullYear() > parisTodayYear ||
    (calendarMonth.getFullYear() === parisTodayYear &&
      calendarMonth.getMonth() + 1 > parisTodayMonth);
  const unitPrice = getProductUnitPrice(product);
  const comboExtraUnitPrice = getComboExtraUnitPrice(product);
  const louvreCalendarDays = createCalendarDays(louvreCalendarMonth);
  const extraCalendarDays = createCalendarDays(extraCalendarMonth);
  const selectedDate = new Date(`${date}T00:00:00`);
  const louvreSelectedDate = new Date(`${louvreDate}T00:00:00`);
  const extraSelectedDate = new Date(`${extraDate}T00:00:00`);
  const louvreMonthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(louvreCalendarMonth);
  const extraMonthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(extraCalendarMonth);
  const canGoToPreviousLouvreMonth =
    louvreCalendarMonth.getFullYear() > parisTodayYear ||
    (louvreCalendarMonth.getFullYear() === parisTodayYear &&
      louvreCalendarMonth.getMonth() + 1 > parisTodayMonth);
  const canGoToPreviousExtraMonth =
    extraCalendarMonth.getFullYear() > parisTodayYear ||
    (extraCalendarMonth.getFullYear() === parisTodayYear &&
      extraCalendarMonth.getMonth() + 1 > parisTodayMonth);
  const extraPaidVisitors = isCombo && product.comboExtraComponent
    ? getComboExtraPaidVisitors(product.comboExtraComponent, {
        adults: extraAdults,
        youth: isEiffelCombo ? extraYouth : 0,
        children: extraChildren,
      })
    : isEiffelCombo
      ? extraAdults + extraYouth + extraChildren
      : extraAdults + extraChildren;
  const payingVisitors = isCombo ? louvreAdults + extraPaidVisitors : adults;
  // Every person on the order needs a name; for combos the same group visits
  // both components, so the larger component headcount covers everyone.
  // Adults and children are collected separately (adults first).
  const adultNameCount = isCombo
    ? Math.max(louvreAdults, extraAdults + (isEiffelCombo ? extraYouth : 0))
    : adults;
  const childNameCount = isCombo
    ? Math.max(louvreChildren, extraChildren + (isEiffelCombo ? extraInfants : 0))
    : children;
  const totalVisitors = adultNameCount + childNameCount;
  const trimmedVisitorNames = Array.from({ length: totalVisitors }, (_, index) =>
    (visitorNames[index] ?? "").trim(),
  );
  const euTicketFieldsComplete =
    !EU_TICKET_FEATURE_ENABLED ||
    (ticketRegion !== "" && trimmedVisitorNames.every((name) => name.length > 0));
  const hasValidComboParticipants = isCombo
    ? isValidComboParticipantSelection(
        product,
        { adults: louvreAdults, children: louvreChildren },
        {
          adults: extraAdults,
          youth: isEiffelCombo ? extraYouth : 0,
          children: extraChildren,
          infants: isEiffelCombo ? extraInfants : 0,
        },
      )
    : true;
  const total = useMemo(
    () => isCombo
      ? getComboBookingTotal(
          product,
          { adults: louvreAdults, children: louvreChildren },
          { adults: extraAdults, youth: isEiffelCombo ? extraYouth : 0, children: extraChildren, infants: isEiffelCombo ? extraInfants : 0 },
        )
      : adults * unitPrice,
    [adults, extraAdults, extraChildren, extraInfants, extraYouth, isCombo, isEiffelCombo, louvreAdults, louvreChildren, product, unitPrice],
  );
  const closedAvailability = useClosedSlotSet(!isCombo ? productIdForAvailability : null, date);
  const louvreClosedAvailability = useClosedSlotSet(
    isCombo ? productIdForAvailability : null,
    louvreDate,
    "louvre",
  );
  const extraClosedAvailability = useClosedSlotSet(
    isCombo ? productIdForAvailability : null,
    extraDate,
    product.comboExtraComponent || "*",
  );
  const closedDatesForMonth = useClosedDatesForMonth(
    !isCombo ? productIdForAvailability : null,
    formatMonthKey(calendarMonth),
  );
  const louvreClosedDatesForMonth = useClosedDatesForMonth(
    isCombo ? productIdForAvailability : null,
    formatMonthKey(louvreCalendarMonth),
    "louvre",
  );
  const extraClosedDatesForMonth = useClosedDatesForMonth(
    isCombo ? productIdForAvailability : null,
    formatMonthKey(extraCalendarMonth),
    product.comboExtraComponent || "*",
  );
  const closedSlotSet = closedAvailability.closedSet;
  const louvreClosedSlotSet = louvreClosedAvailability.closedSet;
  const extraClosedSlotSet = extraClosedAvailability.closedSet;

  useEffect(() => {
    const intervalId = window.setInterval(() => setTimeTick((value) => value + 1), 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (closedAvailability.dayClosed) {
      return;
    }

    if (!isSlotDisabled(date, slot, closedSlotSet)) {
      return;
    }

    const nextSlot = getFirstBookableSlot(date, closedSlotSet);

    if (nextSlot && nextSlot !== slot) {
      setSlot(nextSlot);
    }
  }, [closedAvailability.dayClosed, closedSlotSet, date, slot, timeTick]);

  useEffect(() => {
    if (louvreClosedAvailability.dayClosed) {
      return;
    }

    if (!isSlotDisabled(louvreDate, louvreSlot, louvreClosedSlotSet)) {
      return;
    }

    const nextSlot = getFirstBookableSlot(louvreDate, louvreClosedSlotSet);

    if (nextSlot && nextSlot !== louvreSlot) {
      setLouvreSlot(nextSlot);
    }
  }, [louvreClosedAvailability.dayClosed, louvreClosedSlotSet, louvreDate, louvreSlot, timeTick]);

  useEffect(() => {
    if (extraClosedAvailability.dayClosed) {
      return;
    }

    if (!isSlotDisabled(extraDate, extraSlot, extraClosedSlotSet)) {
      return;
    }

    const nextSlot = getFirstBookableSlot(extraDate, extraClosedSlotSet);

    if (nextSlot && nextSlot !== extraSlot) {
      setExtraSlot(nextSlot);
    }
  }, [extraClosedAvailability.dayClosed, extraClosedSlotSet, extraDate, extraSlot, timeTick]);

  useEffect(() => {
    if (!productIdForAvailability || isCombo || !closedDatesForMonth.has(date)) {
      return;
    }

    const nextOpenDate = getNextOpenDateInMonth(calendarMonth, parisToday, closedDatesForMonth);

    if (nextOpenDate && nextOpenDate !== date) {
      setDate(nextOpenDate);
    }
  }, [calendarMonth, closedDatesForMonth, date, isCombo, parisToday, productIdForAvailability]);

  useEffect(() => {
    if (!productIdForAvailability || !isCombo || !louvreClosedDatesForMonth.has(louvreDate)) {
      return;
    }

    const nextOpenDate = getNextOpenDateInMonth(louvreCalendarMonth, parisToday, louvreClosedDatesForMonth);

    if (nextOpenDate && nextOpenDate !== louvreDate) {
      setLouvreDate(nextOpenDate);
    }
  }, [isCombo, louvreCalendarMonth, louvreClosedDatesForMonth, louvreDate, parisToday, productIdForAvailability]);

  useEffect(() => {
    if (!productIdForAvailability || !isCombo || !extraClosedDatesForMonth.has(extraDate)) {
      return;
    }

    const nextOpenDate = getNextOpenDateInMonth(extraCalendarMonth, parisToday, extraClosedDatesForMonth);

    if (nextOpenDate && nextOpenDate !== extraDate) {
      setExtraDate(nextOpenDate);
    }
  }, [extraCalendarMonth, extraClosedDatesForMonth, extraDate, isCombo, parisToday, productIdForAvailability]);

  const canSubmit =
    Boolean(selectedProduct) &&
    (isCombo
      ? !louvreClosedAvailability.dayClosed &&
        !extraClosedAvailability.dayClosed &&
        !isSlotDisabled(louvreDate, louvreSlot, louvreClosedSlotSet) &&
        !isSlotDisabled(extraDate, extraSlot, extraClosedSlotSet)
      : !closedAvailability.dayClosed && !isSlotDisabled(date, slot, closedSlotSet)) &&
    acceptSubstitution &&
    acceptTerms &&
    (isCombo ? hasValidComboParticipants : payingVisitors > 0) &&
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    Boolean(email.trim()) &&
    euTicketFieldsComplete;

  const setVisitorName = (index: number, value: string) => {
    setVisitorNames((current) => {
      const next = Array.from({ length: totalVisitors }, (_, i) => current[i] ?? "");
      next[index] = value;
      return next;
    });
  };

  const updateExtraAdults = (nextValue: number) => {
    const nextAdults = Math.max(0, nextValue);
    const nextPaidVisitors = isEiffelCombo
      ? nextAdults + extraYouth + extraChildren
      : nextAdults + extraChildren;

    if (nextPaidVisitors >= 1) {
      setExtraAdults(nextAdults);
    }
  };

  const updateExtraYouth = (nextValue: number) => {
    const nextYouth = Math.max(0, nextValue);
    const nextPaidVisitors = extraAdults + nextYouth + extraChildren;

    if (nextPaidVisitors >= 1) {
      setExtraYouth(nextYouth);
    }
  };

  const updateExtraChildren = (nextValue: number) => {
    const nextChildren = Math.max(0, nextValue);
    const nextPaidVisitors = isEiffelCombo
      ? extraAdults + extraYouth + nextChildren
      : extraAdults + nextChildren;

    if (nextPaidVisitors >= 1) {
      setExtraChildren(nextChildren);
    }
  };

  const updateAdults = (nextValue: number) => {
    setAdults(Math.max(1, nextValue));
  };

  const updateChildren = (nextValue: number) => {
    setChildren(Math.max(0, nextValue));
  };

  const changeCalendarMonth = (step: number) => {
    setCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + step);
      return nextMonth;
    });
  };

  const changeLouvreCalendarMonth = (step: number) => {
    setLouvreCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + step);
      return nextMonth;
    });
  };

  const changeExtraCalendarMonth = (step: number) => {
    setExtraCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + step);
      return nextMonth;
    });
  };

  const startCheckout = async () => {
    if (!selectedProduct || !canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          date,
          slot,
          adults,
          children,
          comboComponents: isCombo
            ? {
                louvre: {
                  date: louvreDate,
                  slot: louvreSlot,
                  adults: louvreAdults,
                  children: louvreChildren,
                },
                extra: {
                  component: product.comboExtraComponent,
                  date: extraDate,
                  slot: extraSlot,
                  adults: extraAdults,
                  youth: isEiffelCombo ? extraYouth : 0,
                  children: extraChildren,
                  infants: isEiffelCombo ? extraInfants : 0,
                },
              }
            : undefined,
          locale,
          customer: {
            firstName,
            lastName,
            email,
            phone,
          },
          ...(EU_TICKET_FEATURE_ENABLED
            ? {
                ticketRegion,
                visitorNames: trimmedVisitorNames,
              }
            : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Unable to start checkout.");
      }

      window.location.href = result.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start checkout.");
      setIsSubmitting(false);
    }
  };

  function renderEuTicketFields() {
    if (!EU_TICKET_FEATURE_ENABLED) {
      return null;
    }

    const regionOptions = [
      { value: "eu" as const, label: copy.euTicket, note: copy.euTicketNote },
      { value: "non_eu" as const, label: copy.nonEuTicket, note: copy.nonEuTicketNote },
    ];

    return (
      <>
        <div className="ticket-region-select">
          <strong className="ticket-region-title">{copy.ticketTypeTitle}</strong>
          <div className="ticket-region-options" role="radiogroup" aria-label={copy.ticketTypeTitle}>
            {regionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={ticketRegion === option.value}
                className={
                  ticketRegion === option.value
                    ? "ticket-region-option active"
                    : "ticket-region-option"
                }
                onClick={() => setTicketRegion(option.value)}
              >
                <span className="ticket-region-check" aria-hidden="true" />
                <span className="ticket-region-label">{option.label}</span>
                <span className="ticket-region-note">{option.note}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="quick-section">
          <div className="quick-row">
            <div>
              <strong>{copy.visitorNamesTitle}</strong>
              <small>{copy.visitorNamesNote}</small>
            </div>
          </div>
          <div className="quick-fields">
            {Array.from({ length: totalVisitors }, (_, index) => {
              const isAdultField = index < adultNameCount;
              const label = isAdultField
                ? (copy.adultVisitorName || "Adult {n} full name").replace("{n}", String(index + 1))
                : (copy.childVisitorName || "Child {n} full name").replace(
                    "{n}",
                    String(index - adultNameCount + 1),
                  );

              return (
                <label key={index} className="field-label quick-full">
                  {label}
                  <input
                    type="text"
                    autoComplete="off"
                    value={visitorNames[index] ?? ""}
                    onChange={(event) => setVisitorName(index, event.target.value)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  function renderDateTimeSelector({
    title,
    selectedDateValue,
    selectedDateObject,
    calendarDaysValue,
    monthLabelValue,
    canGoPrevious,
    onMonthChange,
    onDateChange,
    selectedSlot,
    onSlotChange,
    closedSlotSetValue,
    closedDatesForMonthValue,
  }: {
    title: string;
    selectedDateValue: string;
    selectedDateObject: Date;
    calendarDaysValue: Array<Date | null>;
    monthLabelValue: string;
    canGoPrevious: boolean;
    onMonthChange: (step: number) => void;
    onDateChange: (date: string) => void;
    selectedSlot: string;
    onSlotChange: (slot: string) => void;
    closedSlotSetValue: Set<string>;
    closedDatesForMonthValue: Set<string>;
  }) {
    return (
      <div className="combo-component-card">
        <h3>{title}</h3>
        <div className="booking-calendar">
          <div className="booking-calendar-head">
            <button type="button" onClick={() => onMonthChange(-1)} disabled={!canGoPrevious} aria-label={copy.previousMonth}>
              ‹
            </button>
            <strong>{monthLabelValue}</strong>
            <button type="button" onClick={() => onMonthChange(1)} aria-label={copy.nextMonth}>
              ›
            </button>
          </div>
          <div className="booking-calendar-grid">
            {copy.weekdays.map((day: string) => (
              <span key={day} className="calendar-weekday">{day}</span>
            ))}
            {calendarDaysValue.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="calendar-empty" />;
              }

              const dateKey = formatDateKey(day);
              const isSelected = dateKey === formatDateKey(selectedDateObject);
              const isDayClosed = closedDatesForMonthValue.has(dateKey);
              const isDisabled = dateKey < parisToday || isDayClosed;
              const className = [
                "calendar-day",
                isSelected ? "selected" : "",
                isDayClosed ? "closed" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={className}
                  disabled={isDisabled}
                  onClick={() => onDateChange(dateKey)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        <div className="combo-selected-date">Selected: <strong>{selectedDateValue}</strong></div>
        <div className="quick-time-grid" aria-label={`${title} time`}>
          {timeSlots.map((item) => {
            const isClosed = isSlotDisabled(selectedDateValue, item, closedSlotSetValue);

            return (
              <button
                key={item}
                type="button"
                className={item === selectedSlot ? "slot-button active" : "slot-button"}
                disabled={isClosed}
                onClick={() => onSlotChange(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <section id="booking" className="calendar-box">
        <div className="calendar-facade">
          <div className="facade-overlay-content">
            <h4>{copy.selectFirst}</h4>
            <button type="button" className="facade-button" disabled>
              <svg viewBox="0 0 448 512" aria-hidden="true">
                <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm332.1 142.9L249.5 417.4c-9.4 9.4-24.6 9.4-33.9 0l-77.5-77.5c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L232.5 366.5l65.6-65.6c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
              </svg>
              {copy.selectCalendar}
            </button>
            <p>{copy.calendarLoads}</p>
          </div>
        </div>
      </section>
    );
  }

  if (isCombo) {
    return (
      <section id="booking" className="quick-booking-card">
        <div className="quick-booking-head">
          <span>{copy.secureCheckout}</span>
          <h2>{copy.bookTickets}</h2>
          <p>{product.name}</p>
        </div>

        <div className="quick-booking-body">
          {renderDateTimeSelector({
            title: "Louvre component",
            selectedDateValue: louvreDate,
            selectedDateObject: louvreSelectedDate,
            calendarDaysValue: louvreCalendarDays,
            monthLabelValue: louvreMonthLabel,
            canGoPrevious: canGoToPreviousLouvreMonth,
            onMonthChange: changeLouvreCalendarMonth,
            onDateChange: setLouvreDate,
            selectedSlot: louvreSlot,
            onSlotChange: setLouvreSlot,
            closedSlotSetValue: louvreClosedSlotSet,
            closedDatesForMonthValue: louvreClosedDatesForMonth,
          })}

          <div className="quick-section">
            <div className="quick-row">
              <div>
                <strong>Adult</strong>
                <small>EUR {product.faceValue.toFixed(2)} {copy.each}</small>
              </div>
              <div className="quantity-control">
                <button type="button" onClick={() => setLouvreAdults(Math.max(1, louvreAdults - 1))} aria-label="Remove Louvre adult">-</button>
                <span>{louvreAdults}</span>
                <button type="button" onClick={() => setLouvreAdults(louvreAdults + 1)} aria-label="Add Louvre adult">+</button>
              </div>
            </div>
            <div className="quick-row">
              <div>
                <strong>Child</strong>
                <small>EUR 0.00 {copy.each}</small>
              </div>
              <div className="quantity-control">
                <button type="button" onClick={() => setLouvreChildren(Math.max(0, louvreChildren - 1))} aria-label="Remove Louvre child">-</button>
                <span>{louvreChildren}</span>
                <button type="button" onClick={() => setLouvreChildren(louvreChildren + 1)} aria-label="Add Louvre child">+</button>
              </div>
            </div>
          </div>

          {renderDateTimeSelector({
            title: product.comboExtraName || "Combo component",
            selectedDateValue: extraDate,
            selectedDateObject: extraSelectedDate,
            calendarDaysValue: extraCalendarDays,
            monthLabelValue: extraMonthLabel,
            canGoPrevious: canGoToPreviousExtraMonth,
            onMonthChange: changeExtraCalendarMonth,
            onDateChange: setExtraDate,
            selectedSlot: extraSlot,
            onSlotChange: setExtraSlot,
            closedSlotSetValue: extraClosedSlotSet,
            closedDatesForMonthValue: extraClosedDatesForMonth,
          })}

          <div className="quick-section">
            <div className="quick-row">
              <div>
                <strong>Adult</strong>
                <small>EUR {comboExtraUnitPrice.toFixed(2)} {copy.each}</small>
              </div>
              <div className="quantity-control">
                <button type="button" onClick={() => updateExtraAdults(extraAdults - 1)} aria-label="Remove extra adult">-</button>
                <span>{extraAdults}</span>
                <button type="button" onClick={() => setExtraAdults(extraAdults + 1)} aria-label="Add extra adult">+</button>
              </div>
            </div>
            {isEiffelCombo ? (
              <div className="quick-row">
                <div>
                  <strong>Youth</strong>
                  <small>EUR {comboExtraUnitPrice.toFixed(2)} {copy.each}</small>
                </div>
                <div className="quantity-control">
                  <button type="button" onClick={() => updateExtraYouth(extraYouth - 1)} aria-label="Remove youth">-</button>
                  <span>{extraYouth}</span>
                  <button type="button" onClick={() => setExtraYouth(extraYouth + 1)} aria-label="Add youth">+</button>
                </div>
              </div>
            ) : null}
            <div className="quick-row">
              <div>
                <strong>Child</strong>
                <small>EUR {comboExtraUnitPrice.toFixed(2)} {copy.each}</small>
              </div>
              <div className="quantity-control">
                <button type="button" onClick={() => updateExtraChildren(extraChildren - 1)} aria-label="Remove extra child">-</button>
                <span>{extraChildren}</span>
                <button type="button" onClick={() => setExtraChildren(extraChildren + 1)} aria-label="Add extra child">+</button>
              </div>
            </div>
            {isEiffelCombo ? (
              <div className="quick-row">
                <div>
                  <strong>Infant</strong>
                  <small>EUR 0.00 {copy.each}</small>
                </div>
                <div className="quantity-control">
                  <button type="button" onClick={() => setExtraInfants(Math.max(0, extraInfants - 1))} aria-label="Remove infant">-</button>
                  <span>{extraInfants}</span>
                  <button type="button" onClick={() => setExtraInfants(extraInfants + 1)} aria-label="Add infant">+</button>
                </div>
              </div>
            ) : null}
          </div>

          {renderEuTicketFields()}

          <div className="quick-fields">
            <label className="field-label">
              {copy.firstName}
              <input type="text" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label className="field-label">
              {copy.lastName}
              <input type="text" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>
            <label className="field-label quick-full">
              {copy.email}
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="field-label quick-full">
              {copy.phone}
              <input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
          </div>

          <div className="quick-total-card">
            <div className="quick-total-head">
              <span>Combo total</span>
              <strong>EUR {total.toFixed(2)}</strong>
            </div>
            <div className="quick-price-breakdown">
              <h3>{copy.breakdown}</h3>
              <div>
                <span>Louvre adult</span>
                <strong>EUR {product.faceValue.toFixed(2)} x {louvreAdults}</strong>
              </div>
              <div>
                <span>{product.comboExtraName || "Combo component"}</span>
                <strong>EUR {comboExtraUnitPrice.toFixed(2)} x {extraPaidVisitors}</strong>
              </div>
              <div>
                <span>Free visitors</span>
                <strong>{louvreChildren + (isEiffelCombo ? extraInfants : 0)}</strong>
              </div>
            </div>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={acceptSubstitution} onChange={(event) => setAcceptSubstitution(event.target.checked)} />
            {copy.substitution.replace("{business}", business.legalName)}
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
            <TermsConsentText />
          </label>

          <div className="notice-box slim">
            <strong>{ui[locale].flow.disclosureTitle}</strong> {ui[locale].nonAffiliation}
          </div>

          <button type="button" className="pay-button" disabled={!canSubmit || isSubmitting} aria-busy={isSubmitting} onClick={startCheckout}>
            {isSubmitting ? "Redirecting to Stripe..." : copy.pay}
          </button>
          {status ? <p className="status-message">{status}</p> : null}
          <p className="secure-note">{copy.secureNote}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="quick-booking-card">
      <div className="quick-booking-head">
        <span>{copy.secureCheckout}</span>
        <h2>{copy.bookTickets}</h2>
        <p>{product.name}</p>
      </div>

      <div className="quick-booking-body">
        <div className="booking-calendar">
          <div className="booking-calendar-head">
            <button
              type="button"
              onClick={() => changeCalendarMonth(-1)}
              disabled={!canGoToPreviousMonth}
              aria-label={copy.previousMonth}
            >
              ‹
            </button>
            <strong>{monthLabel}</strong>
            <button
              type="button"
              onClick={() => changeCalendarMonth(1)}
              aria-label={copy.nextMonth}
            >
              ›
            </button>
          </div>
          <div className="booking-calendar-grid">
            {copy.weekdays.map((day: string) => (
              <span key={day} className="calendar-weekday">{day}</span>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="calendar-empty" />;
              }

              const dateKey = formatDateKey(day);
              const isSelected = dateKey === formatDateKey(selectedDate);
              const isDayClosed = closedDatesForMonth.has(dateKey);
              const isDisabled = dateKey < parisToday || isDayClosed;
              const className = [
                "calendar-day",
                isSelected ? "selected" : "",
                isDayClosed ? "closed" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={className}
                  disabled={isDisabled}
                  onClick={() => setDate(dateKey)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="quick-time-grid" aria-label={copy.chooseVisitTime}>
          {timeSlots.map((item) => {
            const isClosed = isSlotDisabled(date, item, closedSlotSet);

            return (
              <button
                key={item}
                type="button"
                className={item === slot ? "slot-button active" : "slot-button"}
                disabled={isClosed}
                onClick={() => setSlot(item)}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="quick-section">
          <div className="quick-row">
            <div>
              <strong>{copy.adults}</strong>
              <small>EUR {unitPrice.toFixed(2)} {copy.each}</small>
            </div>
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => updateAdults(adults - 1)}
                disabled={adults <= 1}
                aria-label="Remove adult"
              >
                -
              </button>
              <span>{adults}</span>
              <button type="button" onClick={() => updateAdults(adults + 1)} aria-label="Add adult">+</button>
            </div>
          </div>
          <div className="quick-row">
            <div>
              <strong>{copy.children}</strong>
              <small>{copy.childrenNote}</small>
            </div>
            <div className="quantity-control">
              <button type="button" onClick={() => updateChildren(children - 1)} aria-label="Remove child">-</button>
              <span>{children}</span>
              <button type="button" onClick={() => updateChildren(children + 1)} aria-label="Add child">+</button>
            </div>
          </div>
        </div>

        {renderEuTicketFields()}

        <div className="quick-fields">
          <label className="field-label">
            {copy.firstName}
            <input
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </label>
          <label className="field-label">
            {copy.lastName}
            <input
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </label>
          <label className="field-label quick-full">
            {copy.email}
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field-label quick-full">
            {copy.phone}
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        </div>

        <div className="quick-total-card">
          <div className="quick-total-head">
            <span>{adults} {adults > 1 ? copy.adultTickets : copy.adultTicket}</span>
            <strong>EUR {total.toFixed(2)}</strong>
          </div>
          <div className="quick-price-breakdown">
            <h3>{copy.breakdown}</h3>
            <div>
              <span>{copy.faceValue}</span>
              <strong>EUR {product.faceValue.toFixed(2)} x {payingVisitors}</strong>
            </div>
            <div>
              <span>{copy.eGuideFee}</span>
              <strong>EUR {product.eGuideFee.toFixed(2)} x {payingVisitors}</strong>
            </div>
            <div>
              <span>{copy.serviceFee}</span>
              <strong>EUR {product.serviceFee.toFixed(2)} x {payingVisitors}</strong>
            </div>
            <div>
              <span>{copy.childrenLabel}</span>
              <strong>EUR 0.00 x {children}</strong>
            </div>
          </div>
        </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={acceptSubstitution}
              onChange={(event) => setAcceptSubstitution(event.target.checked)}
            />
            {copy.substitution.replace("{business}", business.legalName)}
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
            />
            <TermsConsentText />
          </label>

          <div className="notice-box slim">
            <strong>{ui[locale].flow.disclosureTitle}</strong> {ui[locale].nonAffiliation}
          </div>

          <button
            type="button"
            className="pay-button"
            disabled={!canSubmit || isSubmitting}
            aria-busy={isSubmitting}
            onClick={startCheckout}
          >
            {isSubmitting ? "Redirecting to Stripe..." : copy.pay}
          </button>
          {status ? <p className="status-message">{status}</p> : null}
          <p className="secure-note">{copy.secureNote}</p>
      </div>
    </section>
  );
}
