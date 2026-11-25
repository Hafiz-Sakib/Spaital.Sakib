/* DuoFlip (motion-brew style): a picture gallery that turns like a page. One half of the frame folds over the spine,
   its back shows the next picture. Buttons, dots, arrow keys, or click the left / right half of the picture.
   <DuoFlip images={[{ src, alt, label? }]} index onIndex renderCaption? /> */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const Half = ({ src, alt, side, className = "", style }) => (
  <div className={`absolute top-0 h-full w-1/2 overflow-hidden ${side === "l" ? "left-0" : "left-1/2"} ${className}`} style={style}>
    <img src={src} alt={alt} draggable={false} className="absolute top-0 h-full w-[200%] max-w-none object-cover object-top" style={{ left: side === "l" ? 0 : "-100%" }} />
  </div>
);

export function DuoFlip({ images, index, onIndex, className = "" }) {
  const still = !!useReducedMotion();
  const [own, setOwn] = useState(0);
  const cur = index ?? own;
  const [turn, setTurn] = useState(null); // { to, dir }
  const commit = (n) => { setOwn(n); onIndex?.(n); };
  const go = (n) => {
    if (turn || n === cur || n < 0 || n >= images.length) return;
    if (still) return commit(n);
    setTurn({ to: n, dir: n > cur ? 1 : -1 });
  };
  const next = () => go(cur + 1), prev = () => go(cur - 1);
  const to = turn ? turn.to : cur;
  const dir = turn?.dir ?? 1;
  const A = images[cur], B = images[to];
  useEffect(() => { for (const i of [cur - 1, cur + 1]) { const im = images[i]; if (im) { const p = new Image(); p.src = im.src; } } }, [cur, images]);

  return (
    <div className={className} tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); }} role="group" aria-label="Project gallery" aria-roledescription="carousel">
      <div data-glow className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-[1.4rem] bg-mist shadow-[0_20px_50px_-20px_rgba(20,21,26,.35)] ring-1 ring-ink/[.06]" style={{ perspective: 1600 }}>
        {/* the two halves that stay put */}
        <Half side="l" src={(dir > 0 ? A : B).src} alt={!turn ? A.alt : ""} />
        <Half side="r" src={(dir > 0 ? B : A).src} alt="" />
        {/* the half that turns */}
        {turn && (
          <motion.div aria-hidden className="absolute top-0 h-full w-1/2" style={{ left: dir > 0 ? "50%" : 0, transformOrigin: dir > 0 ? "0% 50%" : "100% 50%", transformStyle: "preserve-3d" }}
            initial={{ rotateY: 0 }} animate={{ rotateY: dir > 0 ? -180 : 180 }} transition={{ duration: 0.85, ease: [0.5, 0.05, 0.25, 1] }}
            onAnimationComplete={() => { commit(turn.to); setTurn(null); }}>
            <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
              <img src={A.src} alt="" draggable={false} className="absolute top-0 h-full w-[200%] max-w-none object-cover object-top" style={{ left: dir > 0 ? "-100%" : 0 }} />
              <motion.span className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/30" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1] }} transition={{ duration: 0.85 }} style={{ transform: dir > 0 ? "none" : "scaleX(-1)" }} />
            </div>
            <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <img src={B.src} alt="" draggable={false} className="absolute top-0 h-full w-[200%] max-w-none object-cover object-top" style={{ left: dir > 0 ? 0 : "-100%" }} />
              <motion.span className="absolute inset-0 bg-gradient-to-l from-black/0 to-black/35" initial={{ opacity: 1 }} animate={{ opacity: [1, 0, 0] }} transition={{ duration: 0.85 }} style={{ transform: dir > 0 ? "none" : "scaleX(-1)" }} />
            </div>
          </motion.div>
        )}
        {/* spine shadow */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        {/* click zones */}
        <button aria-label="Previous project" onClick={prev} disabled={cur === 0} className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize disabled:cursor-default" />
        <button aria-label="Next project" onClick={next} disabled={cur === images.length - 1} className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize disabled:cursor-default" />
        {B.label && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{(turn ? B : A).label}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button onClick={prev} disabled={cur === 0 || !!turn} aria-label="Previous" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/[.07] transition hover:bg-ink/10 disabled:opacity-30">←</button>
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5">
          {images.map((im, i) => <button key={i} onClick={() => go(i)} aria-label={`Show ${im.label || i + 1}`} aria-current={i === to ? "true" : undefined} className={`h-2 rounded-full transition-all duration-300 ${i === to ? "w-7 bg-ink" : "w-2 bg-ink/20 hover:bg-ink/40"}`} />)}
        </div>
        <button onClick={next} disabled={cur === images.length - 1 || !!turn} aria-label="Next" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-mist transition hover:bg-ink/85 disabled:opacity-30">→</button>
      </div>
    </div>
  );
}
