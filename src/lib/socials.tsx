import type { IconType } from "react-icons";
import {
  FaDiscord, FaEnvelope, FaFacebook, FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaPhone, FaPinterest,
  FaSnapchat, FaSpotify, FaTelegram, FaThreads, FaTiktok, FaTwitch, FaWhatsapp, FaXTwitter, FaYoutube,
} from "react-icons/fa6";

export type SocialPlatform = {
  id: string;
  label: string;
  icon: IconType;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram", label: "Instagram", icon: FaInstagram, placeholder: "instagram.com/yourname" },
  { id: "tiktok", label: "TikTok", icon: FaTiktok, placeholder: "tiktok.com/@yourname" },
  { id: "youtube", label: "YouTube", icon: FaYoutube, placeholder: "youtube.com/@yourchannel" },
  { id: "x", label: "X", icon: FaXTwitter, placeholder: "x.com/yourname" },
  { id: "facebook", label: "Facebook", icon: FaFacebook, placeholder: "facebook.com/yourpage" },
  { id: "linkedin", label: "LinkedIn", icon: FaLinkedin, placeholder: "linkedin.com/in/yourname" },
  { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, placeholder: "+92 300 1234567" },
  { id: "telegram", label: "Telegram", icon: FaTelegram, placeholder: "t.me/yourname" },
  { id: "threads", label: "Threads", icon: FaThreads, placeholder: "threads.net/@yourname" },
  { id: "snapchat", label: "Snapchat", icon: FaSnapchat, placeholder: "snapchat.com/add/yourname" },
  { id: "pinterest", label: "Pinterest", icon: FaPinterest, placeholder: "pinterest.com/yourname" },
  { id: "spotify", label: "Spotify", icon: FaSpotify, placeholder: "open.spotify.com/artist/..." },
  { id: "github", label: "GitHub", icon: FaGithub, placeholder: "github.com/yourname" },
  { id: "discord", label: "Discord", icon: FaDiscord, placeholder: "discord.gg/invite" },
  { id: "twitch", label: "Twitch", icon: FaTwitch, placeholder: "twitch.tv/yourname" },
  { id: "email", label: "Email", icon: FaEnvelope, placeholder: "you@example.com" },
  { id: "website", label: "Website", icon: FaGlobe, placeholder: "yourwebsite.com" },
];

export const SOCIALS_BY_ID = new Map(SOCIAL_PLATFORMS.map((p) => [p.id, p]));

/** The icon for a link button to a tel: number. Not offered as a social icon. */
const PHONE_LINK: SocialPlatform = { id: "phone", label: "Phone", icon: FaPhone, placeholder: "+92 300 1234567" };

// Numbers typed in local format (leading 0, e.g. 0300 1234567) get this country code.
const DEFAULT_COUNTRY_CODE = "92";

/**
 * Turns a phone number in any common format (+92 300 1234567, 0300 1234567, 0092...)
 * into the digits-only international form wa.me needs, or null if it can't be valid.
 */
export function toWhatsAppNumber(raw: string): string | null {
  const value = raw.trim();
  let digits = value.replace(/\D/g, "");
  if (!value.startsWith("+")) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

const WHATSAPP_LINK = /^(?:https?:\/\/)?(?:www\.)?wa\.me\/(\+?[\d\s()-]+)\/?$/i;
const PHONE = /^\+?[\d\s()-]+$/;

/**
 * Lets people type an email address or phone number instead of a full URL.
 * Returns null when a WhatsApp number can't be turned into a working link.
 */
export function socialInputToUrl(platform: string, input: string): string | null {
  const value = input.trim();
  if (platform === "email" && !value.startsWith("mailto:") && value.includes("@")) {
    return `mailto:${value}`;
  }
  if (platform === "whatsapp") {
    const number = value.match(WHATSAPP_LINK)?.[1] ?? (PHONE.test(value) ? value : null);
    if (number !== null) {
      const digits = toWhatsAppNumber(number);
      return digits ? `https://wa.me/${digits}` : null;
    }
  }
  return value;
}

/**
 * The WhatsApp number (+digits): from the page's WhatsApp icon, or else from a link button that
 * points to wa.me.
 */
export function whatsappPhone(
  socials: { platform: string; url: string }[],
  links: { url: string }[] = [],
): string | null {
  const urls = [...socials.filter((s) => s.platform === "whatsapp"), ...links].map((x) => x.url);
  for (const url of urls) {
    const digits = url.match(/^https?:\/\/(?:www\.)?wa\.me\/\+?(\d+)/i)?.[1];
    const number = digits ? toWhatsAppNumber(digits) : null;
    if (number) return `+${number}`;
  }
  return null;
}

/** The +digits of a tel: link, or null. */
export function telPhone(url: string): string | null {
  const number = url.startsWith("tel:") ? toWhatsAppNumber(decodeURIComponent(url.slice(4))) : null;
  return number ? `+${number}` : null;
}

/**
 * The phone number (+digits) for "Save contact" and Call: the WhatsApp number, or else the first
 * link button that points to a tel: number.
 */
export function contactPhone(
  socials: { platform: string; url: string }[],
  links: { url: string }[] = [],
): string | null {
  return whatsappPhone(socials, links) ?? links.map((l) => telPhone(l.url)).find(Boolean) ?? null;
}

/** The email address from a page's Email icon, if any. */
export function contactEmail(socials: { platform: string; url: string }[]): string | null {
  const url = socials.find((s) => s.platform === "email")?.url ?? "";
  return url.startsWith("mailto:") ? decodeURIComponent(url.slice(7).split("?")[0]) : null;
}

/** A domain to show under a link's title ("instagram.com"), or the link type for mail and phone links. */
/** "+923001234567" as "+92 300 1234567", "+34622344639" as "+34 622 344 639". */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const pk = digits.match(/^92(3\d{2})(\d{7})$/);
  if (pk) return `+92 ${pk[1]} ${pk[2]}`;
  const cc = digits.match(/^(1|7|[2-9]\d)(\d+)$/);
  if (!cc) return `+${digits}`;
  const rest = cc[2];
  const grouped =
    rest.length === 9 ? rest.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")
    : rest.length === 10 ? rest.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
    : rest;
  return `+${cc[1]} ${grouped}`;
}

/** Every distinct phone number on a page, the contactPhone() one first. */
export function allPhones(socials: { platform: string; url: string }[], links: { url: string }[] = []): string[] {
  const first = contactPhone(socials, links);
  const tels = links.map((l) => telPhone(l.url)).filter((n): n is string => !!n);
  return [...new Set([...(first ? [first] : []), ...tels])];
}

export function linkCaption(url: string): string {
  if (url.startsWith("mailto:")) return decodeURIComponent(url.slice(7).split("?")[0]) || "Email";
  if (url.startsWith("tel:")) {
    const phone = telPhone(url);
    return phone ? formatPhone(phone) : "Call";
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const HOST_PLATFORMS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "whatsapp"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)(x\.com|twitter\.com)$/, "x"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)(t\.me|telegram\.me)$/, "telegram"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)pinterest\.com$/, "pinterest"],
  [/(^|\.)spotify\.com$/, "spotify"],
  [/(^|\.)github\.com$/, "github"],
  [/(^|\.)(discord\.gg|discord\.com)$/, "discord"],
  [/(^|\.)twitch\.tv$/, "twitch"],
];

/** The platform a link points to (for its tile icon); "website" when it's none of the known ones. */
export function platformForUrl(url: string): SocialPlatform {
  if (url.startsWith("mailto:")) return SOCIALS_BY_ID.get("email")!;
  if (url.startsWith("tel:")) return PHONE_LINK;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const match = HOST_PLATFORMS.find(([pattern]) => pattern.test(host));
    if (match) return SOCIALS_BY_ID.get(match[1])!;
  } catch {
    // Not a parseable URL; fall through to the generic icon.
  }
  return SOCIALS_BY_ID.get("website")!;
}
