import { useEffect, useState } from "react";
import { promptInstall, useInstall } from "../pwa";

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// "Install" pill with a download icon. Click = browser's PWA install dialog. Where the browser has no install dialog
// (iPhone Safari, Firefox...) a small tip explains the manual way. Hidden once the app is installed / running as the app.
export default function InstallButton({ className = "" }) {
  const { canPrompt, installed } = useInstall();
  const [tip, setTip] = useState(false);

  useEffect(() => {
    if (!tip) return;
    const id = setTimeout(() => setTip(false), 7000);
    return () => clearTimeout(id);
  }, [tip]);

  if (installed) return null;

  const click = async () => {
    const r = await promptInstall();
    if (r === "manual") setTip((v) => !v);
  };

  return (
    <div className={`relative ${className}`}>
      <button type="button" onClick={click} aria-label="Install app"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink/[0.07] px-3.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        Install
      </button>
      {tip && (
        <div role="status" className="absolute right-0 top-11 z-30 w-64 rounded-2xl bg-surface p-3 text-left text-sm leading-snug text-ink/80 shadow-xl ring-1 ring-ink/10">
          {isIOS()
            ? "On iPhone / iPad: tap the Share button, then “Add to Home Screen”."
            : "Open your browser menu and choose “Install app” or “Add to Home screen”."}
        </div>
      )}
    </div>
  );
}
