import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-6 py-16 text-graphite">
      <p className="font-mono text-step-1 text-blueprint">404</p>
      <h1 className="font-display text-step-2 font-semibold">
        Страница не найдена
      </h1>
      <p className="text-step-0 text-graphite/70">
        Возможно, ссылка устарела или страница переехала.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 w-fit items-center justify-center bg-graphite px-6 py-3 text-step-0 text-paper transition-colors duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-graphite/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
      >
        На главную
      </Link>
    </main>
  );
}
