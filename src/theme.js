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

const PAGE_BG = { light: "#F3F4F7", dark: "#0E0F1A" };

function paint(dark) {
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? PAGE_BG.dark : PAGE_BG.light);
  try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* storage blocked: the choice just won't persist */ }
  emit();
}

const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
export const onThemeChange = subscribe;

/** const dark = useDark(); re-renders whenever the theme flips. */
export const useDark = () => useSyncExternalStore(subscribe, isDark, () => false);

/**
 * Flip the theme. On browsers with the View Transitions API the new theme grows out of `origin`
 * (the toggle button) as an expanding circle; elsewhere the colours cross-fade.
 */
export function toggleTheme(origin) {
  const next = !isDark();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) { paint(next); return; }

  if (typeof document.startViewTransition === "function" && origin) {
    const r = origin.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.dataset.themeSwitch = next ? "to-dark" : "to-light";
    const vt = document.startViewTransition(() => { flushSync(() => paint(next)); });
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${reach}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.65,.05,.25,1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
    vt.finished.finally(() => { delete root.dataset.themeSwitch; });
    return;
  }

  // Fallback: colours ease over 0.45s
  root.classList.add("theme-fade");
  paint(next);
  setTimeout(() => root.classList.remove("theme-fade"), 500);
}
