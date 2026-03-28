export function uid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function formatVolume(kg: number): string {
  if (kg >= 1000) return (kg / 1000).toFixed(1) + "t";
  return kg.toFixed(0) + "kg";
}

export function calcVolume(weightKg: number, reps: number, barbellWeight: number = 0): number {
  return (weightKg + barbellWeight) * reps;
}

export function getMonthKey(date: string): string {
  const d = new Date(date + "T00:00:00");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
