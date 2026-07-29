"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatRub } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

export function TickerNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, formatRub);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      motionValue.jump(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.4,
      ease: EASE,
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span className="font-mono">{display}</motion.span>;
}
