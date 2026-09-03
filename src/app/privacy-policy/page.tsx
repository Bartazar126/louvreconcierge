import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      intro={`${business.legalName} is the data controller for this website and booking service.`}
      canonicalPath="/privacy-policy"
    >
      <h2>Data Controller</h2>
      <p>{business.legalName}</p>
      <p>{business.address}</p>
      <p>
        Email: <a href={`mailto:${business.email}`}>{business.email}</a>
      </p>
      {business.phoneDisplay && business.phoneHref ? (
        <p>
          Phone: <a href={`tel:${business.phoneHref}`}>{business.phoneDisplay}</a>
        </p>
      ) : null}
      <h2>Data Retention</h2>
      <ul>
        <li>Booking, payment confirmation, and invoice records: retained for tax and accounting-law requirements, typically 10 years in the Slovak Republic under Act No. 431/2002 Coll. on Accounting.</li>
        <li>Customer support emails and contact-form messages: retained for 12 months after the last customer interaction, unless a longer period is needed to resolve a dispute or legal claim.</li>
        <li>Consent records: retained for 6 months, after which consent is requested again if needed.</li>
        <li>Analytics data: retained for up to 26 months if analytics consent is granted.</li>
        <li>Advertising measurement data: retained according to Google Ads cookie retention disclosed in the Cookie Policy, only if advertising consent is granted.</li>
      </ul>
      <h2>Processors and International Transfers</h2>
      <p>
        Stripe Payments Europe, Ltd. and Stripe, Inc. may process payment,
        fraud-prevention, and transaction data when a customer proceeds to
        payment. Google Ireland Limited and Google LLC may process analytics and
        advertising measurement data only if the visitor grants the matching
        cookie category. Transfers outside the EEA, including transfers to the
        United States, are handled through applicable Standard Contractual
        Clauses, the EU-US Data Privacy Framework where available, adequacy
        decisions, or another valid Article 46 GDPR transfer mechanism.
      </p>
      <h2>Tracking and Session-Recording Inventory</h2>
      <p>
        The site is intended to use Google Analytics and Google Ads measurement
        only after consent is granted through the cookie banner. No Hotjar,
        Microsoft Clarity, FullStory, Smartlook, LogRocket, Meta Pixel, LinkedIn
        Insight Tag, TikTok Pixel, or other heatmap/session-recording script is
        intentionally installed. If any additional tracker is added later, this
        policy and the Cookie Policy must be updated before deployment.
      </p>
      <h2>DPO</h2>
      <p>
        A Data Protection Officer is not currently appointed because the business
        does not rely on large-scale special-category processing or systematic
        large-scale monitoring as its core activity.
      </p>
      <h2>Right to Lodge a Complaint</h2>
      <p>
        EU users may complain to the Slovak Office for Personal Data Protection
        at https://www.dataprotection.gov.sk or to the CNIL at
        https://www.cnil.fr/fr/plaintes.
      </p>
      <h2>Cookies</h2>
      <p>
        Cookies are grouped into Essential, Analytics, and Advertising
        categories. Essential storage is required for consent and core site
        operation. Analytics and Advertising cookies are optional and are not
        enabled unless the visitor grants category-specific consent. See the
        Cookie Policy for cookie names, providers, purposes, categories, and
        retention periods.
      </p>
    </LegalPage>
  );
}
