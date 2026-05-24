export function rupees(cents: number): string {
  return `₹${(cents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function discounted(cents: number, pct: number): number {
  return Math.round(cents * (1 - pct / 100));
}
