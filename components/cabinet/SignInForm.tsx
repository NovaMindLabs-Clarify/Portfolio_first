"use client";

import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/cabinet",
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message ?? "Не отправилось. Попробуйте ещё раз.");
      return;
    }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <p className="text-step-0">
        Ссылка для входа отправлена на {email}. Проверьте почту — письмо
        действует 5 минут.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor={emailId} className="flex flex-col gap-1 text-step--1">
        Email
        <input
          id={emailId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-grid px-3 py-2 text-step-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint"
        />
      </label>

      {status === "error" && (
        <p role="alert" className="text-step--1 text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-11 self-start bg-graphite px-6 py-3 text-step-0 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем…" : "Получить ссылку для входа"}
      </button>
    </form>
  );
}
