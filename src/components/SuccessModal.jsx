import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* One confirmation modal for the whole site: centred card over a blurred backdrop.
   Used for "Message sent" and "You're subscribed", only the words change.
   Closes with the button, the backdrop or Escape. */
export function SuccessModal({ open, onClose, title, text, button = "Done" }) {
  const still = !!useReducedMotion();
  const btn = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    const t = setTimeout(() => btn.current?.focus(), 60);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); clearTimeout(t); };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-5 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? 0 : 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-text"
            initial={still ? false : { opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-sm rounded-3xl bg-surface p-8 text-center shadow-[0_30px_80px_-20px_rgba(20,21,26,.45)] ring-1 ring-ink/[.08]"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-emerald-700 dark:text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }} />
              </svg>
            </div>
            <h3 id="success-title" className="mt-5 text-2xl font-bold">{title}</h3>
            <p id="success-text" className="mt-2 text-ink/60">{text}</p>
            <button ref={btn} onClick={onClose} className="mt-6 rounded-full bg-ink px-7 py-2.5 text-sm font-semibold text-mist transition hover:bg-ink/85">{button}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
