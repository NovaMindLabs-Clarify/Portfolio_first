export interface Stage {
  number: string;
  title: string;
  description: string;
  days: number;
  /** Слой чертежа, который открывается, когда этот этап становится активным */
  revealLayer: "plumbing" | "rough" | "finish" | "furniture" | null;
}

export const STAGES: Stage[] = [
  {
    number: "01",
    title: "Демонтаж и обмеры",
    description:
      "Снимаем размеры, вскрываем старую отделку, проверяем состояние стен и коммуникаций.",
    days: 5,
    revealLayer: null,
  },
  {
    number: "02",
    title: "Инженерия и сантехника",
    description:
      "Разводим электрику и трубы по новой схеме, меняем стояки, ставим счётчики.",
    days: 12,
    revealLayer: "plumbing",
  },
  {
    number: "03",
    title: "Черновые работы",
    description: "Стяжка пола, штукатурка стен, гидроизоляция мокрых зон.",
    days: 30,
    revealLayer: "rough",
  },
  {
    number: "04",
    title: "Чистовая отделка",
    description: "Плитка, обои, полы, двери, сантехника в сборе.",
    days: 35,
    revealLayer: "finish",
  },
  {
    number: "05",
    title: "Меблировка и приёмка",
    description:
      "Расставляем мебель, убираем строительную пыль, подписываем акт.",
    days: 12,
    revealLayer: "furniture",
  },
];

export const REVEAL_LAYER_TARGET_OPACITY: Record<
  NonNullable<Stage["revealLayer"]>,
  number
> = {
  plumbing: 1,
  rough: 0.35,
  finish: 0.35,
  furniture: 1,
};
