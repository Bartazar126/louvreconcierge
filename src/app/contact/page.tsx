import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { business, siteUrl } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Us",
    url: `${siteUrl}/contact`,
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
    },
  };

  const breadcrumbSchema = {
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
        name: "Contact Us",
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <main className="contact-page">
      <JsonLd data={contactPageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="contact-hero">
        <div className="container contact-title">
          <h1>Contact Us</h1>
          <p>
            Have questions about your booking? Our support team is available
            {` ${business.supportHours}.`}
          </p>
        </div>
      </section>

      <section className="container contact-grid">
        <article className="contact-card">
          <h2>Send us a message</h2>
          <form className="contact-form">
            <label>
              Your Name
              <input type="text" name="name" autoComplete="name" />
            </label>
            <label>
              Email Address
              <input type="email" name="email" autoComplete="email" />
            </label>
            <label>
              Order ID (Optional)
              <input type="text" name="orderId" />
            </label>
            <label>
              Subject
              <select name="subject" defaultValue="General Inquiry">
                <option>General Inquiry</option>
                <option>Modification / Cancellation</option>
                <option>Payment Issue</option>
                <option>Group Booking</option>
              </select>
            </label>
            <label className="contact-full">
              Message
              <textarea name="message" rows={6} />
            </label>
            <a className="contact-submit" href={`mailto:${business.email}`}>
              Send Message
            </a>
          </form>
        </article>

        <aside className="contact-side">
          <article className="contact-card">
            <h2>Get in Touch</h2>
            <div className="contact-info-line">
              <strong>Response time</strong>
              <p>We respond to inquiries within 24-48 hours on business days.</p>
            </div>
            <div className="contact-info-line">
              <strong>Email Support</strong>
              <p><a href={`mailto:${business.email}`}>{business.email}</a></p>
              <small>For faster assistance, please include your Order ID.</small>
            </div>
            <div className="contact-info-line">
              <strong>Phone Support</strong>
              <p><a href={`tel:${business.phoneHref}`}>{business.phoneDisplay}</a></p>
              <small>Available {business.supportHours}. For faster assistance, please have your Order ID ready.</small>
            </div>
            <div className="contact-info-line">
              <strong>Service Hours</strong>
              <p>Online Booking: available through the website</p>
              <p>Customer Support: {business.supportHours}</p>
            </div>
          </article>

          <article className="contact-card business-card">
            <h2>Business Information</h2>
            <p><strong>Company Name:</strong> {business.legalName}</p>
            <p><strong>Reg. Number (IČO):</strong> {business.ico}</p>
            <p><strong>VAT ID (IČ DPH):</strong> SK{business.vatId}</p>
            <p><strong>Registered Office:</strong> Nam. Sv. Imricha 923/21, 943 01 Sturovo, Slovak Republic</p>
            <p><strong>Country:</strong> Slovak Republic</p>
          </article>
        </aside>
      </section>
    </main>
  );
}
