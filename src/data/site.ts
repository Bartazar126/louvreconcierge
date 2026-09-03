export const siteUrl = "https://louvretickets-tourcierge.com";

export const business = {
  legalName: "TourCierge s. r. o.",
  brandName: "LouvreTickets by TourCierge",
  email: "sales@louvretickets-tourcierge.com",
  phoneDisplay: "+1 (775) 252-7578",
  phoneHref: "+17752527578",
  address: "Registered office: Karpatské námestie 10A, 831 06 Bratislava - Rača, Slovak Republic",
  registryUrl: "https://finstat.sk/57383898",
  ico: "57383898",
  vatId: "2122693199",
  supportHours: "Daily, 08:00-22:00 GMT+1",
};

export const nonAffiliation =
  "LouvreTickets by TourCierge is an independent reseller and e-guide service. It is not affiliated with, sponsored by, authorized by, endorsed by, or operated by the Louvre Museum or any official Louvre entity.";

export type Product = {
  id: string;
  name: string;
  badge: string;
  summary: string;
  description: string;
  duration: string;
  address: string;
  heroImage: string;
  faceValue: number;
  eGuideFee: number;
  serviceFee: number;
  includes: string[];
  comboExtraComponent?: "eiffel" | "seine";
  comboExtraName?: string;
};

export type ParticipantCounts = {
  adults: number;
  youth: number;
  children: number;
  infants: number;
};

export type ComboComponentCounts = {
  adults: number;
  youth?: number;
  children: number;
  infants?: number;
};

export function getProductUnitPrice(product: Product) {
  return product.faceValue + product.eGuideFee + product.serviceFee;
}

export function isComboProduct(product: Product) {
  return Boolean(product.comboExtraComponent);
}

export function getComboExtraUnitPrice(product: Product) {
  return Number((getProductUnitPrice(product) - product.faceValue).toFixed(2));
}

export function getComboComponentAmount(
  product: Product,
  component: "louvre" | "eiffel" | "seine",
  counts: ComboComponentCounts,
) {
  if (component === "louvre") {
    return Number((counts.adults * product.faceValue).toFixed(2));
  }

  const paidVisitors = component === "eiffel"
    ? counts.adults + (counts.youth || 0) + counts.children
    : counts.adults + counts.children;

  return Number((paidVisitors * getComboExtraUnitPrice(product)).toFixed(2));
}

export function getComboExtraPaidVisitors(
  component: "eiffel" | "seine",
  counts: Pick<ComboComponentCounts, "adults" | "children"> & { youth?: number },
) {
  return component === "eiffel"
    ? counts.adults + (counts.youth || 0) + counts.children
    : counts.adults + counts.children;
}

export function isValidComboParticipantSelection(
  product: Product,
  louvreCounts: Pick<ComboComponentCounts, "adults" | "children">,
  extraCounts: ComboComponentCounts,
) {
  if (!isComboProduct(product) || !product.comboExtraComponent) {
    return false;
  }

  return (
    louvreCounts.adults >= 1 &&
    getComboExtraPaidVisitors(product.comboExtraComponent, extraCounts) >= 1
  );
}

export function getComboBookingTotal(
  product: Product,
  louvreCounts: ComboComponentCounts,
  extraCounts: ComboComponentCounts,
) {
  if (!product.comboExtraComponent) {
    return 0;
  }

  return Number((
    getComboComponentAmount(product, "louvre", louvreCounts) +
    getComboComponentAmount(product, product.comboExtraComponent, extraCounts)
  ).toFixed(2));
}

export function getComboTotalAmount(product: Product, counts: ParticipantCounts) {
  if (!isComboProduct(product)) {
    return counts.adults * getProductUnitPrice(product);
  }

  const louvrePayingVisitors = counts.adults + counts.youth;
  const extraPayingVisitors = counts.adults + counts.youth + counts.children;

  return Number((
    louvrePayingVisitors * product.faceValue +
    extraPayingVisitors * getComboExtraUnitPrice(product)
  ).toFixed(2));
}

export const products: Product[] = [
  {
    id: "louvre-e-guide",
    name: "Louvre Museum with E-Guide",
    badge: "",
    summary:
      "Timed Louvre Museum entry bundled with a digital audio e-guide for independent visitors.",
    description:
      "Experience the world's most famous museum at your own pace. This ticket gives you access to the permanent collections where you can marvel at the Mona Lisa, the Venus de Milo, and the Winged Victory of Samothrace. The included E-Guide app provides fascinating commentary on selected highlights, ensuring you don't miss the masterpieces.",
    duration: "3 - 4 hours",
    address: "Musée du Louvre, 75001 Paris",
    heroImage: "/images/mona-lisa.webp",
    faceValue: 22,
    eGuideFee: 9,
    serviceFee: 8.9,
    includes: ["Louvre Ticket", "E-Guide", "Mobile Tickets", "Transparent price breakdown"],
  },
  {
    id: "audio-guide",
    name: "Louvre Museum with Audio Guide",
    badge: "",
    summary:
      "Timed Louvre Museum entry with audio-guide support for independent visitors.",
    description:
      "Dive deep into the history of art with the official Louvre Audio Guide. Navigate the massive corridors with ease and listen to expert curation about thousands of artworks, from Ancient Egypt to the Romantic period. Perfect for art history enthusiasts who want detailed insights.",
    duration: "3 - 4 hours",
    address: "Musée du Louvre, 75001 Paris",
    heroImage: "/images/pyramid.webp",
    faceValue: 22,
    eGuideFee: 22,
    serviceFee: 10.9,
    includes: ["Louvre Ticket", "Audio Guide", "Mobile Tickets", "Transparent price breakdown"],
  },
  {
    id: "seine-river",
    name: "Louvre Museum & Seine River Tour",
    badge: "",
    summary:
      "Combine Louvre Museum entry with a Seine River experience for a full Paris day.",
    description:
      "The perfect Parisian day! Start with a cultural journey through the Louvre Museum, then relax on a 1-hour sightseeing cruise along the Seine. Glide past the Eiffel Tower, Notre Dame Cathedral, and the Musée d'Orsay while enjoying an audio commentary about the city's history.",
    duration: "Half Day",
    address: "Port de la Bourdonnais & Louvre",
    heroImage: "/images/river.webp",
    faceValue: 22,
    eGuideFee: 14,
    serviceFee: 22.9,
    includes: ["Louvre Ticket", "Seine River Tour", "E-Guide", "Duration: 1 Day"],
    comboExtraComponent: "seine",
    comboExtraName: "Seine River Tour",
  },
  {
    id: "louvre-eiffel",
    name: "Louvre Museum & Eiffel Tower",
    badge: "Most Popular Combo Deal",
    summary:
      "Tick off two icons in one day. Visit the Louvre to see the masterpieces of the world, then ascend the Eiffel Tower for breathtaking panoramic views of Paris.",
    description:
      "Tick off two icons in one day. Visit the Louvre to see the masterpieces of the world, then ascend the Eiffel Tower for breathtaking panoramic views of Paris. This combo is the ultimate bucket-list experience for first-time visitors looking to save time and money.",
    duration: "1 Day",
    address: "Champ de Mars & Louvre",
    heroImage: "/images/family.webp",
    faceValue: 22,
    eGuideFee: 15,
    serviceFee: 32.9,
    includes: ["Louvre Ticket", "Eiffel Tower Ticket", "E-Guide", "Duration: 1 Day"],
    comboExtraComponent: "eiffel",
    comboExtraName: "Eiffel Tower",
  },
  {
    id: "orsay",
    name: "Orsay Museum with E-Guide",
    badge: "",
    summary: "A digital ticket request and e-guide package for Musée d'Orsay visitors.",
    description:
      "Walk across the Seine to the stunning Beaux-Arts railway station turned museum. Home to the world's largest collection of Impressionist and Post-Impressionist masterpieces by Monet, Manet, Van Gogh, and Renoir. A colorful and vibrant must-see for art lovers.",
    duration: "2 - 3 hours",
    address: "Esplanade Valéry Giscard d'Estaing",
    heroImage: "/images/orsay.webp",
    faceValue: 16,
    eGuideFee: 4,
    serviceFee: 4.9,
    includes: ["Orsay Museum ticket request", "Digital e-guide", "Mobile delivery"],
  },
  {
    id: "versailles",
    name: "Palace of Versailles",
    badge: "",
    summary:
      "A ticket request and practical digital guide package for Versailles visitors.",
    description:
      "Travel back to the age of absolute monarchy. Explore the opulent Hall of Mirrors, the King's and Queen's State Apartments, and the magnificent Royal Chapel. Afterwards, stroll through the perfectly manicured French gardens designed by André Le Nôtre.",
    duration: "Half Day",
    address: "Place d'Armes, 78000 Versailles",
    heroImage: "/images/versailles.webp",
    faceValue: 21,
    eGuideFee: 4,
    serviceFee: 3.9,
    includes: ["Versailles ticket request", "Digital e-guide", "Mobile delivery"],
  },
];

export const faqs = [
  {
    question: "Do I need to print my tickets?",
    answer:
      "No. Louvre tickets can usually be presented on your smartphone. Keep your phone charged and bring a valid ID if required for your ticket category.",
  },
  {
    question: "Does this ticket let me skip the museum entrance queue?",
    answer:
      "No. Online tickets help you avoid the museum cashier queue and secure a timed-entry slot, but all visitors still pass security and the timed-entry line.",
  },
  {
    question: "Is online booking mandatory?",
    answer:
      "Online booking is recommended to guarantee your time slot, especially during peak season. On-site ticket sales may be available when museum attendance is low and subject to availability.",
  },
  {
    question: "Is the museum wheelchair accessible?",
    answer:
      "Yes. The Louvre provides accessible routes and elevators, including access around the Pyramid entrance area.",
  },
  {
    question: "What happens if I arrive late?",
    answer:
      "Tickets are linked to a time slot. Late arrival can lead to delayed or refused access depending on museum capacity and security operations.",
  },
  {
    question: "Can I refund my ticket?",
    answer:
      "Refunds depend on the selected product and timing. Requests made more than 24 hours before the scheduled visit are reviewed under the terms shown before checkout.",
  },
];

export const blogPosts = [
  {
    date: "May 15, 2026",
    title: "How to avoid crowds at the Mona Lisa?",
    excerpt: "5 insider tips to get the best view without waiting.",
    image: "/images/blog1.webp",
    alt: "Mona Lisa crowd",
  },
  {
    date: "April 22, 2026",
    title: "Louvre at Night: Is it worth it?",
    excerpt: "Experience the magical atmosphere on Friday evenings.",
    image: "/images/blog2.webp",
    alt: "Night Louvre",
  },
  {
    date: "March 10, 2026",
    title: "Where to eat near the Louvre",
    excerpt: "Best bistros and cafes within 5 minutes walk.",
    image: "/images/blog3.webp",
    alt: "Food near Louvre",
  },
];

export const cookieRows = [
  {
    name: "cookie-preferences (localStorage)",
    provider: "louvretickets-tourcierge.com",
    purpose: "Stores the visitor's essential consent choices for analytics and advertising categories.",
    type: "Persistent browser storage",
    retention: "6 months",
    category: "Essential",
  },
  {
    name: "_ga",
    provider: "Google Analytics / louvretickets-tourcierge.com",
    purpose: "Distinguishes visitors for aggregated analytics measurement after analytics consent.",
    type: "Persistent",
    retention: "Up to 2 years",
    category: "Analytics",
  },
  {
    name: "_ga_<container-id>",
    provider: "Google Analytics / louvretickets-tourcierge.com",
    purpose: "Persists session state for Google Analytics after analytics consent.",
    type: "Persistent",
    retention: "Up to 2 years",
    category: "Analytics",
  },
  {
    name: "_gid",
    provider: "Google Analytics / louvretickets-tourcierge.com",
    purpose: "Distinguishes visitors for short-term analytics measurement after analytics consent.",
    type: "Persistent",
    retention: "24 hours",
    category: "Analytics",
  },
  {
    name: "_gcl_au",
    provider: "Google Ads / louvretickets-tourcierge.com",
    purpose: "Stores Google Ads click/conversion measurement information after advertising consent.",
    type: "Persistent",
    retention: "Up to 90 days",
    category: "Advertising",
  },
  {
    name: "_gcl_aw",
    provider: "Google Ads / louvretickets-tourcierge.com",
    purpose: "Stores ad click identifiers for conversion attribution after advertising consent.",
    type: "Persistent",
    retention: "Up to 90 days",
    category: "Advertising",
  },
  {
    name: "IDE",
    provider: "Google / doubleclick.net",
    purpose: "Used by Google advertising products for ad delivery and measurement after advertising consent.",
    type: "Persistent third-party cookie",
    retention: "Up to 13 months",
    category: "Advertising",
  },
];

export const timeSlots = Array.from({ length: 16 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
});
