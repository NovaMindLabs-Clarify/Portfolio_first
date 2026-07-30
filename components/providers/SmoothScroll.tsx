"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * lenis.raf ведётся вручную через gsap.ticker (а не собственный rAF Lenis) —
 * это единственный способ не рассинхронизировать плавный скролл и ScrollTrigger.
 * См. CLAUDE.md / карту анимаций проекта.
 *
 * GSAP+ScrollTrigger грузятся здесь динамически, а не статическим импортом:
 * этот провайдер стоит в корневом layout и раньше тянул ~190КБ GSAP на КАЖДУЮ
 * страницу, включая калькулятор и кабинет, где ScrollTrigger вообще не
 * используется. На страницах, где GSAP и так статически импортирован
 * (например, StagesScroll на главной), Next.js переиспользует тот же модуль —
 * двойной загрузки не происходит.
 */
function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const onScroll = () => ScrollTrigger.update();
        const onTick = (time: number) => lenis.raf(time * 1000);

        lenis.on("scroll", onScroll);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => {
          lenis.off("scroll", onScroll);
          gsap.ticker.remove(onTick);
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}
