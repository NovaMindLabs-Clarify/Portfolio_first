import type {
  ChecklistItem,
  Estimate,
  EstimateChange,
  Message,
  ObjectRow,
  Photo,
  Stage,
} from "@/db/schema";
import { ChatSection } from "./ChatSection";
import { ChecklistSection } from "./ChecklistSection";

export interface ObjectDashboardProps {
  object: ObjectRow;
  stages: Stage[];
  photos: Photo[];
  estimate: Estimate | null;
  estimateChanges: EstimateChange[];
  checklistItems: ChecklistItem[];
  messages: Message[];
  readOnly: boolean;
}

const STAGE_STATUS_LABEL: Record<Stage["status"], string> = {
  planned: "Запланирован",
  in_progress: "В работе",
  done: "Завершён",
};

function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ObjectDashboard({
  object,
  stages,
  photos,
  estimate,
  estimateChanges,
  checklistItems,
  messages,
  readOnly,
}: ObjectDashboardProps) {
  const doneCount = stages.filter((s) => s.status === "done").length;
  const progress = stages.length > 0 ? doneCount / stages.length : 0;

  return (
    <div className="flex flex-col gap-12 px-6 py-10 sm:px-10">
      {readOnly && (
        <p className="border border-blueprint px-4 py-2 text-step--1 text-blueprint">
          Демо-режим — только просмотр, без регистрации. Реальный кабинет
          доступен по /cabinet после входа по ссылке на почту.
        </p>
      )}

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-step-3 font-semibold">
          {object.title}
        </h1>
        <p className="text-step-0 text-graphite/70">
          {object.address} · <span className="font-mono">{object.area} м²</span>
        </p>
      </header>

      <section aria-label="Прогресс этапов" className="flex flex-col gap-3">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Готово ${doneCount} из ${stages.length} этапов`}
          className="h-3 w-full bg-grid"
        >
          <div
            className="h-full bg-blueprint transition-[width] duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <ol className="grid gap-3 sm:grid-cols-5">
          {stages.map((stage) => (
            <li
              key={stage.id}
              className="flex flex-col gap-1 border border-grid p-3"
            >
              <span className="font-mono text-step--1 text-blueprint">
                {String(stage.number).padStart(2, "0")}
              </span>
              <span className="text-step--1 font-medium">{stage.title}</span>
              <span className="text-step--1 text-graphite/60">
                {STAGE_STATUS_LABEL[stage.status]}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Фотоотчёты" className="flex flex-col gap-4">
        <h2 className="font-display text-step-1 font-semibold">Фотоотчёты</h2>
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <span className="text-step--1 text-graphite/60">
                {formatDate(photo.takenAt)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Смета" className="flex flex-col gap-4">
        <h2 className="font-display text-step-1 font-semibold">Смета</h2>
        <p className="font-mono text-step-2">
          {estimate ? formatRub(estimate.amount) : "—"}
        </p>
        <table className="w-full text-step--1">
          <caption className="sr-only">История изменений сметы</caption>
          <thead>
            <tr className="border-b border-grid text-left text-graphite/60">
              <th scope="col" className="py-2 pr-4 font-normal">
                Дата
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Изменение
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Причина
              </th>
              <th scope="col" className="py-2 font-normal">
                Согласовал
              </th>
            </tr>
          </thead>
          <tbody>
            {estimateChanges.map((change) => (
              <tr key={change.id} className="border-b border-grid">
                <td className="py-2 pr-4 font-mono">
                  {formatDate(change.createdAt)}
                </td>
                <td className="py-2 pr-4 font-mono">
                  +{formatRub(change.delta)}
                </td>
                <td className="py-2 pr-4">{change.reason}</td>
                <td className="py-2">{change.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ChecklistSection
        objectId={object.id}
        items={checklistItems}
        readOnly={readOnly}
      />

      <ChatSection
        objectId={object.id}
        messages={messages}
        readOnly={readOnly}
      />
    </div>
  );
}
