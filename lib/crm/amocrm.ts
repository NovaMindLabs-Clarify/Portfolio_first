import "server-only";

import type { EstimateInput } from "@/lib/schemas/estimate";

export interface CrmDealPayload {
  name: string;
  phone: string;
  email?: string;
  input: EstimateInput;
  low: number;
  high: number;
}

/**
 * Реального amoCRM-аккаунта под проект нет — вебхук стучится в
 * AMOCRM_WEBHOOK_URL, если он не настроен, сразу считается недоступным.
 * По условию файла (Шаг 7): если CRM недоступна — фолбэк в retry-очередь,
 * а не падение всей заявки. Сам воркер, который переопрашивает failed-заявки
 * и повторяет попытку, не входит в этот шаг.
 */
export async function createAmoCrmDeal(
  payload: CrmDealPayload,
): Promise<boolean> {
  const webhookUrl = process.env.AMOCRM_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("amoCRM не настроен: заявка уйдёт в retry-очередь");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error("Не удалось создать сделку в amoCRM", error);
    return false;
  }
}
