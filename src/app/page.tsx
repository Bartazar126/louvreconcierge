import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProductBookingFlow } from "@/components/ProductBookingFlow";
import { Locale } from "@/data/i18n";
import { getLocalizedProductsWithPrices } from "@/lib/products";
import { blogPosts, business, faqs, siteUrl } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const homeCopy = {
  en: {
    supportTitle: "Customer Support",
    supportText: "Our support channel is available during published hours for booking questions, delivery issues, and visit preparation.",
    digitalTitle: "100% Digital Tickets",
    digitalText: "No need to print! Receive your tickets by email and scan them directly from your phone.",
    secureTitle: "Secure Booking",
    secureText: "Your payment information is protected with SSL encryption standards and transparent checkout details.",
    guideTitle: "Guide to Louvre Museum Visits: Booking with LouvreTickets by TourCierge",
    guideIntro: "Planning your trip to France? Secure your Louvre Museum Paris tickets online and avoid the uncertainty. Our service package provides you with valid Louvre entry tickets and a comprehensive Audio E-Guide to enhance your visit. Whether you are looking for Louvre tickets for a solo tour or a family visit, book now to guarantee your access to the world's most famous art museum.",
    quickFacts: "Quick Facts",
    facts: [
      ["Ticket Requirement:", "Online booking is recommended to guarantee your time slot, especially during peak season."],
      ["Best Time to Visit:", "Wednesday or Friday mornings."],
      ["Entrances:", "Pyramid (Main), Carrousel (Shopping Mall), Richelieu."],
    ],
    typesTitle: "Types of Louvre Tickets Available",
    typesText: "Choosing the right admission depends on how deep you want to dive into the history of art. Here are the most popular options available on our platform:",
    types: [
      ["Standard Entry Ticket:", "Access to permanent collections and temporary exhibitions. Perfect for independent explorers."],
      ["Ticket + Audio Guide (E-Guide):", "Highly recommended. The museum is massive (60,600 square meters). The audio guide helps you navigate and understand the context behind masterpieces."],
      ["Combi-Tickets (Paris Saver):", "Combine your Louvre Museum entry with a Seine River Cruise or the Eiffel Tower to save money and time."],
    ],
    whyTitle: "Why Buy Tickets Online?",
    whyText: "Since the pandemic, the Louvre has introduced a strict time-slot system. Here is why you should never arrive without a ticket:",
    whyItems: [
      ["Skip the cashier queue:", "Digital tickets let you avoid the museum cashier. They do not skip security or museum-managed entry queues."],
      ["Guaranteed Entry:", "Tickets for popular dates often sell out weeks in advance. Buying online secures your spot."],
      ["Instant Mobile Access:", "No printer? No problem. Show the QR code on your smartphone at the entrance."],
    ],
    gettingTitle: "How to Get to the Louvre?",
    gettingText: "The museum is located in the heart of Paris, on the Right Bank of the Seine (1st arrondissement).",
    transport: [
      ["By Metro:", "Take Line 1 or Line 7 and get off at Palais Royal - Musée du Louvre station."],
      ["By Bus:", "Lines 21, 24, 27, 39, 48, 68, 69, 72, 81, 95 all stop in front of the Pyramid."],
      ["By Batobus:", "Get off at the \"Louvre\" stop on the François Mitterrand quay."],
    ],
    rulesTitle: "Visitor Rules & Tips",
    rulesText: "Large bags and suitcases are not allowed inside. While photography is permitted, using flash or selfie sticks is prohibited near major artworks like the Mona Lisa to protect the paintings and ensure smooth visitor flow.",
    priceTitle: "Original Price Disclosure",
    priceText: "Standalone Louvre packages on this site start at EUR 39.90 per adult, including the ticket face value, e-guide fee, and service fee shown separately before checkout.",
    faqTitle: "Frequently Asked Questions",
    blogTitle: "Latest from Our Blog",
    faqs,
    blogPosts,
  },
  fr: {
    supportTitle: "Support client",
    supportText: "Notre support est disponible aux horaires publiés pour les questions de réservation, de livraison et de préparation de visite.",
    digitalTitle: "Billets 100 % numériques",
    digitalText: "Pas besoin d'imprimer. Recevez vos billets par e-mail et scannez-les directement depuis votre téléphone.",
    secureTitle: "Réservation sécurisée",
    secureText: "Vos informations de paiement sont protégées par chiffrement SSL et un checkout transparent.",
    guideTitle: "Guide de visite du musée du Louvre avec LouvreTickets by TourCierge",
    guideIntro: "Vous préparez votre voyage en France ? Réservez vos billets pour le musée du Louvre en ligne avec notre service de billet et e-guide numérique afin de mieux préparer votre visite.",
    quickFacts: "Informations rapides",
    facts: [["Billet :", "La réservation en ligne est recommandée pour garantir votre créneau, surtout en haute saison."], ["Meilleur moment :", "Mercredi ou vendredi matin."], ["Entrées :", "Pyramide, Carrousel, Richelieu."]],
    typesTitle: "Types de billets disponibles",
    typesText: "Choisissez l'option selon le niveau d'accompagnement souhaité.",
    types: [["Billet standard :", "Accès aux collections permanentes et expositions temporaires."], ["Billet + e-guide :", "Recommandé pour mieux comprendre les chefs-d'oeuvre."], ["Billets combinés :", "Combinez le Louvre avec la Seine ou la tour Eiffel."]],
    whyTitle: "Pourquoi acheter en ligne ?",
    whyText: "Le Louvre utilise un système de créneaux horaires. Réserver en ligne réduit l'incertitude.",
    whyItems: [["Évitez la caisse :", "Les billets numériques évitent la caisse du musée, mais pas les contrôles de sécurité."], ["Entrée demandée :", "Les dates populaires peuvent être complètes à l'avance."], ["Accès mobile :", "Montrez le QR code sur votre téléphone."]],
    gettingTitle: "Comment aller au Louvre ?",
    gettingText: "Le musée se trouve au coeur de Paris, rive droite de la Seine.",
    transport: [["En métro :", "Ligne 1 ou 7, station Palais Royal - Musée du Louvre."], ["En bus :", "Les lignes 21, 24, 27, 39, 48, 68, 69, 72, 81 et 95 s'arrêtent près de la Pyramide."], ["En Batobus :", "Descendez à l'arrêt Louvre."]],
    rulesTitle: "Règles et conseils",
    rulesText: "Les grands sacs et valises ne sont pas autorisés. Le flash et les perches à selfie sont interdits près des oeuvres majeures.",
    priceTitle: "Transparence du prix original",
    priceText: "Les forfaits Louvre autonomes de ce site commencent à 39,90 EUR par adulte, avec la valeur faciale du billet, les frais d'e-guide et les frais de service affichés séparément avant paiement.",
    faqTitle: "Questions fréquentes",
    blogTitle: "Derniers articles",
    faqs: [
      { question: "Dois-je imprimer mes billets ?", answer: "Non. Les billets peuvent généralement être présentés sur smartphone." },
      { question: "Ce billet permet-il de sauter la file d'entrée ?", answer: "Non. Il aide à éviter la caisse et à demander un créneau, mais tous les visiteurs passent la sécurité." },
      { question: "La réservation en ligne est-elle obligatoire ?", answer: "Elle est recommandée pour garantir votre créneau, surtout en haute saison." },
    ],
    blogPosts: [
      { ...blogPosts[0], title: "Comment éviter la foule devant la Joconde ?", excerpt: "Conseils pratiques pour mieux organiser votre visite." },
      { ...blogPosts[1], title: "Le Louvre de nuit : est-ce intéressant ?", excerpt: "Découvrez l'ambiance des soirées au musée." },
      { ...blogPosts[2], title: "Où manger près du Louvre", excerpt: "Bistros et cafés à quelques minutes à pied." },
    ],
  },
};

const localizedHomeCopy = {
  ...homeCopy,
  es: {
    ...homeCopy.fr,
    supportTitle: "Atención al cliente",
    digitalTitle: "Entradas 100 % digitales",
    secureTitle: "Reserva segura",
    guideTitle: "Guía para visitar el Museo del Louvre con LouvreTickets by TourCierge",
    quickFacts: "Datos rápidos",
    faqTitle: "Preguntas frecuentes",
    blogTitle: "Últimas publicaciones",
  },
  de: {
    ...homeCopy.fr,
    supportTitle: "Kundensupport",
    digitalTitle: "100 % digitale Tickets",
    secureTitle: "Sichere Buchung",
    guideTitle: "Guide für Louvre-Besuche mit LouvreTickets by TourCierge",
    quickFacts: "Kurzinfos",
    faqTitle: "Häufige Fragen",
    blogTitle: "Neu im Blog",
  },
  it: {
    ...homeCopy.fr,
    supportTitle: "Supporto clienti",
    digitalTitle: "Biglietti 100% digitali",
    secureTitle: "Prenotazione sicura",
    guideTitle: "Guida per visitare il Museo del Louvre con LouvreTickets by TourCierge",
    quickFacts: "Informazioni rapide",
    faqTitle: "Domande frequenti",
    blogTitle: "Ultimi articoli",
  },
} as Record<Locale, typeof homeCopy.en>;

export async function HomeContent({ locale = "en" }: { locale?: Locale }) {
  const t = localizedHomeCopy[locale];
  const localizedProducts = await getLocalizedProductsWithPrices(locale);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.legalName,
    alternateName: business.brandName,
    url: siteUrl,
    email: business.email,
    ...(business.phoneDisplay ? { telephone: business.phoneDisplay } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Karpatské námestie 10A",
      postalCode: "831 06",
      addressLocality: "Bratislava",
      addressCountry: "SK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: business.email,
      ...(business.phoneDisplay ? { telephone: business.phoneDisplay } : {}),
      availableLanguage: ["en", "fr", "es", "de", "it"],
      hoursAvailable: business.supportHours,
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.brandName,
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: business.legalName,
      url: siteUrl,
    },
  };

  return (
    <main>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <ProductBookingFlow locale={locale} products={localizedProducts} />

      <section className="section muted-bg why-section">
        <div className="container feature-grid">
          <article>
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true">
              <path d="M224 64c-79 0-144.7 57.3-157.7 132.7 9.3-3 19.3-4.7 29.7-4.7l16 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0c-53 0-96-43-96-96l0-64C0 100.3 100.3 0 224 0S448 100.3 448 224l0 168.1c0 66.3-53.8 120-120.1 120l-87.9-.1-32 0c-26.5 0-48-21.5-48-48s21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 0 40 0c39.8 0 72-32.2 72-72l0-20.9c-14.1 8.2-30.5 12.8-48 12.8l-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l16 0c10.4 0 20.3 1.6 29.7 4.7-13-75.3-78.6-132.7-157.7-132.7z" />
            </svg>
            <h2>{t.supportTitle}</h2>
            <p>{t.supportText}</p>
          </article>
          <article>
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" aria-hidden="true">
              <path d="M16 64C16 28.7 44.7 0 80 0H304c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H80c-35.3 0-64-28.7-64-64V64zM224 448a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM320 64H64V384H320V64z" />
            </svg>
            <h2>{t.digitalTitle}</h2>
            <p>{t.digitalText}</p>
          </article>
          <article>
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
              <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0z" />
            </svg>
            <h2>{t.secureTitle}</h2>
            <p>{t.secureText}</p>
          </article>
        </div>
      </section>

      <section className="section guide-section">
        <div className="container two-column">
          <div>
            <h2 className="section-title text-start">{t.guideTitle}</h2>
            <p>{t.guideIntro}</p>
            <h3 className="guide-icon-heading">
              <svg viewBox="0 0 512 512" aria-hidden="true">
                <path d="M192 32c0 17.7 14.3 32 32 32c123.7 0 224 100.3 224 224c0 17.7 14.3 32 32 32s32-14.3 32-32C512 128.9 383.1 0 224 0c-17.7 0-32 14.3-32 32zm0 96c0 17.7 14.3 32 32 32c70.7 0 128 57.3 128 128c0 17.7 14.3 32 32 32s32-14.3 32-32c0-106-86-192-192-192c-17.7 0-32 14.3-32 32zM96 144c0-26.5-21.5-48-48-48S0 117.5 0 144V368c0 79.5 64.5 144 144 144s144-64.5 144-144s-21.5-48-48-48H159.5l20.8-20.8c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L96 338.5V144z" />
              </svg>
              {t.quickFacts}
            </h3>
            <ul className="guide-icon-list">
              <li>
                <svg className="text-success" viewBox="0 0 512 512" aria-hidden="true">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
                <span>
                  <strong>{t.facts[0][0]}</strong> {t.facts[0][1]}
                </span>
              </li>
              <li>
                <svg className="text-warning" viewBox="0 0 512 512" aria-hidden="true">
                  <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                </svg>
                <span><strong>{t.facts[1][0]}</strong> {t.facts[1][1]}</span>
              </li>
              <li>
                <svg className="text-primary" viewBox="0 0 640 512" aria-hidden="true">
                  <path d="M320 32c0-9.9-4.5-19.2-12.3-25.2S289.8-1.4 280.2 1l-179.9 45C79 51.3 64 70.5 64 92.5V448H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H96 288h32V480 32zM256 256c17.7 0 32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32zM640 480c0 17.7-14.3 32-32 32H352c-17.7 0-32-14.3-32-32V32c0-17.7 14.3-32 32-32H608c17.7 0 32 14.3 32 32V480z" />
                </svg>
                <span><strong>{t.facts[2][0]}</strong> {t.facts[2][1]}</span>
              </li>
            </ul>
            <h3>{t.typesTitle}</h3>
            <p>{t.typesText}</p>
            <ul>
              {t.types.map(([title, text]) => <li key={title}><strong>{title}</strong> {text}</li>)}
            </ul>
            <h3>{t.whyTitle}</h3>
            <p>{t.whyText}</p>
            <ul>
              {t.whyItems.map(([title, text]) => <li key={title}><strong>{title}</strong> {text}</li>)}
            </ul>
            <h3>{t.gettingTitle}</h3>
            <p>{t.gettingText}</p>
            <ul className="guide-icon-list">
              <li>
                <svg viewBox="0 0 448 512" aria-hidden="true">
                  <path d="M96 32C51.8 32 16 67.8 16 112V384h32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V416H336v64c0 17.7 14.3 32 32 32s32-14.3 32-32V384h32V112c0-44.2-35.8-80-80-80H96zM32 352V112c0-35.3 28.7-64 64-64H352c35.3 0 64 28.7 64 64V352H32zM96 208a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm256 0a32 32 0 1 1 0-64 32 32 0 1 1 0 64z" />
                </svg>
                <span><strong>{t.transport[0][0]}</strong> {t.transport[0][1]}</span>
              </li>
              <li>
                <svg viewBox="0 0 512 512" aria-hidden="true">
                  <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM192 128h128V224H192V128zM96 160c0-17.7 14.3-32 32-32H160V224H96V160zm0 192v-64H416v64c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32zM384 128c17.7 0 32 14.3 32 32v64H352V128h32z" />
                </svg>
                <span><strong>{t.transport[1][0]}</strong> {t.transport[1][1]}</span>
              </li>
              <li>
                <svg viewBox="0 0 576 512" aria-hidden="true">
                  <path d="M288 0H416c17.7 0 32 14.3 32 32V48c0 17.7-14.3 32-32 32H384v64c0 17.7-14.3 32-32 32H320v64h32V208c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32v32c0 17.7-7.2 16-16 16H384V288H560c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H258.7c-9.2-22.1-23.3-41.8-40.8-58.4C226.7 284 232 270.6 232 256c0-35.3-28.7-64-64-64s-64 28.7-64 64c0 14.6 5.3 28 14.1 38.4C69.6 345 29.5 401.5 5.2 466.4C2 474.8 8.3 484 17.3 484H144 558.7c9 0 15.3-9.2 12.1-17.6c-17.8-47.6-43.1-91.4-74.8-129.5c-9.1-11-25.5-12.8-36.8-4.2L428.1 356l-36.9-38.8c-10.4-10.9-28-10.9-38.3 0L309.8 363.1c-16 16.8-44.5 13.1-55.7-7.2c-5-9.1-14.6-14.8-24.9-14.8H192c-9.7 0-18.7 5.1-24 13.5c-4.2 6.7-13.8 7.4-19 1.5l-6.4-7.3c-1.7-2-4.2-3.2-6.8-3.2H128c-5.1 0-9.2 4.1-9.2 9.2V368c0 5.1 4.1 9.2 9.2 9.2h28.4c2.5 0 4.9 1 6.7 2.8l7.2 7.2c16 16 42.6 14.3 56.5-3.6c5-6.4 12.8-10.2 20.9-10.2h19.8c8.8 0 17.1 4.3 22.3 11.5l48 66c7.7 10.6 23 11.9 32.4 2.8l38.4-37.3 35.7 34c10.4 9.9 26.6 9.3 36.3-1.3c27.5-30.1 50-63.5 66.8-99.2H416c17.7 0 32-14.3 32-32V288H320c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32H288z" />
                </svg>
                <span><strong>{t.transport[2][0]}</strong> {t.transport[2][1]}</span>
              </li>
            </ul>
            <h3>{t.rulesTitle}</h3>
            <p>{t.rulesText}</p>
            <h3>{t.priceTitle}</h3>
            <p>{t.priceText}</p>
          </div>
        </div>
      </section>

      <section className="section muted-bg faq-section">
        <div className="container">
          <div className="section-head">
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq-grid">
            {t.faqs.map((faq, index) => (
              <details key={faq.question} className="faq-card" open={index === 0}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="section blog-section">
        <div className="container">
          <div className="section-head">
            <h2>{t.blogTitle}</h2>
          </div>
          <div className="blog-grid">
            {t.blogPosts.map((post) => (
              <article key={post.title} className="blog-card">
                <img src={post.image} alt={post.alt} className="blog-img" loading="lazy" />
                <time>{post.date}</time>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function Home() {
  return <HomeContent />;
}

