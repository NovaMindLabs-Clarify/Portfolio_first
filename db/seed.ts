import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import {
  checklistItems,
  estimateChanges,
  estimates,
  messages,
  objects,
  photos,
  stages,
} from "./schema";

// Отдельное подключение, не через db/client.ts — тот помечен "server-only" и
// рассчитан на выполнение исключительно внутри бандла Next.js, а этот скрипт
// запускается напрямую через tsx.
process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const db = drizzle(postgres(process.env.DATABASE_URL), { schema });

const STAGE_SEED = [
  {
    number: 1,
    title: "Демонтаж и обмеры",
    description:
      "Снимаем размеры, вскрываем старую отделку, проверяем состояние стен и коммуникаций.",
    plannedDays: 5,
    status: "done" as const,
    completedAt: new Date("2026-06-03"),
  },
  {
    number: 2,
    title: "Инженерия и сантехника",
    description:
      "Разводим электрику и трубы по новой схеме, меняем стояки, ставим счётчики.",
    plannedDays: 12,
    status: "done" as const,
    completedAt: new Date("2026-06-15"),
  },
  {
    number: 3,
    title: "Черновые работы",
    description: "Стяжка пола, штукатурка стен, гидроизоляция мокрых зон.",
    plannedDays: 30,
    status: "done" as const,
    completedAt: new Date("2026-07-15"),
  },
  {
    number: 4,
    title: "Чистовая отделка",
    description: "Плитка, обои, полы, двери, сантехника в сборе.",
    plannedDays: 35,
    status: "in_progress" as const,
    completedAt: null,
  },
  {
    number: 5,
    title: "Меблировка и приёмка",
    description:
      "Расставляем мебель, убираем строительную пыль, подписываем акт.",
    plannedDays: 12,
    status: "planned" as const,
    completedAt: null,
  },
];

const CHECKLIST_SEED = [
  { label: "Черновая стяжка пола без трещин", checked: true },
  { label: "Электрика: все розетки промаркированы", checked: true },
  { label: "Сантехника: нет протечек под мойкой", checked: true },
  { label: "Двери открываются без перекоса", checked: false },
  { label: "Полы поклеены без зазоров", checked: false },
  { label: "Приняты финальные фотоотчёты по всем комнатам", checked: false },
];

const MESSAGE_SEED = [
  {
    authorRole: "foreman" as const,
    authorName: "Дмитрий, прораб",
    body: "Демонтаж закончили, обмеры сошлись с проектом. Завтра заходим на инженерку.",
    createdAt: new Date("2026-06-03T10:00:00"),
  },
  {
    authorRole: "client" as const,
    authorName: "Иван Петров",
    body: "Отлично, спасибо! А стояки точно успеем поменять до отпуска?",
    createdAt: new Date("2026-06-03T18:20:00"),
  },
  {
    authorRole: "foreman" as const,
    authorName: "Дмитрий, прораб",
    body: "Да, укладываемся. Заодно нашли старую проводку в стене у кухни — придётся заменить участок, отразили в смете.",
    createdAt: new Date("2026-06-10T09:15:00"),
  },
  {
    authorRole: "foreman" as const,
    authorName: "Дмитрий, прораб",
    body: "Черновые работы завершены, фото по всем комнатам в ленте. Начинаем чистовую отделку.",
    createdAt: new Date("2026-07-15T16:40:00"),
  },
  {
    authorRole: "client" as const,
    authorName: "Иван Петров",
    body: "Видел фото, выглядит аккуратно. Можно добавить ещё одну розетку в прихожей?",
    createdAt: new Date("2026-07-16T08:05:00"),
  },
  {
    authorRole: "foreman" as const,
    authorName: "Дмитрий, прораб",
    body: "Без проблем, добавили точку освещения и розетку, тоже отразили в смете с пояснением.",
    createdAt: new Date("2026-07-16T11:30:00"),
  },
];

function photoUrl(seed: number): string {
  return `https://picsum.photos/seed/kontur-demo-${seed}/640/480`;
}

async function seed() {
  console.log("Сидирую демо-объект…");

  // Идемпотентность: перезапуск скрипта не плодит дубли демо-объекта.
  await db.delete(objects).where(eq(objects.isDemo, true));

  const [demoObject] = await db
    .insert(objects)
    .values({
      userId: null,
      title: "Двухкомнатная квартира, ЖК «Северный»",
      address: "г. Санкт-Петербург, ул. Ленина, 12",
      area: 68,
      isDemo: true,
    })
    .returning();

  const insertedStages = await db
    .insert(stages)
    .values(
      STAGE_SEED.map((s) => ({
        objectId: demoObject.id,
        number: s.number,
        title: s.title,
        description: s.description,
        status: s.status,
        plannedDays: s.plannedDays,
        completedAt: s.completedAt,
      })),
    )
    .returning();

  // 24 фото, распределённые по завершённым и текущему этапам.
  const photoDistribution = [
    { stageIndex: 0, count: 5, startDate: new Date("2026-05-30") },
    { stageIndex: 1, count: 6, startDate: new Date("2026-06-05") },
    { stageIndex: 2, count: 8, startDate: new Date("2026-06-18") },
    { stageIndex: 3, count: 5, startDate: new Date("2026-07-18") },
  ];

  let photoSeedCounter = 1;
  const photoRows: (typeof photos.$inferInsert)[] = [];
  for (const group of photoDistribution) {
    const stage = insertedStages[group.stageIndex];
    for (let i = 0; i < group.count; i++) {
      const takenAt = new Date(group.startDate);
      takenAt.setDate(takenAt.getDate() + i * 2);
      photoRows.push({
        objectId: demoObject.id,
        stageId: stage.id,
        url: photoUrl(photoSeedCounter),
        caption: `${stage.title} — фото ${i + 1}`,
        takenAt,
      });
      photoSeedCounter++;
    }
  }
  await db.insert(photos).values(photoRows);

  const [estimate] = await db
    .insert(estimates)
    .values({ objectId: demoObject.id, amount: 950_000 })
    .returning();

  await db.insert(estimateChanges).values([
    {
      estimateId: estimate.id,
      delta: 45_000,
      reason:
        "Обнаружена ветхая проводка в стене у кухни при демонтаже — потребовалась замена участка.",
      approvedBy: "Иван Петров",
      createdAt: new Date("2026-06-10"),
    },
    {
      estimateId: estimate.id,
      delta: 32_000,
      reason:
        "По просьбе клиента добавлены розетка и точка освещения в прихожей.",
      approvedBy: "Иван Петров",
      createdAt: new Date("2026-07-16"),
    },
  ]);

  await db
    .update(estimates)
    .set({ amount: 950_000 + 45_000 + 32_000 })
    .where(eq(estimates.id, estimate.id));

  await db.insert(checklistItems).values(
    CHECKLIST_SEED.map((item, i) => ({
      objectId: demoObject.id,
      label: item.label,
      checked: item.checked,
      sortOrder: i,
    })),
  );

  await db.insert(messages).values(
    MESSAGE_SEED.map((m) => ({
      objectId: demoObject.id,
      authorRole: m.authorRole,
      authorName: m.authorName,
      body: m.body,
      createdAt: m.createdAt,
    })),
  );

  console.log(
    `Готово. Демо-объект id=${demoObject.id}, фото: ${photoRows.length}`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Ошибка сидирования", error);
    process.exit(1);
  });
