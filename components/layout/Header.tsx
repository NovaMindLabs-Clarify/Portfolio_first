import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const NAV_LINKS = [
  { href: "/calculator", label: "Калькулятор" },
  { href: "/cabinet", label: "Личный кабинет" },
] as const;

export function Header() {
  return (
    <header className="border-b border-grid bg-paper">
      <nav
        aria-label="Основная навигация"
        className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:px-10"
      >
        <Link
          href="/"
          className="font-display text-step-1 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
        >
          {SITE_NAME}
        </Link>
        <ul className="flex items-center gap-4 text-step--1 sm:gap-6 sm:text-step-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
