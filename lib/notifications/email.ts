import "server-only";

import { Resend } from "resend";
import { formatRub } from "@/lib/format";

export interface EstimateEmailPayload {
  to: string;
  name: string;
  low: number;
  high: number;
  pdfBuffer: Buffer;
}

/**
 * Без ключа Resend просто логирует и возвращает false — заявка при этом
 * не должна падать, email тут не единственный канал (см. Telegram).
 */
export async function sendEstimateEmail(
  payload: EstimateEmailPayload,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("Resend не настроен: пропускаю письмо клиенту");
    return false;
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "test <onboarding@resend.dev>",
      to: payload.to,
      subject: "Ваша предварительная смета — КОНТУР",
      html: `<p>Здравствуйте, ${payload.name}!</p><p>Предварительная смета: ${formatRub(payload.low)} — ${formatRub(payload.high)}.</p><p>Полный расчёт — во вложенном PDF. Точная смета — после замера.</p>`,
      attachments: [
        { filename: "smeta-kontur.pdf", content: payload.pdfBuffer },
      ],
    });

    if (error) {
      console.error("Resend вернул ошибку", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Не удалось отправить письмо через Resend", error);
    return false;
  }
}

export interface MagicLinkEmailPayload {
  to: string;
  url: string;
}

/**
 * В отличие от sendEstimateEmail это единственный канал входа в кабинет —
 * при сбое бросаем исключение, чтобы Better Auth вернул клиенту ошибку,
 * а не тихий "успех" без реального письма.
 */
export async function sendMagicLinkEmail(
  payload: MagicLinkEmailPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY не настроен — вход по ссылке недоступен");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "test <onboarding@resend.dev>",
    to: payload.to,
    subject: "Вход в личный кабинет — КОНТУР",
    html: `<p>Ссылка для входа в личный кабинет (действует 5 минут):</p><p><a href="${payload.url}">${payload.url}</a></p>`,
  });

  if (error) {
    throw new Error(`Resend вернул ошибку: ${error.message}`);
  }
}
