export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify не может произвести "</script>" случайно, но экранируем
      // на всякий случай — script-теги не должны прерываться содержимым JSON-LD.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD — это ожидаемый паттерн Next.js для структурированных данных
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
