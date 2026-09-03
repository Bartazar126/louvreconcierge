"use client";

import { useEffect } from "react";

type GoogleAdsConversionProps = {
  transactionId: string;
  value: number;
  currency: string;
};

const storageKey = "cookie-preferences";
const conversionStoragePrefix = "google-ads-conversion:";

function hasAdvertisingConsent() {
  try {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return false;
    }

    const parsed = JSON.parse(saved) as { advertising?: boolean };
    return Boolean(parsed.advertising);
  } catch {
    return false;
  }
}

export function GoogleAdsConversion({
  transactionId,
  value,
  currency,
}: GoogleAdsConversionProps) {
  useEffect(() => {
    if (!transactionId || !hasAdvertisingConsent()) {
      return;
    }

    const dedupeKey = `${conversionStoragePrefix}${transactionId}`;

    if (window.sessionStorage.getItem(dedupeKey)) {
      return;
    }

    window.sessionStorage.setItem(dedupeKey, "1");

    window.gtag?.("event", "conversion", {
      send_to: "AW-17788579077/p70GCPmG5M4bEIXaoKJC",
      value,
      currency,
      transaction_id: transactionId,
    });
  }, [transactionId, value, currency]);

  return null;
}
