import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Lightbox({ items, index, onClose, onChange }) {
  const open = index !== null && index !== undefined;
  const n = items.length;
  useEffect(() => {
    if (!open) return;
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % n);
      if (e.key === "ArrowLeft") onChange((index - 1 + n) % n);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, index, n, onClose, onChange]);

  useEffect(() => { // preload the next/previous full image so arrows feel instant
    if (!open || n < 2) return;
    [index + 1, index - 1].forEach((k) => { const it = items[(k + n) % n]; if (it) new Image().src = it.full || it.src; });
  }, [open, index, n, items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.img key={index} src={items[index].full || items[index].src} alt={items[index].alt} className="max-h-[88vh] max-w-full rounded-lg object-contain"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">{index + 1} / {n}</p>
          <button aria-label="Close" onClick={onClose} className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/10 text-xl text-white hover:bg-white/20">×</button>
          {n > 1 && ["‹", "›"].map((c, i) => (
            <button key={c} aria-label={i ? "Next" : "Previous"} onClick={(e) => { e.stopPropagation(); onChange((index + (i ? 1 : -1) + n) % n); }}
              className={`absolute top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 ${i ? "right-4" : "left-4"}`}>{c}</button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
