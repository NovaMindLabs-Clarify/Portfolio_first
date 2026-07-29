"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { estimateSubmissions } from "@/db/schema";
import { createAmoCrmDeal } from "@/lib/crm/amocrm";
import { calculateEstimate } from "@/lib/estimate";
import { sendEstimateEmail } from "@/lib/notifications/email";
import { notifyManagerInTelegram } from "@/lib/notifications/telegram";
import { EstimatePdf } from "@/lib/pdf/EstimatePdf";
import { isRateLimited } from "@/lib/rateLimit";
import { type ContactInput, contactInputSchema } from "@/lib/schemas/contact";
import {
  type EstimateInput,
  estimateInputSchema,
} from "@/lib/schemas/estimate";

export interface SubmitEstimateResult {
  success: boolean;
  error?: string;
}

export async function submitEstimate(
  rawEstimate: EstimateInput,
  rawContact: ContactInput,
): Promise<SubmitEstimateResult> {
  const estimateResult = estimateInputSchema.safeParse(rawEstimate);
  const contactResult = contactInputSchema.safeParse(rawContact);

  if (!estimateResult.success) {
    return { success: false, error: "Проверьте параметры расчёта" };
  }
  if (!contactResult.success) {
    const firstIssue = contactResult.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Проверьте контактные данные",
    };
  }

  const contact = contactResult.data;

  // Honeypot: бот заполнил скрытое поле — молча делаем вид, что всё ок,
  // ничего не сохраняя и не уведомляя.
  if (contact.website) {
    return { success: true };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return {
      success: false,
      error: "Слишком много попыток. Попробуйте через минуту.",
    };
  }

  const input = estimateResult.data;
  // Вилку считаем заново на сервере — клиентским числам не доверяем.
  const { low, high, disclaimer } = calculateEstimate(input);

  const [submission] = await db
    .insert(estimateSubmissions)
    .values({
      area: input.area,
      repairType: input.repairType,
      bathrooms: input.bathrooms,
      urgency: input.urgency,
      layoutChange: input.layoutChange,
      materialsClass: input.materialsClass,
      estimateLow: low,
      estimateHigh: high,
      name: contact.name,
      phone: contact.phone,
      email: contact.email || null,
    })
    .returning({ id: estimateSubmissions.id });

  const pdfBuffer = await renderToBuffer(
    <EstimatePdf
      input={input}
      low={low}
      high={high}
      disclaimer={disclaimer}
      name={contact.name}
      createdAt={new Date()}
    />,
  );

  await notifyManagerInTelegram({
    input,
    low,
    high,
    name: contact.name,
    phone: contact.phone,
    email: contact.email || undefined,
  });

  if (contact.email) {
    await sendEstimateEmail({
      to: contact.email,
      name: contact.name,
      low,
      high,
      pdfBuffer,
    });
  }

  const crmSynced = await createAmoCrmDeal({
    name: contact.name,
    phone: contact.phone,
    email: contact.email || undefined,
    input,
    low,
    high,
  });

  await db
    .update(estimateSubmissions)
    .set({
      crmSyncStatus: crmSynced ? "synced" : "failed",
      crmSyncAttempts: 1,
    })
    .where(eq(estimateSubmissions.id, submission.id));

  return { success: true };
}
