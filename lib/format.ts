/**
 * Форматирование чисел/дат без Intl/toLocaleString.
 *
 * Так надёжнее: toLocaleString("ru-RU") на сервере зависит от того, собран ли
 * Node с полной ICU-базой (алгоритм no. Docker-образы на node:alpine обычно
 * идут со small-icu — там есть только en-US), а браузер клиента всегда с
 * полным ICU. Расхождение форматирования сервер/клиент — это hydration
 * mismatch (React error #418), именно так и сломался прод на Render. Ручное
 * форматирование даёт одинаковый результат везде.
 *
 * По той же причине даты форматируются через UTC-методы, а не локальные —
 * иначе сервер (обычно UTC) и браузер клиента (часовой пояс пользователя)
 * так же разъедутся в minutes/hours.
 */
export function formatRub(value: number): string {
  const rounded = Math.round(value).toString();
  return `${rounded.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
}

export function formatDateRu(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}.${m}.${y}`;
}

export function formatDateTimeRu(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${d}.${m} ${h}:${min}`;
}
