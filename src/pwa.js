// PWA install support. The browser fires `beforeinstallprompt` once, early, so it is captured here (imported first in main.jsx)
// and kept until the Install button asks for it.
import { useSyncExternalStore } from "react";

let deferred = null;
let installed = false;
// Chromium browsers (Android Chrome, Edge...) fire `beforeinstallprompt` only when the app is NOT installed yet.
const supportsPrompt = typeof window !== "undefined" && "onbeforeinstallprompt" in window;
const FLAG = "pwa-installed";
const flagged = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };
const markInstalled = () => { try { localStorage.setItem(FLAG, "1"); } catch {} };
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

if (typeof window !== "undefined") {
  installed = isStandalone();
  if (installed) markInstalled();
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; emit(); });
  window.addEventListener("appinstalled", () => { deferred = null; installed = true; markInstalled(); emit(); });
}

// "installed" here means: hide the Install button. Shown only if the browser offers the prompt, or (browsers without a
// prompt, e.g. iPhone Safari / Firefox) if the app was never opened as an installed app on this device.
const snapshot = () => `${deferred ? "ready" : "manual"}|${!deferred && (installed || flagged() || supportsPrompt) ? "installed" : "web"}`;
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

/** { canPrompt, installed } for the Install button. */
export function useInstall() {
  const [a, b] = useSyncExternalStore(subscribe, snapshot, () => "manual|web").split("|");
  return { canPrompt: a === "ready", installed: b === "installed" };
}

/** Opens the browser's install dialog. Returns "accepted", "dismissed" or "manual" (browser gives no prompt, e.g. iPhone Safari). */
export async function promptInstall() {
  if (!deferred) return "manual";
  const ev = deferred;
  deferred = null;
  emit();
  try { await ev.prompt(); const { outcome } = await ev.userChoice; return outcome; } catch { return "dismissed"; }
}
