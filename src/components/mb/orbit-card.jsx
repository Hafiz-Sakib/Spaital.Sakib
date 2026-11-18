/* OrbitCard (motion-brew style): chips orbit a centre mark on two rings; chips stay upright while the rings turn.
   items: [{ key, node, href?, label }] */
import { motion, useReducedMotion } from "framer-motion";

function Ring({ items, radius, seconds, reverse, size = 44 }) {
  const still = !!useReducedMotion();
  const dir = reverse ? -1 : 1;
  return (
    <motion.div className="absolute inset-0" animate={still ? undefined : { rotate: 360 * dir }} transition={{ duration: seconds, repeat: Infinity, ease: "linear" }}>
      {items.map((it, i) => {
        const a = (360 / items.length) * i;
        const inner = (
          <motion.span className="grid place-items-center rounded-full bg-surface shadow-md ring-1 ring-ink/[.08]" style={{ width: size, height: size }} animate={still ? undefined : { rotate: -360 * dir }} transition={{ duration: seconds, repeat: Infinity, ease: "linear" }}>
            {it.node}
          </motion.span>
        );
        return (
          <span key={it.key} className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-${radius}px) rotate(${-a}deg)` }}>
            {it.href
              ? <a href={it.href} target="_blank" rel="noreferrer" aria-label={it.label} title={it.label} className="block transition hover:scale-110">{inner}</a>
              : inner}
          </span>
        );
      })}
    </motion.div>
  );
}

export function OrbitCard({ center, items = [], className = "" }) {
  const cut = Math.min(3, Math.ceil(items.length / 3));
  const inner = items.slice(0, cut), outer = items.slice(cut);
  return (
    <div className={`relative mx-auto h-[19rem] w-[19rem] max-w-full ${className}`}>
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[10rem] w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/15" />
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[16.5rem] w-[16.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/10" />
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">{center}</div>
      {inner.length > 0 && <Ring items={inner} radius={80} seconds={34} reverse />}
      {outer.length > 0 && <Ring items={outer} radius={132} seconds={52} />}
    </div>
  );
}
