import type { ReactNode } from "react";
type Tone = "green" | "gray" | "amber" | "red" | "blue";
const tones: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  gray: "bg-gray-100 text-gray-700 ring-gray-500/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
};
export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
