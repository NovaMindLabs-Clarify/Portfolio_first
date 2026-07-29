"use client";

import { useRef, useState } from "react";
import type { EstimateResult } from "@/lib/estimate";
import type { EstimateInput } from "@/lib/schemas/estimate";
import { ContactModal } from "./ContactModal";
import { TickerNumber } from "./TickerNumber";

export function EstimatePanel({
  result,
  estimateInput,
}: {
  result: EstimateResult;
  estimateInput: EstimateInput;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-grid bg-paper px-6 py-4 sm:px-10"
      aria-live="polite"
    >
      <div>
        <p className="text-step-1">
          <TickerNumber value={result.low} /> —{" "}
          <TickerNumber value={result.high} />
        </p>
        <p className="text-step--1 text-graphite/60">{result.disclaimer}</p>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setModalOpen(true)}
        className="min-h-11 bg-graphite px-6 py-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
      >
        Получить смету в PDF
      </button>

      {modalOpen && (
        <ContactModal
          estimateInput={estimateInput}
          onClose={() => setModalOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
}
