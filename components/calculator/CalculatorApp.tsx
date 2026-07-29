"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FloorPlan } from "@/components/blueprint/FloorPlan";
import { estimateRoomsFromArea } from "@/lib/calculator/deriveRooms";
import { calculateEstimate } from "@/lib/estimate";
import {
  type EstimateInput,
  estimateInputSchema,
} from "@/lib/schemas/estimate";
import { EstimatePanel } from "./EstimatePanel";
import { StepArea } from "./steps/StepArea";
import { StepBathroomsLayout } from "./steps/StepBathroomsLayout";
import { StepRepairType } from "./steps/StepRepairType";
import { StepUrgency } from "./steps/StepUrgency";
import {
  readEstimateStateFromLocation,
  writeEstimateStateToLocation,
} from "./urlState";

const MATERIALS_BY_REPAIR_TYPE: Record<
  EstimateInput["repairType"],
  EstimateInput["materialsClass"]
> = {
  cosmetic: "economy",
  capital: "standard",
  designer: "premium",
};

const DEFAULT_VALUES: EstimateInput = {
  area: 68,
  repairType: "cosmetic",
  bathrooms: 1,
  urgency: "normal",
  layoutChange: "none",
  materialsClass: "economy",
};

const STEPS = [
  { number: "01", title: "Площадь" },
  { number: "02", title: "Тип ремонта" },
  { number: "03", title: "Санузлы и планировка" },
  { number: "04", title: "Сроки" },
] as const;

export function CalculatorApp() {
  const methods = useForm<EstimateInput>({
    resolver: zodResolver(estimateInputSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });
  const { watch, setValue } = methods;

  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<EstimateInput>(DEFAULT_VALUES);
  const stepFieldRef = useRef<HTMLInputElement>(null);

  // Расшаренный расчёт восстанавливаем ПОСЛЕ монтирования, а не в defaultValues —
  // иначе сервер и первый клиентский рендер разойдутся (у сервера нет window.location).
  useEffect(() => {
    const fromUrl = readEstimateStateFromLocation();
    if (fromUrl) methods.reset(fromUrl);
  }, [methods]);

  useEffect(() => {
    const rafRef = { current: 0 };
    const subscription = watch((values) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const parsed = estimateInputSchema.safeParse(values);
        if (!parsed.success) return;
        setPreview(parsed.data);
        writeEstimateStateToLocation(parsed.data);
      });
    });
    return () => {
      subscription.unsubscribe();
      cancelAnimationFrame(rafRef.current);
    };
  }, [watch]);

  // Класс материалов не выведен отдельным шагом — следует за типом ремонта.
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "repairType" && values.repairType) {
        setValue("materialsClass", MATERIALS_BY_REPAIR_TYPE[values.repairType]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    stepFieldRef.current?.focus();
  }, []);

  const result = useMemo(() => calculateEstimate(preview), [preview]);
  const rooms = estimateRoomsFromArea(preview.area);

  const goTo = (next: number) => {
    setStep(next);
    // Фокус на первое поле нового шага переносим после перерисовки, когда
    // ref уже привязан к полю именно этого шага.
    requestAnimationFrame(() => stepFieldRef.current?.focus());
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-10 px-6 py-10 sm:px-10">
        <ol className="flex flex-wrap gap-4 font-mono text-step--1 text-graphite/60">
          {STEPS.map((s, i) => (
            <li
              key={s.number}
              aria-current={i === step ? "step" : undefined}
              className={i === step ? "text-blueprint" : undefined}
            >
              {s.number} {s.title}
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-2">
          <form className="flex flex-col gap-8" noValidate>
            {step === 0 && <StepArea firstFieldRef={stepFieldRef} />}
            {step === 1 && <StepRepairType firstFieldRef={stepFieldRef} />}
            {step === 2 && <StepBathroomsLayout firstFieldRef={stepFieldRef} />}
            {step === 3 && <StepUrgency firstFieldRef={stepFieldRef} />}

            <div className="flex gap-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="min-h-11 border border-grid px-6 py-3 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
                >
                  Назад
                </button>
              )}
              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  className="min-h-11 bg-graphite px-6 py-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
                >
                  Далее
                </button>
              )}
            </div>
          </form>

          <div>
            <FloorPlan
              area={preview.area}
              rooms={rooms}
              bathrooms={preview.bathrooms}
              layoutChange={preview.layoutChange}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>

      <EstimatePanel result={result} estimateInput={preview} />
    </FormProvider>
  );
}
