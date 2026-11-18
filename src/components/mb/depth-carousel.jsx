/* DepthCarousel (motion-brew style): cards stacked back into depth with a touch of blur.
   Next / prev, swipe, arrow keys or tap a card behind to bring it forward. renderCard(item, active) -> node. */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 260, damping: 28 };

export function DepthCarousel({ items, renderCard, cardHeight = 232, label = "Carousel" }) {
  const still = !!useReducedMotion();
  const [a, setA] = useState(0);
  const go = (n) => setA(Math.max(0, Math.min(items.length - 1, n)));
  const key = (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(a + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(a - 1); } };
  return (
    <div role="group" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={key} className="outline-none">
      <div className="relative mx-auto w-full max-w-xl" style={{ height: cardHeight + 70 }}>
        {items.map((it, i) => {
          const d = i - a;
          const gone = d < 0, far = d > 3;
          return (
            <motion.div key={i} aria-hidden={d !== 0} onClick={() => d > 0 && go(i)}
              drag={d === 0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
              onDragEnd={(_, info) => { if (info.offset.x < -60) go(a + 1); else if (info.offset.x > 60) go(a - 1); }}
              initial={false}
              animate={{ x: gone ? "-14%" : 0, y: gone ? 10 : d * 22, scale: gone ? 1.04 : 1 - d * 0.065, opacity: gone || far ? 0 : 1 - d * 0.18, filter: `blur(${gone ? 8 : d * 1.6}px)` }}
              transition={still ? { duration: 0 } : SPRING}
              style={{ zIndex: 100 - Math.abs(d), height: cardHeight, pointerEvents: gone || far ? "none" : "auto", transformOrigin: "50% 100%" }}
              className={`absolute inset-x-0 top-0 ${d > 0 ? "cursor-pointer" : d === 0 ? "cursor-grab active:cursor-grabbing" : ""}`}>
              {renderCard(it, d === 0)}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button onClick={() => go(a - 1)} disabled={a === 0} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-full bg-ink/[.07] transition hover:bg-ink/10 disabled:opacity-30">←</button>
        <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums text-ink/55">{a + 1} / {items.length}</span>
        <button onClick={() => go(a + 1)} disabled={a === items.length - 1} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-mist transition hover:bg-ink/85 disabled:opacity-30">→</button>
      </div>
    </div>
  );
}
