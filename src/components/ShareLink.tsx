"use client";

import { useState } from "react";
import { FaArrowUpRightFromSquare, FaCheck, FaCopy } from "react-icons/fa6";
import { siteHost, siteUrl } from "@/lib/config";

export default function ShareLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl()}/${username}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the link is still visible to copy by hand.
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white py-1 pr-1 pl-3.5 text-sm">
      <span className="max-w-[46vw] truncate text-neutral-700 sm:max-w-none">
        {siteHost()}/<strong className="font-semibold text-neutral-900">{username}</strong>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
      >
        {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
      </button>
      <a
        href={`/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open your page"
        className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
      >
        <FaArrowUpRightFromSquare />
      </a>
    </div>
  );
}
