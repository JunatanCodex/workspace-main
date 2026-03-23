"use client";

import { useEffect, useState } from "react";

function readEnabled() {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("openclaw-refresh-enabled");
  return saved ? JSON.parse(saved) : true;
}

function readInterval() {
  if (typeof window === "undefined") return 10000;
  const saved = localStorage.getItem("openclaw-refresh-interval");
  return saved ? Number(saved) : 10000;
}

export function useLiveJson<T>(url: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [updatedAt, setUpdatedAt] = useState<string>(new Date().toISOString());
  const [enabled, setEnabled] = useState<boolean>(readEnabled);
  const [intervalMs, setIntervalMs] = useState<number>(readInterval);

  useEffect(() => {
    const onStorage = () => {
      setEnabled(readEnabled());
      setIntervalMs(readInterval());
    };
    const onRefresh = () => onStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener("openclaw:refresh-settings", onRefresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("openclaw:refresh-settings", onRefresh);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return;
        const json = await response.json();
        if (cancelled) return;
        setData(json);
        setUpdatedAt(json.updatedAt || new Date().toISOString());
        window.dispatchEvent(new CustomEvent("openclaw:refresh"));
      } catch {
        // best effort polling; keep last good state
      }
    }

    fetchData();
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      fetchData();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [url, enabled, intervalMs]);

  return { data, updatedAt, enabled, intervalMs };
}
