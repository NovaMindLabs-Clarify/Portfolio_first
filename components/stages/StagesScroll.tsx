"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { FloorPlan } from "@/components/blueprint/FloorPlan";
import { REVEAL_LAYER_TARGET_OPACITY, STAGES } from "./stagesData";

gsap.registerPlugin(ScrollTrigger);

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const SCREENS_PER_STAGE = 1; // 5 этапов × 1 экран = 5 экранов пина, как просил файл

function StageMeta({ stage }: { stage: (typeof STAGES)[number] }) {
  return (
    <>
      <p className="font-mono text-step-1 text-blueprint">{stage.number}</p>
      <h2 className="font-display text-step-2 font-semibold">{stage.title}</h2>
      <p className="max-w-prose text-step-0 text-graphite/80">
        {stage.description}
      </p>
      <p className="text-step--1 text-graphite/70">
        Срок: <span className="font-mono">{stage.days}</span> дней
      </p>
    </>
  );
}

export function StagesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Lenis инициализируется в SmoothScroll асинхронно (на один рендер позже),
  // а этот пин уже на монтировании добавляет spacer и удлиняет документ —
  // без пересчёта здесь Lenis остаётся при старом лимите скролла и застревает
  // у самого начала пина.
  useEffect(() => {
    lenis?.resize();
  }, [lenis]);

  useGSAP(
    () => {
      const desktopRoot = sectionRef.current?.querySelector<HTMLElement>(
        "[data-stages-desktop]",
      );
      const mobileRoot = sectionRef.current?.querySelector<HTMLElement>(
        "[data-stages-mobile]",
      );
      if (!desktopRoot || !mobileRoot) return;

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("resize", refresh);

      ScrollTrigger.matchMedia({
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)":
          () => {
            gsap.set(desktopRoot, { display: "grid" });
            gsap.set(mobileRoot, { display: "none" });

            const textBlocks = gsap.utils.toArray<HTMLElement>(
              "[data-stage-text]",
              desktopRoot,
            );
            gsap.set(textBlocks, { opacity: (i) => (i === 0 ? 1 : 0) });

            Object.keys(REVEAL_LAYER_TARGET_OPACITY).forEach((id) => {
              gsap.set(desktopRoot.querySelector(`#${id}`), { opacity: 0 });
            });

            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: () =>
                  `+=${window.innerHeight * STAGES.length * SCREENS_PER_STAGE}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });

            STAGES.forEach((stage, i) => {
              if (i === 0) return;
              const at = i - 0.3;
              tl.to(textBlocks[i - 1], { opacity: 0, duration: 0.3 }, at);
              tl.to(textBlocks[i], { opacity: 1, duration: 0.3 }, at);
              if (stage.revealLayer) {
                tl.to(
                  desktopRoot.querySelector(`#${stage.revealLayer}`),
                  {
                    opacity: REVEAL_LAYER_TARGET_OPACITY[stage.revealLayer],
                    duration: 0.3,
                  },
                  at,
                );
              }
            });

            return () => {
              tl.kill();
            };
          },
        "(max-width: 1023px), (prefers-reduced-motion: reduce)": () => {
          gsap.set(desktopRoot, { display: "none" });
          gsap.set(mobileRoot, { display: "grid" });

          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          const cards = gsap.utils.toArray<HTMLElement>(
            "[data-mobile-stage]",
            mobileRoot,
          );

          if (prefersReducedMotion) {
            gsap.set(cards, { opacity: 1, y: 0 });
            return;
          }

          gsap.set(cards, { opacity: 0, y: 24 });
          const triggers = cards.map((card) =>
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: EASE,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }),
          );

          return () => {
            for (const t of triggers) t.scrollTrigger?.kill();
          };
        },
      });

      return () => {
        window.removeEventListener("resize", refresh);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} aria-label="Этапы работ" className="relative">
      <div
        data-stages-desktop
        className="hidden gap-10 px-6 sm:px-10 lg:grid lg:min-h-screen lg:grid-cols-2 lg:items-center"
      >
        <div className="relative h-[360px]">
          {STAGES.map((stage, i) => (
            <article
              key={stage.number}
              data-stage-text={i}
              className="absolute inset-0 flex flex-col justify-center gap-3"
            >
              <StageMeta stage={stage} />
            </article>
          ))}
        </div>
        <div data-stages-blueprint>
          <FloorPlan
            area={68}
            rooms={3}
            bathrooms={1}
            layoutChange="none"
            className="h-auto w-full"
          />
        </div>
      </div>

      <div data-stages-mobile className="grid gap-10 px-6 py-16 sm:px-10">
        <div data-stages-blueprint>
          <FloorPlan
            area={68}
            rooms={3}
            bathrooms={1}
            layoutChange="none"
            className="h-auto w-full"
          />
        </div>
        <ol className="flex flex-col gap-10">
          {STAGES.map((stage) => (
            <li
              key={stage.number}
              data-mobile-stage
              className="flex flex-col gap-3 border-t border-grid pt-6 first:border-t-0 first:pt-0"
            >
              <StageMeta stage={stage} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
