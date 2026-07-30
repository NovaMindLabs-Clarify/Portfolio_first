"use client";

import { useFormContext } from "react-hook-form";
import type { EstimateInput } from "@/lib/schemas/estimate";

const OPTIONS: {
  value: EstimateInput["urgency"];
  label: string;
  hint: string;
}[] = [
  { value: "normal", label: "Обычный", hint: "Стандартный график бригады" },
  {
    value: "accelerated",
    label: "Ускоренный",
    hint: "Плюс бригада по выходным",
  },
  {
    value: "urgent",
    label: "Срочный",
    hint: "Максимальный приоритет и вторая бригада",
  },
];

export function StepUrgency({
  firstFieldRef,
}: {
  firstFieldRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const { register } = useFormContext<EstimateInput>();
  const { ref: registerRef, ...radioProps } = register("urgency");

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-display text-step-2 font-semibold">Сроки</legend>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((option, i) => (
          <label
            key={option.value}
            className="group flex cursor-pointer items-start gap-3"
          >
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
              className="kontur-radio mt-1"
            />
            <span className="flex flex-col">
              <span className="text-step-0 font-medium">{option.label}</span>
              <span className="text-step--1 text-graphite/70">
                {option.hint}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
