/* BlurAccordion (motion-brew style): panels spring open and the content sharpens out of a blur.
   items: [{ id, title, hint?, count?, content: node }]  - one panel open at a time. */
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function BlurAccordion({ items, defaultOpen = 0, className = "" }) {
  const still = !!useReducedMotion();
  const [open, setOpen] = useState(items[defaultOpen]?.id ?? null);
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((it, n) => {
        const on = open === it.id;
        return (
          <div key={it.id} className="card overflow-hidden">
            <button onClick={() => setOpen(on ? null : it.id)} aria-expanded={on} className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7 sm:py-6">
              <span className="font-display text-sm font-semibold tabular-nums text-ink/35">{String(n + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold sm:text-2xl">{it.title}</span>
                {it.hint && <span className="mt-0.5 block truncate text-sm text-ink/50">{it.hint}</span>}
              </span>
              {it.count != null && <span className="rounded-full bg-ink/[.07] px-3 py-1 text-xs font-semibold text-ink/60">{it.count}</span>}
              <motion.span aria-hidden animate={{ rotate: on ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 26 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/[.07] text-lg leading-none">+</motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div key="body" initial={still ? false : { height: 0, opacity: 0, filter: "blur(10px)" }} animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }} exit={still ? { opacity: 0 } : { height: 0, opacity: 0, filter: "blur(10px)" }} transition={{ type: "spring", stiffness: 260, damping: 32 }} className="overflow-hidden">
                  <div className="px-5 pb-6 sm:px-7 sm:pb-7">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
