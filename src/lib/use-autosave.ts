"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Saves `value` with `save` once it stops changing for `delay` ms. Unchanged values are never re-saved. */
export function useAutosave<T>(value: T, save: (value: T) => Promise<ActionResult>, delay = 700) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastSaved = useRef(JSON.stringify(value));
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    const json = JSON.stringify(value);
    if (json === lastSaved.current) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus("saving");
      const result = await saveRef.current(value);
      if (cancelled) return;
      if (result.ok) lastSaved.current = json;
      setStatus(result.ok ? "saved" : "error");
      setError(result.ok ? null : result.error);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { status, error };
}
