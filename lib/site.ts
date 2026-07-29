export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://portfolio-first-gjad.onrender.com";

export const SITE_NAME = "КОНТУР";

export const BUSINESS = {
  name: "КОНТУР",
  description:
    "Студия ремонта под ключ с калькулятором сметы и личным кабинетом объекта. Концепт-проект для портфолио.",
  telephone: "+7 800 123-45-67",
  address: {
    city: "Санкт-Петербург",
    street: "ул. Ленина, 12",
    postalCode: "190000",
  },
} as const;
