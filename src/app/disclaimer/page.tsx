import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business, nonAffiliation } from "@/data/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Disclaimer"
      title="Independence and Non-Affiliation"
      intro={nonAffiliation}
      canonicalPath="/disclaimer"
    >
      <section className="disclosure-callout">
        <p>{nonAffiliation}</p>
      </section>
      <h2>Independent Reseller Status</h2>
      <p>
        {business.brandName} is operated by {business.legalName}. We provide a
        bundled service that may include a timed Louvre ticket request, digital
        e-guide materials, customer support, and service administration.
      </p>
      <h2>No Queue-Skipping Claim</h2>
      <p>
        Online ticketing helps customers avoid the museum cashier queue and
        request a timed-entry slot. It does not allow customers to skip Louvre
        security screening, capacity controls, or any museum-managed entry line.
      </p>
      <h2>Price Transparency</h2>
      <p>
        The booking flow displays the original Louvre ticket face value, digital
        e-guide fee, service or management fee, and total before checkout.
      </p>
    </LegalPage>
  );
}
