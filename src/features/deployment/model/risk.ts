export function asRisk(score: number): {
  label: "auto-apply" | "review" | "held";
  badge: "success" | "warning" | "error";
} {
  if (score < 30) return { label: "auto-apply", badge: "success" };
  if (score <= 70) return { label: "review", badge: "warning" };
  return { label: "held", badge: "error" };
}
