import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/data/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refund Policy"
      title="Refund Policy"
      intro={`This policy explains when bookings made through ${business.brandName} may be cancelled or refunded.`}
      canonicalPath="/refund-policy"
    >
      <p><strong>Last Updated:</strong> December 10, 2025</p>

      <h2>Cancellation Eligibility</h2>
      <p>
        Cancellation and refund eligibility depends on the selected product and
        the timing shown during checkout. Some leisure services are provided for
        a specific date or time slot, so refund rights may be limited once a
        booking is confirmed or tickets have been issued.
      </p>

      <h2>24-Hour Cancellation Window</h2>
      <p>
        Where a 24-hour cancellation window is offered, cancellation requests
        must be sent before that deadline to{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>. Requests
        received after the stated deadline may not be eligible for a refund.
      </p>

      <h2>Refund Method</h2>
      <p>
        Approved refunds are returned to the original payment method used at
        checkout. We cannot issue a refund to a different card, wallet, or bank
        account.
      </p>

      <h2>Refund Timeline</h2>
      <p>
        Once a refund is approved and submitted, the payment provider and the
        customer&apos;s bank or card issuer control the posting time. Refunds
        commonly appear within 5-10 business days, although individual banks may
        take longer.
      </p>

      <h2>Consumer Rights</h2>
      <p>
        For leisure services provided for a specific date or period, the
        statutory right of withdrawal may be excluded under Directive
        2011/83/EU, Article 16(l). Nothing in this policy removes mandatory
        consumer rights that apply under the customer&apos;s habitual-residence
        law.
      </p>
    </LegalPage>
  );
}
