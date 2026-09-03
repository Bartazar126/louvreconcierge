import type { Metadata } from "next";
import Script from "next/script";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { business, siteUrl } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Louvre Tickets & E-Guide Service | LouvreTickets by TourCierge",
    template: "%s | LouvreTickets by TourCierge",
  },
  description:
    `Independent Louvre ticket reseller and digital e-guide service operated by ${business.legalName}.`,
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", type: "image/x-icon" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/favicon.png?v=3",
  },
  openGraph: {
    title: "Louvre Tickets & E-Guide Service",
    description:
      "Timed Louvre ticket request with a digital e-guide and transparent reseller pricing.",
    url: siteUrl,
    siteName: business.brandName,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7CYPPM6KB2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7CYPPM6KB2');
            gtag('config', 'AW-17788579077');
          `}
        </Script>
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
