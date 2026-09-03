import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { business, siteUrl } from "@/data/site";

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  canonicalPath?: string;
  schemaType?: "WebPage" | "AboutPage" | "ContactPage";
  children: ReactNode;
};

export function LegalPage({
  eyebrow = "Legal",
  title,
  intro,
  canonicalPath,
  schemaType = "WebPage",
  children,
}: LegalPageProps) {
  const pageUrl = canonicalPath ? `${siteUrl}${canonicalPath}` : undefined;
  const webPageSchema = pageUrl
    ? {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: title,
        description: intro,
        url: pageUrl,
        isPartOf: {
          "@type": "WebSite",
          name: business.brandName,
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: business.legalName,
          url: siteUrl,
          email: business.email,
          ...(business.phoneDisplay ? { telephone: business.phoneDisplay } : {}),
        },
      }
    : null;
  const breadcrumbSchema = pageUrl
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: pageUrl,
          },
        ],
      }
    : null;

  return (
    <main className="legal-page">
      {webPageSchema ? <JsonLd data={webPageSchema} /> : null}
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <section className="container">
        <article className="legal-card">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro ? <p>{intro}</p> : null}
          {children}
        </article>
      </section>
    </main>
  );
}
