"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { FaUserPlus } from "react-icons/fa6";

type Props = {
  username: string;
  name: string;
  phone: string;
  email: string | null;
  style: CSSProperties;
};

/**
 * iPhone/desktop: links to the vCard, which Safari shows as a contact card with "Create New Contact".
 * Android: opens the Contacts app's "Create contact" screen directly, falling back to the vCard.
 */
export default function SaveContactButton({ username, name, phone, email, style }: Props) {
  const vcardPath = `/${username}/vcard`;
  const [href, setHref] = useState(vcardPath);

  useEffect(() => {
    if (!/Android/i.test(navigator.userAgent)) return;
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

  return (
    <a
      href={href}
      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
      style={{ ...style, borderRadius: "9999px" }}
    >
      <FaUserPlus aria-hidden size={16} />
      Save contact
    </a>
  );
}
