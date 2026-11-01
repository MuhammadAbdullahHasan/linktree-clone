"use client";

import { useEffect, useRef } from "react";

/** Counts a page view from the browser, so link previews and prefetches aren't counted. */
export default function ViewTracker({ username }: { username: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    // Shown inside another site (the onetap landing page has a live phone): not a visit, and
    // links open in a new tab, since Instagram, WhatsApp and most sites refuse to load in a frame.
    if (window.self !== window.top) {
      const base = document.createElement("base");
      base.target = "_blank";
      document.head.prepend(base);
      return;
    }
    const body = JSON.stringify({ username, referrer: document.referrer || null });
    if (!navigator.sendBeacon?.("/api/track/view", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track/view", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [username]);

  return null;
}
