import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/LegalPage";
import { faqs, siteUrl } from "@/data/site";

export const metadata: Metadata = {
  title: "FAQ",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: `${siteUrl}/faq`,
  };

  return (
    <LegalPage
      eyebrow="Frequently Asked Questions"
      title="FAQ"
      intro="Clear answers about Louvre timed-entry requests, digital e-guides, queue expectations, and refunds."
      canonicalPath="/faq"
    >
      <JsonLd data={faqSchema} />
      {faqs.map((faq) => (
        <section key={faq.question}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </section>
      ))}
    </LegalPage>
  );
}
