import { Hero } from "@/components/hero/Hero";
import { StagesScroll } from "@/components/stages/StagesScroll";

export default function Home() {
  return (
    <main className="min-h-full bg-paper text-graphite">
      <Hero />
      <StagesScroll />
    </main>
  );
}
