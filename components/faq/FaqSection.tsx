import { JsonLd } from "@/components/seo/JsonLd";
import { type FaqItem, faqPageJsonLd } from "@/lib/seo";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Насколько точный расчёт даёт калькулятор?",
    answer:
      "Калькулятор даёт вилку по укрупнённым показателям — площади, типу ремонта, санузлам, срочности. Точная смета фиксируется только после выезда на объект и замера.",
  },
  {
    question: "Что если смета изменится в процессе работ?",
    answer:
      "Любое изменение сметы попадает в личный кабинет с указанием причины и требует вашего согласования. Задним числом смета не меняется.",
  },
  {
    question: "Как отслеживать ход ремонта?",
    answer:
      "В личном кабинете виден прогресс по этапам, фотоотчёты с датами и чат с прорабом напрямую, без посредников.",
  },
  {
    question: "Можно посмотреть кабинет без реального объекта?",
    answer:
      "Да — /demo открывает демо-версию кабинета с примером объекта, без регистрации.",
  },
];

export function FaqSection() {
  return (
    <section
      aria-label="Частые вопросы"
      className="flex flex-col gap-8 px-6 py-16 sm:px-10"
    >
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS)} />
      <h2 className="font-display text-step-2 font-semibold">Частые вопросы</h2>
      <dl className="flex flex-col gap-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="border-t border-grid pt-6">
            <dt className="text-step-0 font-medium">{item.question}</dt>
            <dd className="mt-2 text-step-0 text-graphite/70">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
