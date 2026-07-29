"use client";

import dynamic from "next/dynamic";

/**
 * next/dynamic с ssr:false обязан жить в клиентском компоненте (ограничение
 * Next.js App Router) — поэтому сам вызов dynamic() вынесен сюда, а Hero.tsx
 * (Server Component) рендерит уже этот тонкий враппер.
 */
export const HeroChoreographyLoader = dynamic(
  () => import("./HeroChoreography").then((mod) => mod.HeroChoreography),
  { ssr: false },
);
