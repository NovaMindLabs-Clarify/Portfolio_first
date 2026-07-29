import { z } from "zod";

/**
 * Одна схема для клиента (react-hook-form резолвер) и сервера (Server Action) —
 * см. CLAUDE.md, "Правила кода".
 */
export const estimateInputSchema = z.object({
  area: z
    .number({ error: "Площадь должна быть числом" })
    .min(20, "Площадь не может быть меньше 20 м²")
    .max(300, "Площадь не может быть больше 300 м²"),

  repairType: z.enum(["cosmetic", "capital", "designer"], {
    error: "Выберите тип ремонта",
  }),

  bathrooms: z
    .number({ error: "Укажите количество санузлов" })
    .int("Количество санузлов должно быть целым числом")
    .min(1, "Должен быть хотя бы один санузел")
    .max(5, "Укажите не больше 5 санузлов"),

  urgency: z.enum(["normal", "accelerated", "urgent"], {
    error: "Выберите срочность",
  }),

  layoutChange: z.enum(["none", "partitions", "wetZones"], {
    error: "Выберите вариант перепланировки",
  }),

  materialsClass: z.enum(["economy", "standard", "premium"], {
    error: "Выберите класс материалов",
  }),
});

export type EstimateInput = z.infer<typeof estimateInputSchema>;
