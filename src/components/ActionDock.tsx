"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaPhone, FaShareNodes, FaUserPlus, FaWhatsapp } from "react-icons/fa6";

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

/**
 * Floating contact dock: Save contact, WhatsApp, Call and Share.
 * Save contact links to the vCard (iPhone shows it as a contact card); on Android it opens the
 * Contacts app's "Create contact" screen instead, with the vCard as fallback.
 */
export default function ActionDock({ username, name, phone, email, whatsapp, ink, paper }: Props) {
  const vcardPath = `/${username}/vcard`;
  const [saveHref, setSaveHref] = useState(vcardPath);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!phone || !/Android/i.test(navigator.userAgent)) return;
    const extras = [
      `S.name=${encodeURIComponent(name)}`,
      `S.phone=${encodeURIComponent(phone)}`,
      "i.phone_type=2", // mobile
      email && `S.email=${encodeURIComponent(email)}`,
      `S.browser_fallback_url=${encodeURIComponent(new URL(vcardPath, location.href).href)}`,
    ].filter(Boolean);
    setSaveHref(
      `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/raw_contact;${extras.join(";")};end`,
    );
  }, [vcardPath, name, phone, email]);

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
    "grid h-12 w-12 place-items-center rounded-full transition-[background-color,transform] duration-200 hover:bg-[color-mix(in_oklab,var(--pf-bg)_14%,transparent)] active:scale-90";

  return (
    <div className="pointer-events-none sticky bottom-0 z-30 flex justify-center px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Contact"
        className="pf-dock pointer-events-auto flex items-center gap-1 rounded-full p-1.5 backdrop-blur-xl"
        style={{
          background: `color-mix(in oklab, ${ink} 90%, transparent)`,
          color: paper,
          // Hairline in the page colour so the dock separates from same-coloured tiles behind it.
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${paper} 22%, transparent), 0 22px 48px -12px rgb(0 0 0 / 0.6), 0 4px 10px rgb(0 0 0 / 0.18)`,
        }}
      >
        {phone && (
          <a
            href={saveHref}
            className="flex h-12 items-center gap-2 rounded-full pr-5 pl-4 text-sm font-semibold transition-transform duration-200 active:scale-95"
            style={{ background: paper, color: ink }}
          >
            <FaUserPlus aria-hidden size={16} />
            Save contact
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={disc}>
            <FaWhatsapp size={20} />
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} aria-label="Call" className={disc}>
            <FaPhone size={16} />
          </a>
        )}
        <button type="button" onClick={share} aria-label={copied ? "Link copied" : "Share page"} className={disc}>
          {copied ? <FaCheck size={16} /> : <FaShareNodes size={17} />}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Link copied" : ""}
        </span>
      </nav>
    </div>
  );
}
