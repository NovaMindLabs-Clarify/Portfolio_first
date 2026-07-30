import type { Metadata } from "next";
import { Geologica, Golos_Text, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["cyrillic", "latin"],
  weight: ["500", "700"],
  // H1 в Hero — крупнейший текст на сайте (до 6.5rem): даже небольшое
  // расхождение метрик fallback-шрифта на такой площади даёт заметный CLS.
  // "optional" не переключает на веб-шрифт после первой отрисовки — сдвига
  // layout нет вовсе, ценой редкого показа fallback-начертания на медленной сети.
  display: "optional",
});

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ремонт под ключ`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Студия ремонта под ключ с калькулятором сметы и личным кабинетом объекта. Концепт-проект для портфолио.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ремонт под ключ`,
    description:
      "Калькулятор сметы и личный кабинет объекта. Концепт-проект для портфолио.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ремонт под ключ`,
    description:
      "Калькулятор сметы и личный кабинет объекта. Концепт-проект для портфолио.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geologica.variable} ${golosText.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
