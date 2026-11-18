/* UsageRing (motion-brew style): a segmented ring that draws in segment by segment.
   segments: [{ value, color }]  children = what sits in the middle. */
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function UsageRing({ segments, size = 220, stroke = 16, children, className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const still = !!useReducedMotion();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 0.012 : 0;
  let at = 0;
  return (
    <div ref={ref} className={`relative mx-auto ${className}`} style={{ width: size, height: size, maxWidth: "100%" }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const f = s.value / total;
          const start = at; at += f;
          if (f <= 0) return null;
          const len = Math.max(f - gap, 0.002);
          return (
            <motion.circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="round" pathLength={1}
              strokeDashoffset={-start - gap / 2}
              initial={false} animate={{ strokeDasharray: `${seen || still ? len : 0} 1` }}
              transition={still ? { duration: 0 } : { duration: 1, delay: 0.15 + i * 0.2, ease: [0.22, 1, 0.36, 1] }} />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
