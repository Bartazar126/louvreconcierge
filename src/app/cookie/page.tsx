import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { cookieRows } from "@/data/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: "/cookie" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Cookie Policy"
      title="Cookie Policy"
      intro="Optional analytics and advertising cookies are not used unless the visitor grants category-specific consent."
      canonicalPath="/cookie"
    >
      <h2>Consent Categories</h2>
      <ul>
        <li>Essential: required for site operation and consent storage.</li>
        <li>Analytics: optional measurement cookies, only after consent.</li>
        <li>Advertising: optional ad measurement cookies, only after consent.</li>
      </ul>
      <p>
        Analytics and advertising tags must remain inactive until the visitor
        grants the matching category. Declining optional cookies keeps Google
        Analytics and Google Ads storage denied.
      </p>
      <h2>Cookie-by-Cookie Disclosure</h2>
      {cookieRows.map((row) => (
        <section key={row.name}>
          <h3>{row.name}</h3>
          <p>Provider: {row.provider}</p>
          <p>Purpose: {row.purpose}</p>
          <p>Type: {row.type}</p>
          <p>Retention: {row.retention}</p>
          <p>Category: {row.category}</p>
        </section>
      ))}
    </LegalPage>
  );
}
