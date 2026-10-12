import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Today's date as YYYY-MM-DD (UTC), used as a day key for streaks and reminders. */
export const todayKey = () => new Date().toISOString().split("T")[0];

export const formatShortDate = (date: Date | number | string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Readable message from Supabase/Postgres errors (including messages raised by our SQL functions). */
export const errorMessage = (err: unknown) =>
  (err as { message?: string } | null)?.message || "Something went wrong. Please try again.";

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";
