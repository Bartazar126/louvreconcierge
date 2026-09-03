import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/data/site";

export const metadata: Metadata = {
  title: "Payment Policy",
  alternates: { canonical: "/payment-policy" },
};

export default function PaymentPolicyPage() {
  return (
    <LegalPage
      eyebrow="Payment Policy"
      title="Payment Policy"
      intro={`This policy explains how payments are handled for bookings made through ${business.brandName}.`}
      canonicalPath="/payment-policy"
    >
      <p><strong>Last Updated:</strong> December 10, 2025</p>

      <h2>Accepted Payment Methods</h2>
      <p>
        We accept Visa, Mastercard, American Express, and Apple Pay where
        available through the checkout flow. Available payment methods may vary
        depending on the customer&apos;s device, browser, and card issuer.
      </p>

      <h2>Currency</h2>
      <p>
        Prices are displayed and charged in EUR. Before payment, the booking
        flow displays the price components, including the original ticket face
        value, digital e-guide fee, service or management fee, child-price line
        where applicable, and the total amount due.
      </p>

      <h2>Payment Processor</h2>
      <p>
        Payments may be processed by Stripe and supported card or wallet payment
        methods. By completing payment through Stripe, the user also accepts the
        applicable Stripe payment-provider terms.
      </p>

      <h2>When Charges Are Processed</h2>
      <p>
        Charges are processed when the customer confirms payment during
        checkout. A booking is subject to payment validation, correct customer
        data, and actual availability of the requested product or time slot.
      </p>

      <h2>Payment Security</h2>
      <p>
        Card and wallet payments are handled through Stripe&apos;s encrypted
        checkout and payment infrastructure. We do not ask customers to send
        card details by email.
      </p>
    </LegalPage>
  );
}
