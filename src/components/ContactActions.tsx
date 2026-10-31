"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { FaEnvelope, FaUserPlus, FaWhatsapp } from "react-icons/fa6";
import { bestOn } from "@/lib/themes";

/**
 * Where "Save contact" should point. The vCard by default (iPhone shows it as a contact card);
 * on Android, the Contacts app's "Create contact" screen, with the vCard as fallback.
 */
export function useSaveContactHref(username: string, name: string, phone: string | null, email: string | null) {
  const vcardPath = `/${username}/vcard`;
  const [href, setHref] = useState(vcardPath);

  useEffect(() => {
    if (!phone || !/Android/i.test(navigator.userAgent)) return;
    const extras = [
      `S.name=${encodeURIComponent(name)}`,
      `S.phone=${encodeURIComponent(phone)}`,
      "i.phone_type=2", // mobile
      email && `S.email=${encodeURIComponent(email)}`,
      `S.browser_fallback_url=${encodeURIComponent(new URL(vcardPath, location.href).href)}`,
    ].filter(Boolean);
    setHref(
      `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/raw_contact;${extras.join(";")};end`,
    );
  }, [vcardPath, name, phone, email]);

  return href;
}

type PillsProps = {
  username: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  /** Text colour on the profile card; the pills are outlined in it. */
  ink: string;
  /** The card's solid colour, for picking readable text on filled pills. */
  surface: string;
  accent: string;
  variant: "outline" | "filled" | "soft";
  /** The owner's corner roundness; pills stay fully round above 20px. */
  radius: number;
};

/** The two outline pills on the profile card: Save contact, and a way to message. */
export function ContactPills({ username, name, phone, email, whatsapp, ink, surface, accent, variant, radius }: PillsProps) {
  const saveHref = useSaveContactHref(username, name, phone, email);
  const message = whatsapp
    ? { href: whatsapp, label: "WhatsApp", Icon: FaWhatsapp, external: true }
    : email
      ? { href: `mailto:${email}`, label: "Email", Icon: FaEnvelope, external: false }
      : null;
  if (!phone && !message) return null;

  const pill =
    "flex h-12 min-w-0 items-center justify-center gap-2 rounded-full px-3 text-[13px] font-medium whitespace-nowrap @min-[300px]:px-4 @min-[300px]:text-sm transition-[background-color,transform] duration-200 hover:bg-[color-mix(in_oklab,currentColor_10%,transparent)] active:scale-[0.97]";
  const looks: Record<PillsProps["variant"], CSSProperties> = {
    outline: { boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${ink} 55%, transparent)` },
    filled: { background: accent, color: bestOn(accent, [surface, ink, "#ffffff", "#0d0d0f"]) },
    soft: { background: `color-mix(in oklab, ${ink} 12%, transparent)` },
  };
  const style: CSSProperties = { ...looks[variant], borderRadius: radius >= 20 ? 9999 : radius };

  return (
    // Icons drop out in narrow frames (the dashboard preview) so both labels still fit.
    <div className={`@container mt-5 grid gap-2.5 ${phone && message ? "grid-cols-2" : "grid-cols-1"}`}>
      {phone && (
        <a href={saveHref} className={pill} style={style}>
          <FaUserPlus aria-hidden size={15} className="hidden @min-[300px]:block" />
          Save contact
        </a>
      )}
      {message && (
        <a
          href={message.href}
          target={message.external ? "_blank" : undefined}
          rel={message.external ? "noopener noreferrer" : undefined}
          className={pill}
          style={style}
        >
          <message.Icon aria-hidden size={16} className="hidden @min-[300px]:block" />
          {message.label}
        </a>
      )}
    </div>
  );
}
