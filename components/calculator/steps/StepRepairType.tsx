"use client";

import { useFormContext } from "react-hook-form";
import type { EstimateInput } from "@/lib/schemas/estimate";

const OPTIONS: {
  value: EstimateInput["repairType"];
  title: string;
  description: string;
}[] = [
  {
    value: "cosmetic",
    title: "Косметический",
    description: "Обновление отделки без изменения инженерии",
  },
  {
    value: "capital",
    title: "Капитальный",
    description: "Полная замена инженерии и черновой отделки",
  },
  {
    value: "designer",
    title: "Дизайнерский",
    description: "Индивидуальный проект и premium-материалы",
  },
];

export function StepRepairType({
  firstFieldRef,
}: {
  firstFieldRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const { register } = useFormContext<EstimateInput>();
  const { ref: registerRef, ...radioProps } = register("repairType");

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-display text-step-2 font-semibold">
        Тип ремонта
      </legend>

      <div className="grid gap-4 sm:grid-cols-3">
        {OPTIONS.map((option, i) => (
          <label key={option.value} className="group cursor-pointer">
            <input
              {...radioProps}
              ref={(el) => {
                registerRef(el);
                if (i === 0 && firstFieldRef)
                  (
                    firstFieldRef as React.RefObject<HTMLInputElement | null>
                  ).current = el;
              }}
              type="radio"
              value={option.value}
              className="peer sr-only"
            />
            <div className="flex h-full flex-col gap-2 border border-grid p-4 transition-colors duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-checked:border-graphite peer-checked:bg-graphite peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blueprint">
              <span className="text-step-0 font-medium">{option.title}</span>
              <span className="text-step--1 opacity-80">
                {option.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
