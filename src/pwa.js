// PWA install support. The browser fires `beforeinstallprompt` once, early, so it is captured here (imported first in main.jsx)
// and kept until the Install button asks for it.
import { useSyncExternalStore } from "react";

let deferred = null;
let installed = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

if (typeof window !== "undefined") {
  installed = isStandalone();
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; emit(); });
  window.addEventListener("appinstalled", () => { deferred = null; installed = true; emit(); });
}

const snapshot = () => `${deferred ? "ready" : "manual"}|${installed ? "installed" : "web"}`;
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
