import type { CSSProperties } from "react";

/** CSS custom property, потребляется классом .kontur-slider в globals.css. */
export function sliderProgressStyle(
  value: number,
  min: number,
  max: number,
): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return { "--range-progress": `${pct}%` } as CSSProperties;
}
