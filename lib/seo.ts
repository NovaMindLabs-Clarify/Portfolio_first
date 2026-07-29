import { BUSINESS, SITE_URL } from "@/lib/site";

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: "RU",
    },
    priceRange: "₽₽",
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Ремонт квартир под ключ",
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS.name,
    },
    areaServed: {
      "@type": "City",
      name: BUSINESS.address.city,
    },
    url: `${SITE_URL}/calculator`,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
