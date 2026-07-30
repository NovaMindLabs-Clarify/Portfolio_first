"use client";

import { useFormContext } from "react-hook-form";
import type { EstimateInput } from "@/lib/schemas/estimate";
import { sliderProgressStyle } from "@/lib/sliderStyle";

export function StepArea({
  firstFieldRef,
}: {
  firstFieldRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EstimateInput>();

  const area = watch("area");

  const onChange = (next: number) =>
    setValue("area", next, { shouldValidate: true, shouldDirty: true });

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-display text-step-2 font-semibold">
        Площадь
      </legend>

      <label htmlFor="area-slider" className="sr-only">
        Площадь
      </label>
      <input
        ref={firstFieldRef}
        id="area-slider"
        type="range"
        min={20}
        max={300}
        step={1}
        value={area}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${area} квадратных метров`}
        className="kontur-slider"
        style={sliderProgressStyle(area, 20, 300)}
      />

      <label className="flex items-center gap-3 text-step-0">
        Площадь, м²
        <input
          type="number"
          min={20}
          max={300}
          value={area}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 border border-grid px-3 py-2 font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
        />
      </label>

      {errors.area && (
        <p role="alert" className="text-step--1 text-red-700">
          {errors.area.message}
        </p>
      )}
    </fieldset>
  );
}
