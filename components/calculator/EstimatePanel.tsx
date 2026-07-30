"use client";

import { useId, useRef, useState } from "react";
import type { EstimateResult } from "@/lib/estimate";
import type { EstimateInput } from "@/lib/schemas/estimate";
import { ContactModal } from "./ContactModal";
import { TickerNumber } from "./TickerNumber";

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={tooltipId}
        aria-label="Пояснение к расчёту"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-grid text-step--1 text-graphite/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
      >
        i
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 border border-grid bg-paper p-2 text-step--1 text-graphite shadow-sm ${
          open ? "block" : "hidden"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

function PdfIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 2.5h6.5L15 6v11a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-14a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M11.5 2.5V6H15" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 11h6M6.5 13.5h6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

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
      className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-grid bg-paper px-4 py-2 sm:px-10 sm:py-4"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <p className="text-step-0 sm:text-step-1">
          <TickerNumber value={result.low} /> —{" "}
          <TickerNumber value={result.high} />
        </p>
        <InfoTooltip text={result.disclaimer} />
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Получить смету в PDF"
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 bg-graphite px-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint sm:px-6"
      >
        <span className="sm:hidden">
          <PdfIcon />
        </span>
        <span className="hidden sm:inline">Получить смету в PDF</span>
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
