import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
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
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CabinetObjectPage({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId: objectIdParam } = await params;
  const objectId = Number(objectIdParam);
  if (!Number.isInteger(objectId)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/cabinet");

  const [object] = await db
    .select()
    .from(objects)
    .where(eq(objects.id, objectId));
  if (!object || object.isDemo || object.userId !== session.user.id) {
    notFound();
  }

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
      .where(eq(stages.objectId, objectId))
      .orderBy(stages.number),
    db
      .select()
      .from(photos)
      .where(eq(photos.objectId, objectId))
      .orderBy(photos.takenAt),
    db.select().from(estimates).where(eq(estimates.objectId, objectId)),
    db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.objectId, objectId))
      .orderBy(checklistItems.sortOrder),
    db
      .select()
      .from(messages)
      .where(eq(messages.objectId, objectId))
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
        object={object}
        stages={objectStages}
        photos={objectPhotos}
        estimate={estimate ?? null}
        estimateChanges={changes}
        checklistItems={objectChecklist}
        messages={objectMessages}
        readOnly={false}
      />
    </main>
  );
}
