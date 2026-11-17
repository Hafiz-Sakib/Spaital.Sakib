import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Showcase({ items, onOpen }) {
  const [i, setI] = useState(0);
  const n = items.length;
  const go = (d) => setI((i + d + n) % n);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-zinc-200 dark:bg-zinc-800">
        <img src={items[i].thumb || items[i].src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl" />
        <AnimatePresence mode="wait">
          <motion.img key={i} src={items[i].src} alt={items[i].alt} onClick={() => onOpen(i)}
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            className="absolute inset-0 h-full w-full cursor-zoom-in object-contain" />
        </AnimatePresence>
        {["‹", "›"].map((c, k) => (
          <button key={c} aria-label={k ? "Next" : "Previous"} onClick={() => go(k ? 1 : -1)}
            className={`absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 text-xl text-white backdrop-blur hover:bg-black/60 ${k ? "right-3" : "left-3"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {items.map((it, k) => (
          <button key={it.src} onClick={() => setI(k)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${k === i ? "ring-zinc-900 dark:ring-white" : "ring-transparent opacity-60 hover:opacity-100"}`}>
            <img src={it.thumb || it.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-sm text-zinc-500">{i + 1} / {n}</p>
    </div>
  );
}
