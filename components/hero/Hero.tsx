import Link from "next/link";
import { FloorPlan } from "@/components/blueprint/FloorPlan";
import { HeroChoreographyLoader } from "./HeroChoreographyLoader";

/**
 * Текст и SVG рендерятся здесь, на сервере (важно для LCP/SEO/no-JS).
 * HeroChoreography ничего не рендерит сама — она клиентский компонент без
 * серверного вывода, который только анимирует уже отрисованный DOM.
 */
export function Hero() {
  return (
    <section
      id="hero-stage"
      className="grid gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-24"
    >
      <div className="flex flex-col gap-8">
        <h1
          data-hero-heading
          className="font-display text-step-4 font-semibold uppercase leading-[0.95]"
        >
          <span className="block">Ремонт, который</span>
          <span className="block">видно каждый день</span>
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            data-hero-cta
            href="/calculator"
            className="inline-flex min-h-11 items-center justify-center bg-graphite px-6 py-3 text-step-0 text-paper transition-colors duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-graphite/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
          >
            Рассчитать смету →
          </Link>

          <p className="text-step-0 text-graphite/70">
            <span className="font-mono">68 м²</span> ·{" "}
            <span className="font-mono">94 дня</span>
          </p>
        </div>
      </div>

      <div data-hero-blueprint>
        <FloorPlan
          area={68}
          rooms={3}
          bathrooms={1}
          layoutChange="none"
          className="h-auto w-full"
        />
      </div>

      <HeroChoreographyLoader />
    </section>
  );
}
