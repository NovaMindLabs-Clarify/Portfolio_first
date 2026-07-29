import { describe, expect, it } from "vitest";
import { calculateEstimate } from "./estimate";
import type { EstimateInput } from "./schemas/estimate";

const BASE_RATE: Record<EstimateInput["repairType"], number> = {
  cosmetic: 8000,
  capital: 12400,
  designer: 16500,
};

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

function expectedBase(input: EstimateInput): number {
  const bathroomsFactor = 1 + 0.08 * (input.bathrooms - 1);
  const materials = input.area * MATERIALS_RATE[input.materialsClass];
  const base =
    input.area *
      BASE_RATE[input.repairType] *
      bathroomsFactor *
      URGENCY_FACTOR[input.urgency] *
      LAYOUT_FACTOR[input.layoutChange] +
    materials;
  return Math.round(base);
}

const baseInput: EstimateInput = {
  area: 68,
  repairType: "cosmetic",
  bathrooms: 1,
  urgency: "normal",
  layoutChange: "none",
  materialsClass: "economy",
};

describe("calculateEstimate — граничные значения площади", () => {
  it("считает нижнюю границу 20 м²", () => {
    const result = calculateEstimate({ ...baseInput, area: 20 });
    expect(result.base).toBe(expectedBase({ ...baseInput, area: 20 }));
    expect(result.base).toBeGreaterThan(0);
  });

  it("считает за пределами диапазона калькулятора — 500 м² (формула не должна ломаться)", () => {
    const result = calculateEstimate({ ...baseInput, area: 500 });
    expect(result.base).toBe(expectedBase({ ...baseInput, area: 500 }));
    expect(Number.isFinite(result.base)).toBe(true);
    expect(result.base).toBeGreaterThan(0);
  });
});

describe("calculateEstimate — все комбинации коэффициентов", () => {
  const repairTypes = Object.keys(BASE_RATE) as EstimateInput["repairType"][];
  const materialsClasses = Object.keys(
    MATERIALS_RATE,
  ) as EstimateInput["materialsClass"][];
  const urgencies = Object.keys(URGENCY_FACTOR) as EstimateInput["urgency"][];
  const layouts = Object.keys(LAYOUT_FACTOR) as EstimateInput["layoutChange"][];
  const bathroomsOptions = [1, 2, 3, 4, 5];

  for (const repairType of repairTypes) {
    for (const materialsClass of materialsClasses) {
      for (const urgency of urgencies) {
        for (const layoutChange of layouts) {
          for (const bathrooms of bathroomsOptions) {
            const input: EstimateInput = {
              area: 68,
              repairType,
              bathrooms,
              urgency,
              layoutChange,
              materialsClass,
            };

            it(`${repairType}/${materialsClass}/${urgency}/${layoutChange}/${bathrooms} с.у. совпадает с формулой`, () => {
              const result = calculateEstimate(input);
              expect(result.base).toBe(expectedBase(input));
            });
          }
        }
      }
    }
  }
});

describe("calculateEstimate — вилка", () => {
  it("вилка всегда шире 15% от базы", () => {
    const inputs: EstimateInput[] = [
      { ...baseInput },
      {
        ...baseInput,
        area: 20,
        repairType: "designer",
        bathrooms: 5,
        urgency: "urgent",
        layoutChange: "wetZones",
        materialsClass: "premium",
      },
      {
        ...baseInput,
        area: 300,
        repairType: "capital",
        bathrooms: 3,
        urgency: "accelerated",
        layoutChange: "partitions",
        materialsClass: "standard",
      },
    ];

    for (const input of inputs) {
      const { base, low, high } = calculateEstimate(input);
      const width = (high - low) / base;
      expect(width).toBeGreaterThan(0.15);
    }
  });

  it("нижняя граница ниже базы, верхняя выше базы", () => {
    const { base, low, high } = calculateEstimate(baseInput);
    expect(low).toBeLessThan(base);
    expect(high).toBeGreaterThan(base);
  });

  it("возвращает обязательный дисклеймер", () => {
    const { disclaimer } = calculateEstimate(baseInput);
    expect(disclaimer).toBe(
      "Предварительный расчёт. Точная смета — после замера.",
    );
  });
});
