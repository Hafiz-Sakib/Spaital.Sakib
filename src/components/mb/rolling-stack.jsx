/* RollingStack (motion-brew "rolling card stack" style): a deck that rolls like a rolodex.
   The active card sits in front, the neighbours tilt away above and below. Tap a card, drag, use the arrows or Up/Down keys.
   renderCard(item, active) -> node */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 240, damping: 26 };

export function RollingStack({ items, renderCard, cardHeight = 104, step = 74, label = "Deck" }) {
  const still = !!useReducedMotion();
  const [a, setA] = useState(0);
  const go = (n) => setA(Math.max(0, Math.min(items.length - 1, n)));
  const key = (e) => { if (e.key === "ArrowDown") { e.preventDefault(); go(a + 1); } if (e.key === "ArrowUp") { e.preventDefault(); go(a - 1); } };
  const above = Math.min(a, 2), below = Math.min(items.length - 1 - a, 2);
  const H = cardHeight + step * (above + below);
  return (
    <div role="group" aria-label={label} tabIndex={0} onKeyDown={key} className="outline-none">
      <motion.div className="relative mx-auto w-full max-w-xl" style={{ perspective: 1100 }} initial={false} animate={{ height: H }} transition={still ? { duration: 0 } : SPRING}>
        {items.map((it, i) => {
          const d = i - a;
          const far = Math.abs(d) > 2;
          return (
            <motion.div key={i} aria-hidden={d !== 0} onClick={() => d !== 0 && go(i)}
              drag={d === 0 ? "y" : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.4}
              onDragEnd={(_, info) => { if (info.offset.y < -40) go(a + 1); else if (info.offset.y > 40) go(a - 1); }}
              initial={false}
              animate={{ y: above * step + d * step, rotateX: -d * 24, scale: 1 - Math.abs(d) * 0.07, opacity: far ? 0 : 1 - Math.abs(d) * 0.3, filter: `blur(${Math.abs(d) * 1.2}px)` }}
              transition={still ? { duration: 0 } : SPRING}
              style={{ zIndex: 10 - Math.abs(d), height: cardHeight, pointerEvents: far ? "none" : "auto", transformOrigin: d < 0 ? "50% 100%" : "50% 0%" }}
              className={`absolute inset-x-0 top-0 ${d !== 0 ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}>
              {renderCard(it, d === 0)}
            </motion.div>
          );
        })}
      </motion.div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <button onClick={() => go(a - 1)} disabled={a === 0} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-full bg-ink/[.07] transition hover:bg-ink/10 disabled:opacity-30">↑</button>
        <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-ink/55">{a + 1} / {items.length}</span>
        <button onClick={() => go(a + 1)} disabled={a === items.length - 1} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-mist transition hover:bg-ink/85 disabled:opacity-30">↓</button>
      </div>
    </div>
  );
}
