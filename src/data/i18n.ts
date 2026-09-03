import { nonAffiliation, Product, products } from "@/data/site";

export type Locale = "en" | "fr" | "es" | "de" | "it";

export const locales: Locale[] = ["en", "fr", "es", "de", "it"];

export const localeMeta: Record<Locale, { label: string; flag: string; path: string; htmlLang: string }> = {
  en: { label: "English", flag: "🇺🇸", path: "/", htmlLang: "en" },
  fr: { label: "Français", flag: "🇫🇷", path: "/fr", htmlLang: "fr" },
  es: { label: "Español", flag: "🇪🇸", path: "/es", htmlLang: "es" },
  de: { label: "Deutsch", flag: "🇩🇪", path: "/de", htmlLang: "de" },
  it: { label: "Italiano", flag: "🇮🇹", path: "/it", htmlLang: "it" },
};

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return locales.includes(segment as Locale) ? (segment as Locale) : "en";
}

export function localizePath(pathname: string, locale: Locale) {
  const withoutLocale = pathname.replace(/^\/(fr|es|de|it)(?=\/|$)/, "") || "/";
  if (locale === "en") {
    return withoutLocale;
  }
  return withoutLocale === "/" ? `/${locale}` : `/${locale}${withoutLocale}`;
}

const productCopy: Record<Locale, Record<string, Partial<Product>>> = {
  en: {},
  fr: {
    "louvre-e-guide": {
      name: "Musée du Louvre avec e-guide",
      summary: "Entrée datée au musée du Louvre avec e-guide audio numérique pour les visiteurs indépendants.",
      description: "Découvrez le musée le plus célèbre du monde à votre rythme. Ce billet donne accès aux collections permanentes où vous pourrez admirer la Joconde, la Vénus de Milo et la Victoire de Samothrace. L'e-guide inclus apporte des commentaires utiles sur une sélection de chefs-d'oeuvre.",
      includes: ["Billet Louvre", "E-guide", "Billets mobiles", "Prix détaillé transparent"],
    },
    "audio-guide": {
      name: "Musée du Louvre avec audioguide",
      summary: "Entrée datée au musée du Louvre avec support audioguide pour les visiteurs indépendants.",
      description: "Plongez dans l'histoire de l'art avec un audioguide pour mieux parcourir les vastes galeries du Louvre et comprendre les oeuvres majeures.",
      includes: ["Billet Louvre", "Audioguide", "Billets mobiles", "Prix détaillé transparent"],
    },
    "seine-river": {
      name: "Musée du Louvre et croisière sur la Seine",
      summary: "Combinez l'entrée au Louvre avec une expérience sur la Seine pour une journée parisienne complète.",
      description: "Commencez par une visite culturelle au Louvre, puis profitez d'une croisière d'une heure sur la Seine devant les monuments emblématiques de Paris.",
      includes: ["Billet Louvre", "Croisière sur la Seine", "E-guide", "Durée : 1 jour"],
    },
    "louvre-eiffel": {
      name: "Musée du Louvre et tour Eiffel",
      badge: "Combo le plus populaire",
      summary: "Deux icônes en une journée : le Louvre puis la tour Eiffel pour une vue panoramique sur Paris.",
      description: "Visitez le Louvre pour voir les chefs-d'oeuvre mondiaux, puis montez à la tour Eiffel pour profiter d'une vue panoramique sur Paris.",
      includes: ["Billet Louvre", "Billet tour Eiffel", "E-guide", "Durée : 1 jour"],
    },
    orsay: {
      name: "Musée d'Orsay avec e-guide",
      summary: "Demande de billet numérique et e-guide pour les visiteurs du musée d'Orsay.",
      description: "Découvrez l'ancienne gare Beaux-Arts devenue musée, célèbre pour ses collections impressionnistes et postimpressionnistes.",
      includes: ["Demande de billet Orsay", "E-guide numérique", "Livraison mobile"],
    },
    versailles: {
      name: "Château de Versailles",
      summary: "Demande de billet et guide numérique pratique pour visiter Versailles.",
      description: "Explorez la galerie des Glaces, les appartements royaux et les jardins à la française de Versailles.",
      includes: ["Demande de billet Versailles", "E-guide numérique", "Livraison mobile"],
    },
  },
  es: {
    "louvre-e-guide": {
      name: "Museo del Louvre con e-guide",
      summary: "Entrada con horario al Louvre junto con una audioguía digital para visitantes independientes.",
      description: "Descubra el museo más famoso del mundo a su ritmo. Este billete da acceso a las colecciones permanentes, incluida la Mona Lisa, la Venus de Milo y la Victoria de Samotracia. El e-guide incluido ofrece comentarios sobre obras destacadas.",
      includes: ["Entrada Louvre", "E-guide", "Entradas móviles", "Desglose de precio transparente"],
    },
    "audio-guide": {
      name: "Museo del Louvre con audioguía",
      summary: "Entrada con horario al Louvre con soporte de audioguía para visitantes independientes.",
      description: "Profundice en la historia del arte y recorra las enormes galerías del Louvre con comentarios útiles sobre miles de obras.",
      includes: ["Entrada Louvre", "Audioguía", "Entradas móviles", "Desglose de precio transparente"],
    },
    "seine-river": {
      name: "Museo del Louvre y paseo por el Sena",
      summary: "Combine la entrada al Louvre con una experiencia por el Sena para un día completo en París.",
      description: "Empiece con el Louvre y después disfrute de un crucero turístico de una hora por el Sena pasando por lugares emblemáticos de París.",
      includes: ["Entrada Louvre", "Paseo por el Sena", "E-guide", "Duración: 1 día"],
    },
    "louvre-eiffel": {
      name: "Museo del Louvre y Torre Eiffel",
      badge: "Combo más popular",
      summary: "Dos iconos en un día: visite el Louvre y suba a la Torre Eiffel para ver París desde arriba.",
      description: "Visite el Louvre para ver obras maestras mundiales y después suba a la Torre Eiffel para disfrutar de vistas panorámicas de París.",
      includes: ["Entrada Louvre", "Entrada Torre Eiffel", "E-guide", "Duración: 1 día"],
    },
    orsay: {
      name: "Museo de Orsay con e-guide",
      summary: "Solicitud de entrada digital y paquete de e-guide para visitantes del Museo de Orsay.",
      description: "Explore la antigua estación Beaux-Arts convertida en museo, famosa por sus colecciones impresionistas y postimpresionistas.",
      includes: ["Solicitud de entrada Orsay", "E-guide digital", "Entrega móvil"],
    },
    versailles: {
      name: "Palacio de Versalles",
      summary: "Solicitud de entrada y guía digital práctica para visitantes de Versalles.",
      description: "Explore la Galería de los Espejos, los apartamentos reales y los jardines franceses de Versalles.",
      includes: ["Solicitud de entrada Versalles", "E-guide digital", "Entrega móvil"],
    },
  },
  de: {
    "louvre-e-guide": {
      name: "Louvre Museum mit E-Guide",
      summary: "Zeitgebundener Louvre-Eintritt mit digitalem Audio-E-Guide für selbstständige Besucher.",
      description: "Erleben Sie das berühmteste Museum der Welt in Ihrem eigenen Tempo. Dieses Ticket bietet Zugang zu den ständigen Sammlungen mit Mona Lisa, Venus von Milo und Nike von Samothrake. Der enthaltene E-Guide liefert hilfreiche Kommentare zu ausgewählten Highlights.",
      includes: ["Louvre Ticket", "E-Guide", "Mobile Tickets", "Transparente Preisaufschlüsselung"],
    },
    "audio-guide": {
      name: "Louvre Museum mit Audioguide",
      summary: "Zeitgebundener Louvre-Eintritt mit Audioguide-Unterstützung für selbstständige Besucher.",
      description: "Tauchen Sie tiefer in die Kunstgeschichte ein und navigieren Sie leichter durch die großen Galerien des Louvre.",
      includes: ["Louvre Ticket", "Audioguide", "Mobile Tickets", "Transparente Preisaufschlüsselung"],
    },
    "seine-river": {
      name: "Louvre Museum und Seine-Bootsfahrt",
      summary: "Kombinieren Sie den Louvre-Besuch mit einer Seine-Erfahrung für einen kompletten Paris-Tag.",
      description: "Starten Sie im Louvre und entspannen Sie danach bei einer einstündigen Sightseeing-Bootsfahrt auf der Seine.",
      includes: ["Louvre Ticket", "Seine-Bootsfahrt", "E-Guide", "Dauer: 1 Tag"],
    },
    "louvre-eiffel": {
      name: "Louvre Museum und Eiffelturm",
      badge: "Beliebtestes Kombiangebot",
      summary: "Zwei Ikonen an einem Tag: Louvre-Besuch und Eiffelturm mit Panoramablick über Paris.",
      description: "Besuchen Sie den Louvre und fahren Sie anschließend auf den Eiffelturm, um Paris von oben zu erleben.",
      includes: ["Louvre Ticket", "Eiffelturm Ticket", "E-Guide", "Dauer: 1 Tag"],
    },
    orsay: {
      name: "Musée d'Orsay mit E-Guide",
      summary: "Digitale Ticketanfrage und E-Guide-Paket für Besucher des Musée d'Orsay.",
      description: "Entdecken Sie den ehemaligen Beaux-Arts-Bahnhof mit Meisterwerken des Impressionismus und Postimpressionismus.",
      includes: ["Orsay Ticketanfrage", "Digitaler E-Guide", "Mobile Lieferung"],
    },
    versailles: {
      name: "Schloss Versailles",
      summary: "Ticketanfrage und praktischer digitaler Guide für Versailles-Besucher.",
      description: "Erkunden Sie den Spiegelsaal, die königlichen Gemächer und die französischen Gärten von Versailles.",
      includes: ["Versailles Ticketanfrage", "Digitaler E-Guide", "Mobile Lieferung"],
    },
  },
  it: {
    "louvre-e-guide": {
      name: "Museo del Louvre con e-guide",
      summary: "Ingresso con fascia oraria al Louvre con audioguida digitale per visitatori indipendenti.",
      description: "Scopri il museo più famoso del mondo al tuo ritmo. Questo biglietto dà accesso alle collezioni permanenti, inclusa la Gioconda, la Venere di Milo e la Vittoria di Samotracia. L'e-guide incluso offre commenti utili su opere selezionate.",
      includes: ["Biglietto Louvre", "E-guide", "Biglietti mobili", "Prezzo trasparente"],
    },
    "audio-guide": {
      name: "Museo del Louvre con audioguida",
      summary: "Ingresso con fascia oraria al Louvre con supporto audioguida per visitatori indipendenti.",
      description: "Approfondisci la storia dell'arte e orientati meglio nelle vaste gallerie del Louvre con commenti dedicati.",
      includes: ["Biglietto Louvre", "Audioguida", "Biglietti mobili", "Prezzo trasparente"],
    },
    "seine-river": {
      name: "Museo del Louvre e crociera sulla Senna",
      summary: "Combina l'ingresso al Louvre con un'esperienza sulla Senna per una giornata completa a Parigi.",
      description: "Inizia con il Louvre e poi rilassati con una crociera panoramica di un'ora sulla Senna.",
      includes: ["Biglietto Louvre", "Crociera sulla Senna", "E-guide", "Durata: 1 giorno"],
    },
    "louvre-eiffel": {
      name: "Museo del Louvre e Torre Eiffel",
      badge: "Combo più popolare",
      summary: "Due icone in un giorno: visita il Louvre e sali sulla Torre Eiffel per vedere Parigi dall'alto.",
      description: "Visita il Louvre per ammirare capolavori mondiali, poi sali sulla Torre Eiffel per una vista panoramica su Parigi.",
      includes: ["Biglietto Louvre", "Biglietto Torre Eiffel", "E-guide", "Durata: 1 giorno"],
    },
    orsay: {
      name: "Museo d'Orsay con e-guide",
      summary: "Richiesta di biglietto digitale e pacchetto e-guide per visitatori del Museo d'Orsay.",
      description: "Scopri l'ex stazione Beaux-Arts trasformata in museo, famosa per le collezioni impressioniste e postimpressioniste.",
      includes: ["Richiesta biglietto Orsay", "E-guide digitale", "Consegna mobile"],
    },
    versailles: {
      name: "Palazzo di Versailles",
      summary: "Richiesta di biglietto e guida digitale pratica per visitare Versailles.",
      description: "Esplora la Galleria degli Specchi, gli appartamenti reali e i giardini francesi di Versailles.",
      includes: ["Richiesta biglietto Versailles", "E-guide digitale", "Consegna mobile"],
    },
  },
};

export function getProducts(locale: Locale): Product[] {
  return products.map((product) => ({
    ...product,
    ...productCopy[locale][product.id],
    includes: productCopy[locale][product.id]?.includes ?? product.includes,
  }));
}

// The copy object is intentionally flexible because each locale shares a nested shape
// while still allowing localized strings to be patched independently.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ui: Record<Locale, any> = {
  en: {
    nonAffiliation,
    header: { tickets: "Tickets", booking: "Booking", blog: "Blog", faq: "FAQ", contact: "Contact", language: "LANG" },
    hero: {
      title: "Louvre Museum Tickets Online – Timed Entry, E-Guide & Concierge Support",
      lede: "Reserve your Louvre entry with our digital e-guide — your personal ticket concierge in Paris.",
      badges: ["⚡ Instant Confirmation", "⚡ Skip the cashier queue", "📱 Mobile Tickets", "🎧 Customer Support 08:00-22:00"],
      select: "1. Select Your Ticket Type Below",
      from: "From",
    },
    flow: {
      packageDisclosure: "Our package price includes the museum entrance ticket and our independent digital guide service. Please note that the total price for this combined service is higher than the standalone ticket price available at the museum box office.",
      selectTitle: "Please Select a Ticket Type Above",
      selectText: "To view details, prices, and the booking calendar, please choose one of the available options from the cards above.",
      seoIntro: "No visit to the City of Light is complete without exploring its most iconic landmark. Reserve your Louvre Museum Paris tickets online to ensure you don't miss out on the masterpieces. We offer a complete solution featuring valid Louvre entry tickets combined with an immersive Audio E-Guide. From the Mona Lisa to the Venus de Milo, grab your Louvre tickets today and prepare for an awe-inspiring journey through art history.",
      whyPackage: "Why Choose Our Ticket Package?",
      benefits: [
        ["Instant Confirmation:", "Receive your Louvre online tickets immediately via email. No need to print, just show on your phone."],
        ["Direct Access:", "Use the main Louvre entrance (Pyramid) with your digital ticket and avoid the museum cashier desk. This does not skip security or museum-managed entry queues."],
        ["Full Experience:", "Explore the Louvre Museum Paris at your own pace. Our curated Audio E-Guide helps you discover the masterpieces."],
      ],
      included: "What's Included?",
      duration: "Duration:",
      address: "Address:",
      cancellation: "Free Cancellation",
      cancellationText: "up to 24h before",
      disclosureTitle: "Independent reseller disclosure:",
      bookingDisclosure: "Online tickets help you request a guaranteed timed-entry slot and avoid the museum cashier desk. They do not allow visitors to skip Louvre security screening, capacity controls, or museum-managed entry queues.",
      totalPackagePrice: "Total package price",
    },
    booking: {
      selectFirst: "Please select a product first",
      selectCalendar: "SELECT TO VIEW CALENDAR",
      calendarLoads: "The booking calendar will load immediately after your selection.",
      secureCheckout: "Secure checkout",
      bookTickets: "Book tickets",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      chooseVisitTime: "Choose visit time",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      adults: "Adults",
      each: "each",
      children: "Children under 18",
      childrenNote: "EUR 0.00 · requires at least 1 adult",
      firstName: "First name",
      lastName: "Last name",
      email: "Email for tickets",
      phone: "Phone optional",
      adultTicket: "adult ticket",
      adultTickets: "adult tickets",
      breakdown: "Price breakdown",
      faceValue: "Ticket face value",
      eGuideFee: "E-guide fee",
      serviceFee: "Service fee",
      childrenLabel: "Children",
      substitution: "I understand my time slot may be substituted by {business} within a reasonable window if the selected slot is unavailable.",
      terms: "I accept the Terms of Service, Privacy Policy, and price breakdown.",
      pay: "Continue to secure payment",
      secureNote: "Secure card payment will be handled by Stripe.",
      ready: "Checkout ready for {name}. Next step: create Supabase order, then Stripe payment intent.",
      ticketTypeTitle: "Ticket type",
      euTicket: "EU ticket",
      euTicketNote: "For EU citizens/residents — ID may be checked at the entrance",
      nonEuTicket: "Non-EU ticket",
      nonEuTicketNote: "For visitors from outside the European Union",
      visitorNamesTitle: "Visitor names",
      visitorNamesNote: "Please enter the full name of every visitor as shown on their ID.",
      visitorName: "Visitor {n} full name",
      adultVisitorName: "Adult {n} full name",
      childVisitorName: "Child {n} full name",
    },
  },
  fr: {
    nonAffiliation: "LouvreTickets by TourCierge est un revendeur indépendant et un service d'e-guide. Il n'est pas affilié, sponsorisé, autorisé, approuvé ni exploité par le musée du Louvre ou une entité officielle du Louvre.",
    header: { tickets: "Billets", booking: "Réservation", blog: "Blog", faq: "FAQ", contact: "Contact", language: "LANG" },
    hero: {
      title: "Billets pour le musée du Louvre en ligne – entrée horodatée, e-guide et assistance",
      lede: "Réservez votre entrée au Louvre avec notre e-guide numérique — votre conciergerie de billets à Paris.",
      badges: ["⚡ Confirmation rapide", "⚡ Évitez la caisse", "📱 Billets mobiles", "🎧 Support client 08:00-22:00"],
      select: "1. Choisissez votre type de billet ci-dessous",
      from: "À partir de",
    },
    flow: {
      packageDisclosure: "Le prix de notre forfait inclut le billet d'entrée au musée et notre service indépendant de guide numérique. Le prix total de ce service combiné est supérieur au prix du billet seul disponible à la caisse du musée.",
      selectTitle: "Veuillez choisir un type de billet ci-dessus",
      selectText: "Pour voir les détails, les prix et le calendrier de réservation, choisissez l'une des options disponibles.",
      seoIntro: "Aucune visite de Paris n'est complète sans découvrir son monument culturel le plus emblématique. Réservez vos billets pour le musée du Louvre en ligne afin de ne pas manquer les chefs-d'oeuvre. Notre solution combine des billets d'entrée valides et un e-guide audio immersif.",
      whyPackage: "Pourquoi choisir notre forfait ?",
      benefits: [["Confirmation rapide :", "Recevez vos billets du Louvre par e-mail. Pas besoin d'imprimer, présentez-les sur votre téléphone."], ["Accès direct :", "Utilisez l'entrée principale du Louvre avec votre billet numérique et évitez la caisse. Cela ne supprime pas les contrôles de sécurité ni les files gérées par le musée."], ["Expérience complète :", "Visitez le Louvre à votre rythme. Notre e-guide audio vous aide à découvrir les chefs-d'oeuvre."]],
      included: "Qu'est-ce qui est inclus ?",
      duration: "Durée :",
      address: "Adresse :",
      cancellation: "Annulation gratuite",
      cancellationText: "jusqu'à 24 h avant",
      disclosureTitle: "Information revendeur indépendant :",
      bookingDisclosure: "Les billets en ligne aident à demander un créneau horaire garanti et à éviter la caisse du musée. Ils ne permettent pas de sauter les contrôles de sécurité du Louvre, les limites de capacité ou les files d'entrée gérées par le musée.",
      totalPackagePrice: "Prix total du forfait",
    },
    booking: {
      selectFirst: "Veuillez d'abord sélectionner un produit",
      selectCalendar: "SÉLECTIONNER POUR VOIR LE CALENDRIER",
      calendarLoads: "Le calendrier de réservation se chargera immédiatement après votre sélection.",
      secureCheckout: "Paiement sécurisé",
      bookTickets: "Réserver des billets",
      previousMonth: "Mois précédent",
      nextMonth: "Mois suivant",
      chooseVisitTime: "Choisir l'heure de visite",
      weekdays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
      adults: "Adultes",
      each: "chacun",
      children: "Enfants de moins de 18 ans",
      childrenNote: "EUR 0.00 · nécessite au moins 1 adulte",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail pour les billets",
      phone: "Téléphone facultatif",
      adultTicket: "billet adulte",
      adultTickets: "billets adultes",
      breakdown: "Détail du prix",
      faceValue: "Valeur faciale du billet",
      eGuideFee: "Frais e-guide",
      serviceFee: "Frais de service",
      childrenLabel: "Enfants",
      substitution: "Je comprends que mon créneau peut être remplacé par {business} dans une fenêtre raisonnable si le créneau choisi est indisponible.",
      terms: "J'accepte les conditions de service, la politique de confidentialité et le détail du prix.",
      pay: "Continuer vers le paiement sécurisé",
      secureNote: "Le paiement par carte sécurisé sera traité par Stripe.",
      ready: "Checkout prêt pour {name}. Étape suivante : créer la commande Supabase puis l'intention de paiement Stripe.",
      ticketTypeTitle: "Type de billet",
      euTicket: "Billet UE",
      euTicketNote: "Pour les citoyens/résidents de l'UE — une pièce d'identité peut être vérifiée à l'entrée",
      nonEuTicket: "Billet hors UE",
      nonEuTicketNote: "Pour les visiteurs hors Union européenne",
      visitorNamesTitle: "Noms des visiteurs",
      visitorNamesNote: "Veuillez saisir le nom complet de chaque visiteur tel qu'il figure sur sa pièce d'identité.",
      visitorName: "Nom complet du visiteur {n}",
      adultVisitorName: "Nom complet de l'adulte {n}",
      childVisitorName: "Nom complet de l'enfant {n}",
    },
  },
  es: {},
  de: {},
  it: {},
};

ui.es = {
  ...ui.fr,
  nonAffiliation: "LouvreTickets by TourCierge es un revendedor independiente y servicio de e-guide. No está afiliado, patrocinado, autorizado, respaldado ni operado por el Museo del Louvre ni por ninguna entidad oficial del Louvre.",
  header: { tickets: "Entradas", booking: "Reserva", blog: "Blog", faq: "FAQ", contact: "Contacto", language: "LANG" },
  hero: { title: "Entradas para el Museo del Louvre online – entrada con horario, e-guide y asistencia", lede: "Reserve su entrada al Louvre con nuestra e-guide digital — su conserjería de entradas en París.", badges: ["⚡ Confirmación rápida", "⚡ Evita la caja", "📱 Entradas móviles", "🎧 Soporte 08:00-22:00"], select: "1. Elija su tipo de entrada abajo", from: "Desde" },
  flow: { ...ui.fr.flow, packageDisclosure: "El precio del paquete incluye la entrada al museo y nuestro servicio independiente de guía digital. El precio total de este servicio combinado es superior al precio de la entrada sola disponible en la taquilla del museo.", selectTitle: "Seleccione un tipo de entrada arriba", selectText: "Para ver detalles, precios y calendario de reserva, elija una de las opciones disponibles.", included: "¿Qué incluye?", duration: "Duración:", address: "Dirección:", cancellation: "Cancelación gratuita", cancellationText: "hasta 24 h antes", disclosureTitle: "Aviso de revendedor independiente:", bookingDisclosure: "Las entradas online ayudan a solicitar una franja horaria garantizada y evitar la caja del museo. No permiten saltarse el control de seguridad del Louvre, los controles de capacidad o las colas gestionadas por el museo.", totalPackagePrice: "Precio total del paquete" },
  booking: { ...ui.fr.booking, selectFirst: "Seleccione primero un producto", selectCalendar: "SELECCIONAR PARA VER CALENDARIO", calendarLoads: "El calendario de reserva se cargará inmediatamente después de su selección.", secureCheckout: "Pago seguro", bookTickets: "Reservar entradas", previousMonth: "Mes anterior", nextMonth: "Mes siguiente", chooseVisitTime: "Elegir hora de visita", weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], adults: "Adultos", each: "cada uno", children: "Niños menores de 18", childrenNote: "EUR 0.00 · requiere al menos 1 adulto", firstName: "Nombre", lastName: "Apellido", email: "Email para entradas", phone: "Teléfono opcional", adultTicket: "entrada adulto", adultTickets: "entradas adulto", breakdown: "Desglose del precio", faceValue: "Valor facial de la entrada", eGuideFee: "Tarifa e-guide", serviceFee: "Tarifa de servicio", childrenLabel: "Niños", substitution: "Entiendo que mi horario puede ser sustituido por {business} dentro de una ventana razonable si el horario elegido no está disponible.", terms: "Acepto los Términos de Servicio, la Política de Privacidad y el desglose del precio.", pay: "Continuar al pago seguro", secureNote: "El pago seguro con tarjeta será gestionado por Stripe.", ready: "Checkout listo para {name}. Siguiente paso: crear pedido Supabase y luego intento de pago Stripe.", ticketTypeTitle: "Tipo de entrada", euTicket: "Entrada UE", euTicketNote: "Para ciudadanos/residentes de la UE — puede verificarse el documento en la entrada", nonEuTicket: "Entrada no UE", nonEuTicketNote: "Para visitantes de fuera de la Unión Europea", visitorNamesTitle: "Nombres de los visitantes", visitorNamesNote: "Introduzca el nombre completo de cada visitante tal como aparece en su documento.", visitorName: "Nombre completo del visitante {n}", adultVisitorName: "Nombre completo del adulto {n}", childVisitorName: "Nombre completo del niño {n}" },
};

ui.de = {
  ...ui.es,
  nonAffiliation: "LouvreTickets by TourCierge ist ein unabhängiger Wiederverkäufer und E-Guide-Service. Der Dienst ist nicht mit dem Louvre Museum oder einer offiziellen Louvre-Einrichtung verbunden, gesponsert, autorisiert, empfohlen oder betrieben.",
  header: { tickets: "Tickets", booking: "Buchung", blog: "Blog", faq: "FAQ", contact: "Kontakt", language: "LANG" },
  hero: { title: "Louvre Museum Tickets online – Zeitfenster-Eintritt, E-Guide & Support", lede: "Reservieren Sie Ihren Louvre-Eintritt mit unserem digitalen E-Guide — Ihr Ticket-Concierge in Paris.", badges: ["⚡ Schnelle Bestätigung", "⚡ Museumskasse vermeiden", "📱 Mobile Tickets", "🎧 Support 08:00-22:00"], select: "1. Wählen Sie unten Ihren Tickettyp", from: "Ab" },
  flow: { ...ui.es.flow, packageDisclosure: "Unser Paketpreis enthält das Museumsticket und unseren unabhängigen digitalen Guide-Service. Der Gesamtpreis dieses kombinierten Services ist höher als der reine Ticketpreis an der Museumskasse.", selectTitle: "Bitte wählen Sie oben einen Tickettyp", selectText: "Um Details, Preise und den Buchungskalender zu sehen, wählen Sie eine verfügbare Option.", included: "Was ist enthalten?", duration: "Dauer:", address: "Adresse:", cancellation: "Kostenlose Stornierung", cancellationText: "bis 24 Stunden vorher", disclosureTitle: "Hinweis zum unabhängigen Wiederverkäufer:", bookingDisclosure: "Online-Tickets helfen, ein garantiertes Zeitfenster anzufragen und die Museumskasse zu vermeiden. Sie erlauben nicht, Sicherheitskontrollen, Kapazitätskontrollen oder vom Museum verwaltete Eingangsqueues zu überspringen.", totalPackagePrice: "Gesamtpreis des Pakets" },
  booking: { ...ui.es.booking, selectFirst: "Bitte wählen Sie zuerst ein Produkt", selectCalendar: "AUSWÄHLEN, UM KALENDER ZU SEHEN", calendarLoads: "Der Buchungskalender lädt direkt nach Ihrer Auswahl.", secureCheckout: "Sichere Zahlung", bookTickets: "Tickets buchen", previousMonth: "Vorheriger Monat", nextMonth: "Nächster Monat", chooseVisitTime: "Besuchszeit wählen", weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], adults: "Erwachsene", each: "jeweils", children: "Kinder unter 18", childrenNote: "EUR 0.00 · mindestens 1 Erwachsener erforderlich", firstName: "Vorname", lastName: "Nachname", email: "E-Mail für Tickets", phone: "Telefon optional", adultTicket: "Erwachsenenticket", adultTickets: "Erwachsenentickets", breakdown: "Preisaufschlüsselung", faceValue: "Ticket-Nennwert", eGuideFee: "E-Guide-Gebühr", serviceFee: "Servicegebühr", childrenLabel: "Kinder", substitution: "Ich verstehe, dass mein Zeitfenster von {business} in einem angemessenen Zeitraum ersetzt werden kann, wenn das gewählte Zeitfenster nicht verfügbar ist.", terms: "Ich akzeptiere die Nutzungsbedingungen, Datenschutzrichtlinie und Preisaufschlüsselung.", pay: "Weiter zur sicheren Zahlung", secureNote: "Die sichere Kartenzahlung wird von Stripe verarbeitet.", ready: "Checkout bereit für {name}. Nächster Schritt: Supabase-Bestellung erstellen, dann Stripe Payment Intent.", ticketTypeTitle: "Tickettyp", euTicket: "EU-Ticket", euTicketNote: "Für EU-Bürger/Einwohner — der Ausweis kann am Eingang geprüft werden", nonEuTicket: "Nicht-EU-Ticket", nonEuTicketNote: "Für Besucher von außerhalb der Europäischen Union", visitorNamesTitle: "Namen der Besucher", visitorNamesNote: "Bitte geben Sie den vollständigen Namen jedes Besuchers wie im Ausweis an.", visitorName: "Vollständiger Name Besucher {n}", adultVisitorName: "Vollständiger Name Erwachsener {n}", childVisitorName: "Vollständiger Name Kind {n}" },
};

ui.it = {
  ...ui.de,
  nonAffiliation: "LouvreTickets by TourCierge è un rivenditore indipendente e servizio e-guide. Non è affiliato, sponsorizzato, autorizzato, approvato o gestito dal Museo del Louvre o da qualsiasi entità ufficiale del Louvre.",
  header: { tickets: "Biglietti", booking: "Prenotazione", blog: "Blog", faq: "FAQ", contact: "Contatto", language: "LANG" },
  hero: { title: "Biglietti per il Museo del Louvre online – ingresso orario, e-guide e assistenza", lede: "Prenota il tuo ingresso al Louvre con la nostra e-guide digitale — il tuo concierge dei biglietti a Parigi.", badges: ["⚡ Conferma rapida", "⚡ Evita la cassa", "📱 Biglietti mobili", "🎧 Supporto 08:00-22:00"], select: "1. Scegli il tipo di biglietto qui sotto", from: "Da" },
  flow: { ...ui.de.flow, packageDisclosure: "Il prezzo del pacchetto include il biglietto d'ingresso al museo e il nostro servizio indipendente di guida digitale. Il prezzo totale di questo servizio combinato è superiore al prezzo del solo biglietto disponibile alla cassa del museo.", selectTitle: "Seleziona prima un tipo di biglietto", selectText: "Per vedere dettagli, prezzi e calendario di prenotazione, scegli una delle opzioni disponibili.", included: "Cosa è incluso?", duration: "Durata:", address: "Indirizzo:", cancellation: "Cancellazione gratuita", cancellationText: "fino a 24 ore prima", disclosureTitle: "Informativa rivenditore indipendente:", bookingDisclosure: "I biglietti online aiutano a richiedere una fascia oraria garantita e a evitare la cassa del museo. Non consentono di saltare i controlli di sicurezza del Louvre, i controlli di capacità o le code gestite dal museo.", totalPackagePrice: "Prezzo totale del pacchetto" },
  booking: { ...ui.de.booking, selectFirst: "Seleziona prima un prodotto", selectCalendar: "SELEZIONA PER VEDERE IL CALENDARIO", calendarLoads: "Il calendario di prenotazione verrà caricato subito dopo la selezione.", secureCheckout: "Pagamento sicuro", bookTickets: "Prenota biglietti", previousMonth: "Mese precedente", nextMonth: "Mese successivo", chooseVisitTime: "Scegli orario visita", weekdays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"], adults: "Adulti", each: "ciascuno", children: "Bambini sotto i 18 anni", childrenNote: "EUR 0.00 · richiede almeno 1 adulto", firstName: "Nome", lastName: "Cognome", email: "Email per i biglietti", phone: "Telefono opzionale", adultTicket: "biglietto adulto", adultTickets: "biglietti adulti", breakdown: "Dettaglio prezzo", faceValue: "Valore nominale biglietto", eGuideFee: "Costo e-guide", serviceFee: "Costo servizio", childrenLabel: "Bambini", substitution: "Comprendo che la mia fascia oraria può essere sostituita da {business} entro una finestra ragionevole se quella scelta non è disponibile.", terms: "Accetto i Termini di Servizio, la Privacy Policy e il dettaglio prezzo.", pay: "Continua al pagamento sicuro", secureNote: "Il pagamento sicuro con carta sarà gestito da Stripe.", ready: "Checkout pronto per {name}. Passo successivo: creare ordine Supabase, poi payment intent Stripe.", ticketTypeTitle: "Tipo di biglietto", euTicket: "Biglietto UE", euTicketNote: "Per cittadini/residenti UE — il documento può essere controllato all'ingresso", nonEuTicket: "Biglietto extra UE", nonEuTicketNote: "Per visitatori da fuori dell'Unione Europea", visitorNamesTitle: "Nomi dei visitatori", visitorNamesNote: "Inserisci il nome completo di ogni visitatore come indicato sul documento.", visitorName: "Nome completo del visitatore {n}", adultVisitorName: "Nome completo dell'adulto {n}", childVisitorName: "Nome completo del bambino {n}" },
};
