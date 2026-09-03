"use client";

import { useEffect, useState } from "react";

type Preferences = {
  analytics: boolean;
  advertising: boolean;
};

const storageKey = "cookie-preferences";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGoogleConsent(next: Preferences, mode: "default" | "update" = "update") {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  const consentState: Record<string, string | number> = {
    analytics_storage: next.analytics ? "granted" : "denied",
    ad_storage: next.advertising ? "granted" : "denied",
    ad_user_data: next.advertising ? "granted" : "denied",
    ad_personalization: next.advertising ? "granted" : "denied",
  };

  if (mode === "default") {
    consentState.wait_for_update = 500;
  }

  window.gtag("consent", mode, consentState);
}

export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      updateGoogleConsent({ analytics: false, advertising: false }, "default");
      setVisible(true);
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Preferences;
      const savedPreferences = {
        analytics: Boolean(parsed.analytics),
        advertising: Boolean(parsed.advertising),
      };

      setPreferences(savedPreferences);
      updateGoogleConsent(savedPreferences);
      setVisible(false);
    } catch {
      window.localStorage.removeItem(storageKey);
      setVisible(true);
    }

    setReady(true);
  }, []);

  const save = (next: Preferences) => {
    updateGoogleConsent(next);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ essential: true, ...next, savedAt: new Date().toISOString() }),
    );
    setVisible(false);
  };

  if (!ready) {
    return null;
  }

  if (!visible) {
    return (
      <button
        type="button"
        className="cookie-settings-button"
        onClick={() => {
          setCustomize(true);
          setVisible(true);
        }}
      >
        Cookie settings
      </button>
    );
  }

  return (
    <section className="cookie-banner" aria-label="Cookie preferences">
      <div>
        <h2>We value your privacy</h2>
        <p>
          Essential cookies are always on. Analytics and advertising cookies are
          used only if you choose to allow them.
        </p>
        {customize ? (
          <div className="cookie-options">
            <label className="cookie-toggle disabled">
              <span>
                <strong>Essential</strong>
                <small>Required for consent storage and core site operation.</small>
              </span>
              <input type="checkbox" checked disabled />
            </label>
            <label className="cookie-toggle">
              <span>
                <strong>Analytics</strong>
                <small>Helps us measure visits after consent.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    analytics: event.target.checked,
                  }))
                }
              />
            </label>
            <label className="cookie-toggle">
              <span>
                <strong>Advertising</strong>
                <small>Allows Google Ads measurement after consent.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.advertising}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    advertising: event.target.checked,
                  }))
                }
              />
            </label>
          </div>
        ) : null}
      </div>
      <div className="cookie-actions">
        <button type="button" className="button muted" onClick={() => save({ analytics: false, advertising: false })}>
          Decline optional
        </button>
        <button type="button" className="button muted" onClick={() => setCustomize((value) => !value)}>
          Customize
        </button>
        {customize ? (
          <button type="button" className="button" onClick={() => save(preferences)}>
            Save preferences
          </button>
        ) : null}
        <button type="button" className="button" onClick={() => save({ analytics: true, advertising: true })}>
          Accept all
        </button>
      </div>
    </section>
  );
}
