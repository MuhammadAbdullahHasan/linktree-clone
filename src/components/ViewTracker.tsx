"use client";

import { useEffect, useRef } from "react";

/** Counts a page view from the browser, so link previews and prefetches aren't counted. */
export default function ViewTracker({ username }: { username: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const body = JSON.stringify({ username, referrer: document.referrer || null });
    if (!navigator.sendBeacon?.("/api/track/view", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track/view", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [username]);

  return null;
}
