import type { Metadata } from "next";
import { CalculatorApp } from "@/components/calculator/CalculatorApp";

export const metadata: Metadata = {
  title: "Калькулятор сметы — КОНТУР",
  description:
    "Рассчитайте вилку стоимости ремонта под ключ — площадь, тип ремонта, санузлы, сроки.",
};

export default function CalculatorPage() {
  return (
    <main className="min-h-full bg-paper text-graphite">
      <CalculatorApp />
    </main>
  );
}
