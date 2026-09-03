import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { business } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="About"
      title={`About ${business.legalName}`}
      intro={`${business.brandName} is a digital Louvre ticket request and e-guide service operated by ${business.legalName}.`}
      canonicalPath="/about"
      schemaType="AboutPage"
    >
      <h2>Company Background</h2>
      <p>
        {business.legalName} is the current operating entity for this website
        and booking service. The company operates from Slovakia under IČO
        {` ${business.ico}`}.
      </p>
      <p>
        The company was established on 2025-06-30. The current operating entity
        for this website is {business.legalName}. Public registry details can be
        verified using IČO {business.ico}.
      </p>
      <h2>Why We Built This</h2>
      <p>
        We built this service for travelers who want a straightforward way to
        plan a Paris museum visit before they arrive. Louvre booking rules,
        time-slot availability, digital delivery, and museum-entry expectations
        can be confusing, especially for first-time visitors. Our goal is to
        combine a ticket request with practical e-guide materials, clear price
        disclosure, and customer support during published hours. The service is
        operated from Slovakia as an independent reseller and is not affiliated
        with the Louvre Museum.
      </p>
      <h2>Address and Operations</h2>
      <p>
        The registered office used consistently across this website is
        {` ${business.address}`}.
      </p>
      <h2>Registered Details</h2>
      <p>{business.legalName}</p>
      <p>{business.address}</p>
    </LegalPage>
  );
}
