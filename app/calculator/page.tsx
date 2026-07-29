import type { Metadata } from "next";
import { CalculatorApp } from "@/components/calculator/CalculatorApp";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Калькулятор сметы",
  description:
    "Рассчитайте вилку стоимости ремонта под ключ — площадь, тип ремонта, санузлы, сроки.",
  alternates: {
    canonical: "/calculator",
  },
};

export default function CalculatorPage() {
  return (
    <main className="min-h-full bg-paper text-graphite">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Главная", url: SITE_URL },
          { name: "Калькулятор", url: `${SITE_URL}/calculator` },
        ])}
      />
      <CalculatorApp />
    </main>
  );
}
