/**
 * Число комнат для превью чертежа — не часть формулы сметы (см. lib/estimate.ts),
 * чисто визуальная эвристика: чем больше площадь, тем больше комнат на плане.
 */
export function estimateRoomsFromArea(area: number): number {
  return Math.min(5, Math.max(1, Math.round(1 + area / 35)));
}
