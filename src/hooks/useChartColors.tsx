"use client";
import { useCallback } from "react";

/** Resolves CSS custom properties to actual color strings for Chart.js */
export function useChartColors() {
  const get = useCallback(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (prop: string) => cs.getPropertyValue(prop).trim();
    return {
      text: v("--text"),
      text2: v("--text2"),
      muted: v("--muted"),
      surface: v("--surface"),
      surface2: v("--surface2"),
      border: v("--border"),
      ac: v("--ac"),
      green: v("--green") || "#10b981",
    };
  }, []);

  return get;
}
