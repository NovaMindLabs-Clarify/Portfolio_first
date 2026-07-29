import { FaqSection } from "@/components/faq/FaqSection";
import { Hero } from "@/components/hero/Hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { StagesScroll } from "@/components/stages/StagesScroll";
import { localBusinessJsonLd, serviceJsonLd } from "@/lib/seo";

export default function Home() {
  return (
    <main className="min-h-full bg-paper text-graphite">
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={serviceJsonLd()} />
      <Hero />
      <StagesScroll />
      <FaqSection />
    </main>
  );
}
