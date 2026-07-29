import {
  type EstimateInput,
  estimateInputSchema,
} from "@/lib/schemas/estimate";

const PARAM = "c";

export function encodeEstimateState(input: EstimateInput): string {
  return btoa(encodeURIComponent(JSON.stringify(input)));
}

export function decodeEstimateState(raw: string): EstimateInput | null {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(atob(raw)));
    const result = estimateInputSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function readEstimateStateFromLocation(): EstimateInput | null {
  const raw = new URLSearchParams(window.location.search).get(PARAM);
  return raw ? decodeEstimateState(raw) : null;
}

export function writeEstimateStateToLocation(input: EstimateInput): void {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, encodeEstimateState(input));
  window.history.replaceState(null, "", url);
}
