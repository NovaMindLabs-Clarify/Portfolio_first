"use client";

import { useId, useRef, useTransition } from "react";
import type { Message } from "@/db/schema";
import { postMessage } from "@/lib/actions/cabinet";
import { formatDateTimeRu } from "@/lib/format";

function formatDateTime(date: Date): string {
  return formatDateTimeRu(new Date(date));
}

export function ChatSection({
  objectId,
  messages,
  readOnly,
}: {
  objectId: number;
  messages: Message[];
  readOnly: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fieldId = useId();

  return (
    <section aria-label="Чат с прорабом" className="flex flex-col gap-4">
      <h2 className="font-display text-step-1 font-semibold">Чат с прорабом</h2>

      <ol className="flex flex-col gap-3">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`max-w-[80%] border border-grid p-3 text-step--1 ${
              message.authorRole === "foreman" ? "" : "self-end bg-graphite/5"
            }`}
          >
            <p className="font-medium">{message.authorName}</p>
            <p className="mt-1">{message.body}</p>
            <p className="mt-1 font-mono text-graphite/50">
              {formatDateTime(message.createdAt)}
            </p>
          </li>
        ))}
      </ol>

      {!readOnly && (
        <form
          ref={formRef}
          action={(formData) => {
            const body = String(formData.get(fieldId) ?? "");
            startTransition(async () => {
              await postMessage(objectId, body);
              formRef.current?.reset();
            });
          }}
          className="flex gap-3"
        >
          <label htmlFor={fieldId} className="sr-only">
            Сообщение прорабу
          </label>
          <input
            id={fieldId}
            name={fieldId}
            required
            className="flex-1 border border-grid px-3 py-2 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
          />
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 bg-graphite px-6 py-2 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint disabled:opacity-60"
          >
            Отправить
          </button>
        </form>
      )}
    </section>
  );
}
