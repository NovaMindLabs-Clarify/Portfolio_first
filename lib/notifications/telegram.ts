import "server-only";

import type { EstimateInput } from "@/lib/schemas/estimate";

const REPAIR_TYPE_LABEL: Record<EstimateInput["repairType"], string> = {
  cosmetic: "Косметический",
  capital: "Капитальный",
  designer: "Дизайнерский",
};

export interface LeadNotification {
  input: EstimateInput;
  low: number;
  high: number;
  name: string;
  phone: string;
  email?: string;
}

/**
 * В СНГ уведомление менеджеру в Telegram работает надёжнее email — см. CLAUDE.md.
 * Не бросает исключение наружу: сбой уведомления не должен ронять всю заявку.
 */
export async function notifyManagerInTelegram(
  lead: LeadNotification,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram не настроен: пропускаю уведомление менеджеру");
    return false;
  }

  const text = [
    "🔔 Новая заявка",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    `Площадь: ${lead.input.area} м²`,
    `Тип ремонта: ${REPAIR_TYPE_LABEL[lead.input.repairType]}`,
    `Санузлы: ${lead.input.bathrooms}`,
    `Вилка: ${lead.low.toLocaleString("ru-RU")} — ${lead.high.toLocaleString("ru-RU")} ₽`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      },
    );
    return response.ok;
  } catch (error) {
    console.error("Не удалось отправить уведомление в Telegram", error);
    return false;
  }
}
