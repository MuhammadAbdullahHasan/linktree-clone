"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaUserPlus } from "react-icons/fa6";
import QRCode from "qrcode";
import { useSaveContactHref } from "@/components/ContactActions";

type QuickProps = {
  username: string;
  name: string;
  phone: string | null;
  email: string | null;
};

/** Call, Email and Save contact as equal cards. Save contact is the same vCard link the card pills use. */
export function BusinessQuickActions({ username, name, phone, email }: QuickProps) {
  const saveHref = useSaveContactHref(username, name, phone, email);
  const items = [
    phone && { key: "call", label: "Call", href: `tel:${phone}`, Icon: FaPhone },
    email && { key: "email", label: "Email", href: `mailto:${email}`, Icon: FaEnvelope },
    { key: "save", label: "Save contact", href: saveHref, Icon: FaUserPlus },
  ].filter(Boolean) as { key: string; label: string; href: string; Icon: typeof FaPhone }[];

  return (
    <ul className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <a href={href} className="biz-quick">
            <Icon aria-hidden size={18} className="biz-icon" />
            <span>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** This page's QR code, generated in the browser from its own address, like the dock's QR dialog. */
export function BusinessQr({ username }: { username: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toString(new URL(`/${username}`, location.href).href, {
      type: "svg",
      margin: 1,
      color: { dark: "#0d0d0f", light: "#ffffff" },
    }).then(setSvg, () => setSvg(null));
  }, [username]);

  return (
    <span
      role="img"
      aria-label="QR code for this page"
      className="block h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[10px] bg-white p-1 [&_svg]:h-full [&_svg]:w-full"
      // Generated locally from this page's own URL.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
