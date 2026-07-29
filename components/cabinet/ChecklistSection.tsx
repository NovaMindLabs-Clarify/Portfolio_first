"use client";

import { useTransition } from "react";
import type { ChecklistItem } from "@/db/schema";
import { toggleChecklistItem } from "@/lib/actions/cabinet";

export function ChecklistSection({
  objectId,
  items,
  readOnly,
}: {
  objectId: number;
  items: ChecklistItem[];
  readOnly: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-display text-step-1 font-semibold">
        Чек-лист приёмки
      </legend>
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-3 text-step-0">
          <input
            type="checkbox"
            checked={item.checked}
            disabled={readOnly || isPending}
            onChange={() =>
              startTransition(() => toggleChecklistItem(item.id, objectId))
            }
            className="h-5 w-5 accent-blueprint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint disabled:opacity-50"
          />
          <span
            className={
              item.checked ? "text-graphite/60 line-through" : undefined
            }
          >
            {item.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
