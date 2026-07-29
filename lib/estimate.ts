import type { EstimateInput } from "./schemas/estimate";

export interface EstimateResult {
  /** Расчёт без вилки, ₽ */
  base: number;
  /** Нижняя граница вилки (−8%), ₽ */
  low: number;
  /** Верхняя граница вилки (+12%), ₽ */
  high: number;
  disclaimer: string;
}

const DISCLAIMER = "Предварительный расчёт. Точная смета — после замера.";

/** Ставка, ₽/м², рынок Санкт-Петербурга 2026 — см. CLAUDE.md, раздел "Формула сметы" */
const BASE_RATE: Record<EstimateInput["repairType"], number> = {
  cosmetic: 8000,
  capital: 12400,
  designer: 16500,
};

/** Материалы, ₽/м², по классу */
const MATERIALS_RATE: Record<EstimateInput["materialsClass"], number> = {
  economy: 3000,
  standard: 6000,
  premium: 12000,
};

const URGENCY_FACTOR: Record<EstimateInput["urgency"], number> = {
  normal: 1.0,
  accelerated: 1.15,
  urgent: 1.3,
};

const LAYOUT_FACTOR: Record<EstimateInput["layoutChange"], number> = {
  none: 1.0,
  partitions: 1.12,
  wetZones: 1.25,
};

const LOW_FACTOR = 0.92; // −8%
const HIGH_FACTOR = 1.12; // +12%

/**
 * Смета = Площадь × Ставка × K_санузлы × K_срочность × K_планировка + Материалы
 * Формула зафиксирована в CLAUDE.md — не менять коэффициенты на месте.
 */
export function calculateEstimate(input: EstimateInput): EstimateResult {
  const bathroomsFactor = 1 + 0.08 * (input.bathrooms - 1);
  const rate = BASE_RATE[input.repairType];
  const materials = input.area * MATERIALS_RATE[input.materialsClass];

  const base =
    input.area *
      rate *
      bathroomsFactor *
      URGENCY_FACTOR[input.urgency] *
      LAYOUT_FACTOR[input.layoutChange] +
    materials;

  return {
    base: Math.round(base),
    low: Math.round(base * LOW_FACTOR),
    high: Math.round(base * HIGH_FACTOR),
    disclaimer: DISCLAIMER,
  };
}
