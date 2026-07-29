"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { EstimateInput } from "@/lib/schemas/estimate";

export function ContactModal({
  estimateInput,
  onClose,
  triggerRef,
}: {
  estimateInput: EstimateInput;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const titleId = useId();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    firstFieldRef.current?.focus();
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [triggerRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable =
        dialogRef.current.querySelectorAll<HTMLElement>("input, button");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const { submitEstimate } = await import("@/lib/actions/submitEstimate");
    const result = await submitEstimate(estimateInput, {
      name,
      phone,
      email: email || undefined,
      website: website || undefined,
    });

    if (result.success) {
      setStatus("done");
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Не отправилось. Попробуйте ещё раз.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md bg-paper p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "done" ? (
          <>
            <h2 id={titleId} className="font-display text-step-2 font-semibold">
              Заявка отправлена
            </h2>
            <p className="mt-3 text-step-0">
              Мы получили заявку и вышлем PDF-смету на почту, если вы её
              указали. Менеджер свяжется по телефону.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-11 bg-graphite px-6 py-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
            >
              Закрыть
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 id={titleId} className="font-display text-step-2 font-semibold">
              Получить смету в PDF
            </h2>

            <label
              htmlFor={nameId}
              className="flex flex-col gap-1 text-step--1"
            >
              Имя
              <input
                ref={firstFieldRef}
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border border-grid px-3 py-2 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
              />
            </label>

            <label
              htmlFor={phoneId}
              className="flex flex-col gap-1 text-step--1"
            >
              Телефон
              <input
                id={phoneId}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+7 900 123-45-67"
                className="border border-grid px-3 py-2 font-mono text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
              />
            </label>

            <label
              htmlFor={emailId}
              className="flex flex-col gap-1 text-step--1"
            >
              Email (необязательно)
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-grid px-3 py-2 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
              />
            </label>

            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              className="sr-only"
            />

            {status === "error" && (
              <p role="alert" className="text-step--1 text-red-700">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 border border-grid px-6 py-3 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={status === "sending"}
                className="min-h-11 bg-graphite px-6 py-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint disabled:opacity-60"
              >
                {status === "sending" ? "Отправляем…" : "Получить смету"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
