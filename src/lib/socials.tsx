import type { IconType } from "react-icons";
import {
  FaDiscord, FaEnvelope, FaFacebook, FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaPinterest,
  FaSnapchat, FaSpotify, FaTelegram, FaThreads, FaTiktok, FaTwitch, FaWhatsapp, FaXTwitter, FaYoutube,
} from "react-icons/fa6";

export type SocialPlatform = {
  id: string;
  label: string;
  icon: IconType;
  placeholder: string;
};

// Keep ids in sync with the social_links.platform check in the migration.
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

/** Lets people type an email address or phone number instead of a full URL. */
export function socialInputToUrl(platform: string, input: string): string {
  const value = input.trim();
  if (platform === "email" && !value.startsWith("mailto:") && value.includes("@")) {
    return `mailto:${value}`;
  }
  if (platform === "whatsapp" && /^\+?[\d\s()-]{7,}$/.test(value)) {
    return `https://wa.me/${value.replace(/\D/g, "")}`;
  }
  return value;
}
