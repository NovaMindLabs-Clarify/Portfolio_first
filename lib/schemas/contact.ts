import { z } from "zod";

const PHONE_RE = /^\+?[78][\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const contactInputSchema = z.object({
  name: z
    .string({ error: "Укажите имя" })
    .trim()
    .min(2, "Имя должно быть не короче 2 символов")
    .max(100, "Слишком длинное имя"),
  phone: z
    .string({ error: "Укажите номер телефона" })
    .trim()
    .regex(PHONE_RE, "Не отправилось — проверьте номер телефона"),
  email: z
    .string()
    .trim()
    .email("Проверьте адрес почты")
    .optional()
    .or(z.literal("")),
  // Honeypot: скрытое от людей поле, должно всегда оставаться пустым.
  website: z.string().max(0, "Заявка отклонена").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
