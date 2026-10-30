"use client";

import { useRef, useState, type CSSProperties } from "react";
import { FaCheck, FaEnvelope, FaPhone, FaQrcode, FaShareNodes, FaXmark } from "react-icons/fa6";
import QRCode from "qrcode";
import { luminance } from "@/lib/themes";

type Props = {
  username: string;
  name: string;
  /** "+923001234567", or null when the page has no number. */
  phone: string | null;
  email: string | null;
  ink: string;
  paper: string;
};

/**
 * Floating dock of round buttons for the actions the profile card doesn't already offer:
 * Call, Email, QR code (so someone can scan the page off this screen) and Share.
 */
export default function ActionDock({ username, name, phone, email, ink, paper }: Props) {
  // The dock is always the dark element of the page, whichever way round the theme is.
  const [dark, light] = luminance(ink) <= luminance(paper) ? [ink, paper] : [paper, ink];
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const pageUrl = () => new URL(`/${username}`, location.href).href;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url: pageUrl() });
        return;
      }
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Share sheet dismissed, or clipboard blocked.
    }
  }

  async function showQr() {
    if (!qr) {
      setQr(await QRCode.toString(pageUrl(), { type: "svg", margin: 1, color: { dark: "#0d0d0f", light: "#ffffff" } }));
    }
    dialog.current?.showModal();
  }

  const items = [
    phone && { key: "call", label: "Call", href: `tel:${phone}`, icon: <FaPhone size={17} /> },
    email && { key: "email", label: "Email", href: `mailto:${email}`, icon: <FaEnvelope size={17} /> },
    { key: "qr", label: "Show QR code", onClick: showQr, icon: <FaQrcode size={18} /> },
    {
      key: "share",
      label: copied ? "Link copied" : "Share page",
      onClick: share,
      icon: copied ? <FaCheck size={17} /> : <FaShareNodes size={18} />,
    },
  ].filter(Boolean) as { key: string; label: string; href?: string; onClick?: () => void; icon: React.ReactNode }[];

  const disc =
    "grid h-[52px] w-[52px] place-items-center rounded-full transition-[background-color,transform] duration-200 active:scale-90";
  const highlight: CSSProperties = { background: light, color: dark, boxShadow: "0 4px 14px -4px rgb(0 0 0 / 0.5)" };
  const quiet: CSSProperties = {
    background: `color-mix(in oklab, ${light} 13%, transparent)`,
    boxShadow: `inset 0 1px 0 color-mix(in oklab, ${light} 18%, transparent)`,
  };

  return (
    <>
      <div className="pointer-events-none sticky bottom-0 z-30 flex justify-center px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <nav
          aria-label="More ways to connect"
          className="pf-dock pointer-events-auto flex items-center gap-2 rounded-full p-2 backdrop-blur-xl"
          style={
            {
              background: `color-mix(in oklab, ${dark} 92%, transparent)`,
              color: light,
              "--pf-focus": light,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${light} 18%, transparent), 0 22px 48px -12px rgb(0 0 0 / 0.6), 0 4px 10px rgb(0 0 0 / 0.18)`,
            } as CSSProperties
          }
        >
          {items.map((item, i) =>
            item.href ? (
              <a key={item.key} href={item.href} aria-label={item.label} className={disc} style={i === 0 ? highlight : quiet}>
                {item.icon}
              </a>
            ) : (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={disc}
                style={i === 0 ? highlight : quiet}
              >
                {item.icon}
              </button>
            ),
          )}
          <span aria-live="polite" className="sr-only">
            {copied ? "Link copied" : ""}
          </span>
        </nav>
      </div>

      <dialog
        ref={dialog}
        aria-label={`QR code for ${name}`}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="pf-qr m-auto w-[min(88vw,340px)] rounded-[30px] bg-white p-0 text-[#0d0d0f] shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm"
      >
        <div className="relative px-6 pt-7 pb-6 text-center">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full text-[#0d0d0f]/70 hover:bg-black/5"
          >
            <FaXmark size={18} />
          </button>
          <p className="text-[17px] font-semibold">{name}</p>
          <p className="mt-1 text-[13px] text-[#0d0d0f]/65">Scan to open this page</p>
          {qr && (
            <div
              aria-hidden
              className="mx-auto mt-5 w-full max-w-[240px] [&_svg]:h-auto [&_svg]:w-full"
              // Generated locally from this page's own URL.
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
