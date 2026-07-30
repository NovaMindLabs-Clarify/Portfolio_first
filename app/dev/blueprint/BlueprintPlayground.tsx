"use client";

import { useId, useState } from "react";
import { FloorPlan } from "@/components/blueprint/FloorPlan";
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

export function BlueprintPlayground() {
  const [area, setArea] = useState(68);
  const [rooms, setRooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(1);
  const [layoutChange, setLayoutChange] =
    useState<EstimateInput["layoutChange"]>("none");

  const areaId = useId();
  const roomsId = useId();
  const bathroomsId = useId();

  return (
    <main className="min-h-full bg-paper px-6 py-10 text-graphite sm:px-10">
      <h1 className="font-display text-step-2 font-semibold">
        FloorPlan — dev playground
      </h1>
      <p className="mt-2 max-w-prose text-step-0 text-graphite/70">
        Демо-страница компонента components/blueprint/FloorPlan.tsx. Не для
        продакшена — noindex.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <form
          className="flex flex-col gap-6 border border-grid p-5"
          aria-label="Параметры планировки"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor={areaId} className="text-step--1 font-medium">
              Площадь
            </label>
            <input
              id={areaId}
              type="range"
              min={20}
              max={300}
              step={1}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              aria-valuetext={`${area} квадратных метров`}
              className="kontur-slider"
              style={sliderProgressStyle(area, 20, 300)}
            />
            <output htmlFor={areaId} className="font-mono text-step-0">
              {area} м²
            </output>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={roomsId} className="text-step--1 font-medium">
              Комнаты
            </label>
            <input
              id={roomsId}
              type="range"
              min={1}
              max={6}
              step={1}
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              aria-valuetext={`${rooms} комнат`}
              className="kontur-slider"
              style={sliderProgressStyle(rooms, 1, 6)}
            />
            <output htmlFor={roomsId} className="font-mono text-step-0">
              {rooms}
            </output>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={bathroomsId} className="text-step--1 font-medium">
              Санузлы
            </label>
            <input
              id={bathroomsId}
              type="range"
              min={1}
              max={5}
              step={1}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              aria-valuetext={`${bathrooms} санузлов`}
              className="kontur-slider"
              style={sliderProgressStyle(bathrooms, 1, 5)}
            />
            <output htmlFor={bathroomsId} className="font-mono text-step-0">
              {bathrooms}
            </output>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-step--1 font-medium">Перепланировка</legend>
            {LAYOUT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-step--1"
              >
                <input
                  type="radio"
                  name="layoutChange"
                  value={option.value}
                  checked={layoutChange === option.value}
                  onChange={() => setLayoutChange(option.value)}
                  className="kontur-radio"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </form>

        <div className="border border-grid p-4">
          <FloorPlan
            area={area}
            rooms={rooms}
            bathrooms={bathrooms}
            layoutChange={layoutChange}
            className="h-auto w-full"
          />
        </div>
      </div>
    </main>
  );
}
