import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of Service"
      intro={`These terms apply to bookings made through ${business.brandName}, operated by ${business.legalName}.`}
      canonicalPath="/terms-of-service"
    >
      <p><strong>Last Updated:</strong> December 10, 2025</p>
      <h2>Service Provider Information</h2>
      <p><strong>Company Name:</strong> {business.legalName}</p>
      <p><strong>Registration Number (IČO):</strong> {business.ico}</p>
      <p><strong>Tax Number (DIČ):</strong> {business.vatId}</p>
      <p><strong>VAT Number (IČ DPH):</strong> SK{business.vatId} (registered from July 9, 2025)</p>
      <p><strong>Registered Office:</strong> Nam. Sv. Imricha 923/21, 943 01 Sturovo, Slovak Republic</p>
      <p>
        <strong>Email:</strong> <a href={`mailto:${business.email}`}>{business.email}</a>
      </p>
      {business.phoneDisplay && business.phoneHref ? (
        <p>
          <strong>Phone:</strong> <a href={`tel:${business.phoneHref}`}>{business.phoneDisplay}</a>
        </p>
      ) : null}

      <h2>1. Identification</h2>
      <p>
        {business.legalName} is the owner and operator of this website and the
        related booking service. The current operating entity is
        {` ${business.legalName}`}. The company was established on June 30, 2025.
      </p>
      <p>
        Users must be of legal age to contract online services. If a user is not
        legally able to contract, they must refrain from using the booking
        service.
      </p>

      <h2>2. Purpose</h2>
      <p>
        These Terms regulate access to this website and the electronic
        contracting of ticket-request, e-guide, support, and related travel
        services offered by {business.legalName}.
      </p>
      <p>
        By using this website or completing a booking, the user accepts these
        Terms, the Privacy Policy, the Cookie Policy, and the specific conditions
        shown during checkout.
      </p>

      <h2>3. Minors</h2>
      <p>
        Contracting services by minors is prohibited. Adults responsible for
        minors must decide whether the services and website content are suitable
        for those minors.
      </p>

      <h2>4. Website Content and Intellectual Property</h2>
      <p>
        Website content may include information prepared by {business.legalName}
        and information from third parties. We aim to keep content reasonably
        accurate and current, but website content is informational and does not
        constitute professional advice.
      </p>
      <p>
        All website content is protected by copyright, trademark, and other
        intellectual-property rules. Reproduction, distribution, or commercial use
        requires prior written authorization unless allowed by law.
      </p>

      <h2>5. User Obligations</h2>
      <p>
        Users must use the website lawfully and must not interfere with its
        normal operation, harm the rights of {business.legalName} or third
        parties, or provide false, incomplete, or unlawful information.
      </p>

      <h2>6. Booking Process</h2>
      <p>
        To complete a booking, the user must select the desired service, visit
        date and preferred time, participant numbers, and required contact or
        participant details. The booking flow requires affirmative acceptance of
        the key terms shown before payment.
      </p>
      <p>
        A booking is subject to payment validation, correct customer data, and
        actual availability of the requested product or time slot. We may reject
        or cancel a booking if payment fails, data is incomplete or incorrect, or
        the user breaches these Terms.
      </p>

      <h2>7. Personal Data Required for Tickets</h2>
      <p>
        Some monument or museum access tickets may be nominative, personal, and
        non-transferable. If names or other participant details are required,
        they must be provided accurately and on time. Incorrect or incomplete
        data may prevent ticket issuance or access to the venue.
      </p>

      <h2>8. Ticket Delivery</h2>
      <p>
        Tickets or booking materials are sent to the email address provided by
        the user. Tickets may be delivered up to 24 hours before the scheduled
        activity. For bookings made less than 24 hours in advance, delivery may
        occur closer to the activity start time.
      </p>
      <p>
        The user is responsible for providing a valid email address and checking
        inbox, spam, and junk folders.
      </p>

      <h2>9. Time-Slot Substitution</h2>
      <p>
        If the selected Louvre time slot becomes unavailable,
        {` ${business.legalName}`} may offer or issue a nearby alternative time
        slot within a reasonable window. This right is disclosed in the booking
        flow itself, where the customer must acknowledge before continuing to
        payment: “I understand my time slot may be substituted by
        {` ${business.legalName}`} within a reasonable window.”
      </p>
      <p>
        The final access time shown on issued tickets or booking confirmation
        must be reviewed by the customer. Failure to arrive for the assigned
        access time may result in denied entry without refund.
      </p>

      <h2>10. Payments</h2>
      <p>
        Payments may be processed by Stripe. Accepted payment methods include
        Visa, Mastercard, American Express, and Apple Pay where available. By
        completing payment through a payment provider, the user also accepts the
        applicable payment-provider terms.
      </p>

      <h2>11. Prices and Price Transparency</h2>
      <p>
        Before payment, the booking flow displays the price components,
        including the original ticket face value, digital e-guide fee, service or
        management fee, child-price line where applicable, and the total amount
        due. This breakdown is shown before the payment button.
      </p>
      <p>
        Listed prices may include value-added services such as digital guide
        materials, booking administration, customer support, payment processing
        administration, and the seller’s commercial margin. Taxes and mandatory
        fees are included where applicable.
      </p>

      <h2>12. Cancellation, Withdrawal, and Refund Policy</h2>
      <p>
        Cancellation and refund eligibility depends on the selected product and
        timing shown during checkout. Where a 24-hour cancellation window is
        offered, cancellation requests must be sent before that deadline to
        <a href={`mailto:${business.email}`}> {business.email}</a>.
      </p>
      <p>
        For leisure services provided for a specific date or period, the
        statutory right of withdrawal may be excluded under Directive
        2011/83/EU, Article 16(l). Nothing in this section removes mandatory
        consumer rights that apply under the customer’s habitual-residence law.
      </p>

      <h2>13. Access Conditions</h2>
      <p>
        The user must bring any identification required by the venue or ticket
        type. Access may be refused by the venue if required identification is
        missing, if ticket names do not match required participant details, or if
        the user arrives late.
      </p>

      <h2>14. Complaints and Online Dispute Resolution</h2>
      <p>
        Complaints can be sent to <a href={`mailto:${business.email}`}>{business.email}</a>.
        The user should include their full name, contact email, order reference,
        a description of the issue, and any supporting documentation.
      </p>
      <p>
        Consumers in the EU may also access the European Commission&apos;s Online
        Dispute Resolution platform at https://ec.europa.eu/consumers/odr.
      </p>

      <h2>15. Applicable Law and Consumer Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of the Slovak Republic, except where
        mandatory consumer-protection rules provide otherwise.
      </p>
      <p>
        Notwithstanding the foregoing, EU consumers retain all rights to bring
        actions in their country of domicile under Regulation (EU) No 1215/2012,
        and the protections of their habitual-residence law are not waived.
      </p>

      <h2>16. Contact</h2>
      <p><strong>Postal Address:</strong> {business.legalName}, Nam. Sv. Imricha 923/21, 943 01 Sturovo, Slovak Republic</p>
      {business.phoneDisplay && business.phoneHref ? (
        <p>
          <strong>Phone:</strong> <a href={`tel:${business.phoneHref}`}>{business.phoneDisplay}</a>
        </p>
      ) : null}
      <p>
        <strong>Email:</strong> <a href={`mailto:${business.email}`}>{business.email}</a>
      </p>
    </LegalPage>
  );
}
