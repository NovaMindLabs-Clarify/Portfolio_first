"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { checklistItems, messages, objects } from "@/db/schema";
import { auth } from "@/lib/auth";

async function assertOwnsObject(objectId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Не авторизовано");

  const [object] = await db
    .select({ userId: objects.userId, isDemo: objects.isDemo })
    .from(objects)
    .where(eq(objects.id, objectId));

  if (!object || object.isDemo || object.userId !== session.user.id) {
    throw new Error("Нет доступа к этому объекту");
  }
}

export async function toggleChecklistItem(itemId: number, objectId: number) {
  await assertOwnsObject(objectId);

  const [item] = await db
    .select({ checked: checklistItems.checked })
    .from(checklistItems)
    .where(eq(checklistItems.id, itemId));
  if (!item) throw new Error("Пункт чек-листа не найден");

  await db
    .update(checklistItems)
    .set({ checked: !item.checked })
    .where(eq(checklistItems.id, itemId));

  revalidatePath(`/cabinet/${objectId}`);
}

export async function postMessage(objectId: number, body: string) {
  await assertOwnsObject(objectId);

  const trimmed = body.trim();
  if (!trimmed) return;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Не авторизовано");

  await db.insert(messages).values({
    objectId,
    authorRole: "client",
    authorName: session.user.name || session.user.email,
    body: trimmed,
  });

  revalidatePath(`/cabinet/${objectId}`);
}
