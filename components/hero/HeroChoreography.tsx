"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, DrawSVGPlugin);

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Не рендерит ничего — только навешивает GSAP-таймлайн на уже отрисованный на
 * сервере DOM хиро-секции (см. Hero.tsx). Поэтому грузится через next/dynamic
 * с ssr:false: сам текст/SVG уже в HTML и не зависит от того, догрузился ли JS.
 */
export function HeroChoreography() {
  useGSAP(
    () => {
      const heading = document.querySelector<HTMLElement>(
        "[data-hero-heading]",
      );
      const wallPaths = document.querySelectorAll<SVGPathElement>(
        "[data-hero-blueprint] #walls path",
      );
      const dimensions = document.querySelectorAll<SVGElement>(
        "[data-hero-blueprint] #dimensions > *",
      );
      const cta = document.querySelector<HTMLElement>("[data-hero-cta]");
      const stage = document.querySelector<HTMLElement>("#hero-stage");

      if (!stage) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.from(stage, { opacity: 0, duration: 0.2 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      if (heading) {
        const split = SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          onSplit: (self) =>
            tl.from(self.lines, {
              yPercent: 110,
              duration: 0.6,
              stagger: 0.08,
            }),
        });
        // useGSAP-контекст чистит твины/таймлайны, но не сам SplitText-маркап —
        // возвращаем cleanup, чтобы при анмаунте вернуть исходный DOM h1.
        tl.eventCallback("onInterrupt", () => split.revert());
      }

      if (wallPaths.length > 0) {
        tl.from(
          wallPaths,
          {
            drawSVG: "0%",
            duration: 1.2,
            ease: "power2.inOut",
            stagger: 0.05,
          },
          0,
        );
      }

      if (dimensions.length > 0) {
        tl.from(
          dimensions,
          { opacity: 0, duration: 0.3, stagger: 0.04 },
          ">-0.2",
        );
      }

      if (cta) {
        tl.from(cta, { scale: 0.92, opacity: 0, duration: 0.3 }, ">-0.1");
      }
    },
    { scope: "#hero-stage" },
  );

  return null;
}
