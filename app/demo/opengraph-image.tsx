import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import { db } from "@/db/client";
import { estimates, objects, stages } from "@/db/schema";
import { formatRub } from "@/lib/format";

// Читает из БД — без этого Next пытается сгенерировать картинку статически
// при сборке, когда БД ещё недоступна (ровно как и сама /demo/page.tsx).
export const dynamic = "force-dynamic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [demoObject] = await db
    .select()
    .from(objects)
    .where(eq(objects.isDemo, true))
    .limit(1);

  const [objectStages, [estimate]] = await Promise.all([
    demoObject
      ? db.select().from(stages).where(eq(stages.objectId, demoObject.id))
      : Promise.resolve([]),
    demoObject
      ? db.select().from(estimates).where(eq(estimates.objectId, demoObject.id))
      : Promise.resolve([]),
  ]);

  const doneCount = objectStages.filter((s) => s.status === "done").length;

  return new ImageResponse(
    // biome-ignore lint/a11y/useAltText: содержимое ImageResponse — не HTML-документ, alt тут неприменим
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: "#F1F2EF",
        color: "#1B2430",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, display: "flex" }}>
        КОНТУР — демо кабинета
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 56, fontWeight: 700, display: "flex" }}>
          {demoObject?.title ?? "Объект"}
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 32 }}>
          <div style={{ display: "flex" }}>{demoObject?.area ?? "—"} м²</div>
          <div style={{ display: "flex" }}>
            {doneCount}/{objectStages.length || 5} этапов
          </div>
          <div style={{ display: "flex" }}>
            {estimate ? formatRub(estimate.amount) : "—"}
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
