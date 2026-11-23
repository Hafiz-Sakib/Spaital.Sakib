/* ExpandList (motion-brew style): every row starts expanded; click a row to collapse / expand it again.
   items: [{ id, icon, tint, title, meta, detail, body?, href?, cta?, outline? }]  (outline = secondary-looking link button) */
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function ExpandList({ items, className = "" }) {
  const still = !!useReducedMotion();
  const [closed, setClosed] = useState(() => new Set());
  const toggle = (id) => setClosed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((it, i) => {
        const open = !closed.has(it.id);
        return (
          <motion.li key={it.id} layout={!still} transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className={`overflow-hidden rounded-[1.4rem] ring-1 transition-colors ${open ? "bg-mist ring-ink/10" : "bg-ink/[.035] ring-transparent"}`}>
            <button onClick={() => toggle(it.id)} aria-expanded={open} className="flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5">
              <span className="w-5 shrink-0 text-sm font-semibold tabular-nums text-ink/35">{i + 1}</span>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${it.tint}`}>{it.icon}</span>
              <span className="min-w-0 flex-1">
                <span className={`block font-display text-base font-bold leading-snug sm:text-lg ${open ? "" : "truncate"}`}>{it.title}</span>
                <span className="block truncate text-sm text-ink/50">{it.meta}</span>
              </span>
              <motion.span aria-hidden animate={{ rotate: open ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[.07] text-lg leading-none">+</motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div initial={still ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pl-[4.75rem] sm:px-5 sm:pl-[5.75rem]">
                    {it.body ?? <p className="text-sm text-ink/65">{it.detail}</p>}
                    {it.href && <a href={it.href} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition ${it.outline ? "border-ink/35 bg-surface text-ink hover:border-ink/60 hover:bg-mist" : "border-ink bg-ink text-mist hover:bg-ink/85"}`}>{it.cta || "Open"} <span aria-hidden>↗</span></a>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}
