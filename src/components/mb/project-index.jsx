/* ProjectIndex (motion-brew style): a typographic list of projects; hovering (or tapping) a row brings its screenshot
   through a blur-and-scale swap in the preview, with the details underneath.
   items: [{ id, title, kind, img, alt, children: node }] */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function ProjectIndex({ items, label = "Projects" }) {
  const still = !!useReducedMotion();
  const [a, setA] = useState(0);
  const cur = items[a];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
      <div className="lg:order-2 lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden p-2.5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-mist">
            {items.map((it, i) => (
              <motion.img key={it.id} src={it.img} alt={i === a ? it.alt : ""} aria-hidden={i !== a} loading={i === 0 ? "eager" : "lazy"} draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-top"
                initial={false} animate={{ opacity: i === a ? 1 : 0, scale: i === a ? 1 : 1.08, filter: i === a ? "blur(0px)" : "blur(14px)" }}
                transition={still ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
            ))}
          </div>
          <motion.div key={cur.id} initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-4 sm:p-5" aria-live="polite">{cur.children}</motion.div>
        </div>
      </div>
      <ol aria-label={label} className="lg:order-1">
        {items.map((it, i) => {
          const on = i === a;
          return (
            <li key={it.id} className="border-t border-ink/10 last:border-b">
              <button onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)} aria-current={on ? "true" : undefined} className="group relative flex w-full items-baseline gap-4 py-4 text-left sm:gap-5 sm:py-5">
                {on && <motion.span layoutId="pi-bar" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-y-2 -left-3 w-1 rounded-full bg-gradient-to-b from-violet-500 to-pink-500" />}
                <span className="font-display text-sm font-semibold tabular-nums text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-display text-2xl font-semibold transition-all duration-300 sm:text-3xl ${on ? "translate-x-1 text-ink" : "text-ink/40 group-hover:text-ink/70"}`}>{it.title}</span>
                  <span className="mt-0.5 block text-sm text-ink/45">{it.kind}</span>
                </span>
                <span aria-hidden className={`text-xl transition-all duration-300 ${on ? "translate-x-0 text-ink opacity-100" : "-translate-x-2 text-ink/40 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>↗</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
