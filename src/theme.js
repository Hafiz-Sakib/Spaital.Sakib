import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

/* Day / night theme.
   - The <html> element carries the "dark" class; Tailwind's `dark:` variants and the CSS variables in index.css follow it.
   - Visitors always start in day mode. Only an explicit choice (saved in localStorage) switches the site to night.
   - A tiny inline script in index.html applies the saved choice before the first paint, so there is no flash. */

const KEY = "theme";
const root = typeof document !== "undefined" ? document.documentElement : null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const isDark = () => !!root && root.classList.contains("dark");

/* Day/night switch length (ms) and easing: slow, soft start and a long, gentle settle */
export const SWITCH_MS = 1300;
const SWITCH_EASE = "cubic-bezier(.5,.05,.25,1)";

const PAGE_BG = { light: "#F3F4F7", dark: "#0E0F1A" };

function paint(dark) {
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? PAGE_BG.dark : PAGE_BG.light);
  try {
    localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    /* storage blocked: the choice just won't persist */
  }
  emit();
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export const onThemeChange = subscribe;

/** const dark = useDark(); re-renders whenever the theme flips. */
export const useDark = () =>
  useSyncExternalStore(subscribe, isDark, () => false);

/**
 * Flip the theme. On browsers with the View Transitions API the new theme grows out of `origin`
 * (the toggle button) (the toggle button): going to night the circle grows out of the button, going to day it shrinks back into it.
 * Elsewhere the colours cross-fade.
 */
export function toggleTheme(origin) {
  const next = !isDark();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    paint(next);
    return;
  }

  if (typeof document.startViewTransition === "function" && origin) {
    const r = origin.getBoundingClientRect();
    const x = r.left + r.width / 2,
      y = r.top + r.height / 2;
    const reach = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    const st = root.style;
    st.setProperty("--vt-x", `${x}px`); st.setProperty("--vt-y", `${y}px`);
    st.setProperty("--vt-reach", `${reach}px`); st.setProperty("--vt-ms", `${SWITCH_MS}ms`); st.setProperty("--vt-ease", SWITCH_EASE);
    root.dataset.themeSwitch = next ? "to-dark" : "to-light";
    const vt = document.startViewTransition(() => { flushSync(() => paint(next)); });
    // Both directions are pure CSS animations on the old snapshot (see index.css) - nothing is left behind on <html> after they finish,
    // so a later switch can never pick up a stale animation from an earlier one.
    vt.ready.catch((e) => console.warn("[theme] view transition skipped:", e));
    vt.finished.finally(() => {
      delete root.dataset.themeSwitch;
      ["--vt-x", "--vt-y", "--vt-reach", "--vt-ms", "--vt-ease"].forEach((k) => st.removeProperty(k));
    });
    return;
  }

  // Fallback: colours ease over ~1s
  root.classList.add("theme-fade");
  paint(next);
  setTimeout(() => root.classList.remove("theme-fade"), 1100);
}
