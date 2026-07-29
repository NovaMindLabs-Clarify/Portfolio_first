import type { Metadata } from "next";
import { BlueprintPlayground } from "./BlueprintPlayground";

export const metadata: Metadata = {
  title: "Blueprint playground — dev",
  robots: { index: false, follow: false },
};

export default function BlueprintDevPage() {
  return <BlueprintPlayground />;
}
