import { toWhatsAppNumber } from "@/lib/socials";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Turns user input into a safe link URL, or returns null.
 * "example.com" becomes "https://example.com", a phone number a tel: link and an email address
 * a mailto: link; javascript:, data: etc. are rejected.
 */
export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value || value.length > 2048) return null;

  if (/^\+?[\d\s()-]+$/.test(value)) {
    const digits = toWhatsAppNumber(value);
    return digits ? `tel:+${digits}` : null;
  }
  if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(value)) return `mailto:${value}`;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    if ((url.protocol === "http:" || url.protocol === "https:") && !url.hostname.includes(".")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
