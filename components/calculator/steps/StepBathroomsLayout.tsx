"use client";

import { useFormContext } from "react-hook-form";
import type { EstimateInput } from "@/lib/schemas/estimate";
import { sliderProgressStyle } from "@/lib/sliderStyle";

const LAYOUT_OPTIONS: {
  value: EstimateInput["layoutChange"];
  label: string;
}[] = [
  { value: "none", label: "Без изменений" },
  { value: "partitions", label: "Перенос перегородок" },
  { value: "wetZones", label: "Перенос мокрых зон" },
];

export function StepBathroomsLayout({
  firstFieldRef,
}: {
  firstFieldRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const { watch, setValue, register } = useFormContext<EstimateInput>();
  const bathrooms = watch("bathrooms");
  const { ref: layoutRegisterRef, ...layoutRadioProps } =
    register("layoutChange");

  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="font-display text-step-2 font-semibold">
        Санузлы и планировка
      </legend>

      <div className="flex flex-col gap-2">
        <label htmlFor="bathrooms-slider" className="text-step--1 font-medium">
          Санузлы
        </label>
        <input
          ref={firstFieldRef}
          id="bathrooms-slider"
          type="range"
          min={1}
          max={5}
          step={1}
          value={bathrooms}
          onChange={(e) =>
            setValue("bathrooms", Number(e.target.value), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          aria-valuetext={`${bathrooms} санузлов`}
          className="kontur-slider"
          style={sliderProgressStyle(bathrooms, 1, 5)}
        />
        <output className="font-mono text-step-0">{bathrooms}</output>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-step--1 font-medium">Перепланировка</span>
        {LAYOUT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-step-0"
          >
            <input
              {...layoutRadioProps}
              ref={layoutRegisterRef}
              type="radio"
              value={option.value}
              className="kontur-radio"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
