export function LoadingState({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-graphite/70"
    >
      <div className="flex gap-2" aria-hidden="true">
        <span
          className="kontur-loading-dot h-2 w-2 bg-graphite"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="kontur-loading-dot h-2 w-2 bg-graphite"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="kontur-loading-dot h-2 w-2 bg-graphite"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="font-mono text-step--1">{label}</p>
    </div>
  );
}
