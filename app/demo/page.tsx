import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectDashboard } from "@/components/cabinet/ObjectDashboard";
import { db } from "@/db/client";
import {
  checklistItems,
  estimateChanges,
  estimates,
  messages,
  objects,
  photos,
  stages,
} from "@/db/schema";

export const metadata: Metadata = {
  title: "Демо личного кабинета",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function DemoPage() {
  const [demoObject] = await db
    .select()
    .from(objects)
    .where(eq(objects.isDemo, true))
    .limit(1);

  if (!demoObject) notFound();

  const [
    objectStages,
    objectPhotos,
    [estimate],
    objectChecklist,
    objectMessages,
  ] = await Promise.all([
    db
      .select()
      .from(stages)
      .where(eq(stages.objectId, demoObject.id))
      .orderBy(stages.number),
    db
      .select()
      .from(photos)
      .where(eq(photos.objectId, demoObject.id))
      .orderBy(photos.takenAt),
    db.select().from(estimates).where(eq(estimates.objectId, demoObject.id)),
    db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.objectId, demoObject.id))
      .orderBy(checklistItems.sortOrder),
    db
      .select()
      .from(messages)
      .where(eq(messages.objectId, demoObject.id))
      .orderBy(messages.createdAt),
  ]);

  const changes = estimate
    ? await db
        .select()
        .from(estimateChanges)
        .where(eq(estimateChanges.estimateId, estimate.id))
        .orderBy(estimateChanges.createdAt)
    : [];

  return (
    <main className="min-h-full bg-paper text-graphite">
      <ObjectDashboard
        object={demoObject}
        stages={objectStages}
        photos={objectPhotos}
        estimate={estimate ?? null}
        estimateChanges={changes}
        checklistItems={objectChecklist}
        messages={objectMessages}
        readOnly
      />
    </main>
  );
}
