"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Стектрейс — только в консоль разработчика, клиенту он не отдаётся нигде в разметке.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-6 py-16 text-graphite">
      <p className="font-mono text-step-1 text-blueprint">Ошибка</p>
      <h1 className="font-display text-step-2 font-semibold">
        Что-то пошло не так
      </h1>
      <p className="text-step-0 text-graphite/70">
        Попробуйте обновить страницу. Если ошибка повторится — напишите нам.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 w-fit items-center justify-center bg-graphite px-6 py-3 text-step-0 text-paper transition-colors duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-graphite/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
      >
        Попробовать снова
      </button>
    </main>
  );
}
