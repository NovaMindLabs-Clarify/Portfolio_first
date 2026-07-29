import type { Metadata } from "next";
import { Geologica, Golos_Text, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["cyrillic", "latin"],
  weight: ["500", "700"],
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
  title: "КОНТУР — ремонт под ключ",
  description:
    "Студия ремонта под ключ с калькулятором сметы и личным кабинетом объекта.",
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
