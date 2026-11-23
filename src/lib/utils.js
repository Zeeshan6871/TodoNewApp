import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind classes with twMerge.
 * Standard shadcn helper.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

