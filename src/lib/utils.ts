import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely encode a URL for use in CSS `url()` to prevent injection.
 */
export function safeCssUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const encoded = url.replace(/([()'"\\])/g, "\\$1");
  return `url("${encoded}") center/cover`;
}
