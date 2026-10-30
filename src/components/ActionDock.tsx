"use client";

import { useState, type CSSProperties } from "react";
import { FaCheck, FaPhone, FaShareNodes, FaUserPlus, FaWhatsapp } from "react-icons/fa6";
import { useSaveContactHref } from "@/components/ContactActions";
import { luminance } from "@/lib/themes";

type Props = {
  username: string;
  name: string;
  /** "+923001234567", or null when the page has no number. */
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  ink: string;
  paper: string;
};

/** Floating dock of round buttons: Save contact (highlighted), WhatsApp, Call and Share. */
export default function ActionDock({ username, name, phone, email, whatsapp, ink, paper }: Props) {
  // The dock is always the dark element of the page, whichever way round the theme is.
  const [dark, light] = luminance(ink) <= luminance(paper) ? [ink, paper] : [paper, ink];
  const saveHref = useSaveContactHref(username, name, phone, email);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(`/${username}`, location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Share sheet dismissed, or clipboard blocked.
    }
  }

  const disc =
    "grid h-[52px] w-[52px] place-items-center rounded-full transition-[background-color,transform] duration-200 active:scale-90";
  const quiet: CSSProperties = {
    background: `color-mix(in oklab, ${light} 13%, transparent)`,
    boxShadow: `inset 0 1px 0 color-mix(in oklab, ${light} 18%, transparent)`,
  };

  return (
    <div className="pointer-events-none sticky bottom-0 z-30 flex justify-center px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Contact"
        className="pf-dock pointer-events-auto flex items-center gap-2 rounded-full p-2 backdrop-blur-xl"
        style={
          {
            background: `color-mix(in oklab, ${dark} 92%, transparent)`,
            color: light,
            "--pf-focus": light,
            // Hairline in the light colour so the dock separates from dark tiles behind it.
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${light} 18%, transparent), 0 22px 48px -12px rgb(0 0 0 / 0.6), 0 4px 10px rgb(0 0 0 / 0.18)`,
          } as CSSProperties
        }
      >
        {phone && (
          <a
            href={saveHref}
            aria-label="Save contact"
            className={disc}
            style={{ background: light, color: dark, boxShadow: "0 4px 14px -4px rgb(0 0 0 / 0.5)" }}
          >
            <FaUserPlus size={19} />
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={disc} style={quiet}>
            <FaWhatsapp size={21} />
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} aria-label="Call" className={disc} style={quiet}>
            <FaPhone size={17} />
          </a>
        )}
        <button
          type="button"
          onClick={share}
          aria-label={copied ? "Link copied" : "Share page"}
          className={disc}
          style={phone ? quiet : { background: light, color: dark }}
        >
          {copied ? <FaCheck size={17} /> : <FaShareNodes size={18} />}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Link copied" : ""}
        </span>
      </nav>
    </div>
  );
}
