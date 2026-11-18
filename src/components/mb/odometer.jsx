/* Odometer: every digit is a wheel of 0-9 that rolls to its value when the number scrolls into view
   (style of motion-brew's wallet-card / rolling-stepper counters). */
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export function Odometer({ to, suffix = "", className = "", delay = 0 }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const still = !!useReducedMotion();
  const text = Number(to).toLocaleString("en-US") + suffix;
  const chars = text.split("");
  return (
    <span ref={ref} className={`inline-flex tabular-nums leading-[1] ${className}`} aria-label={text} role="img">
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden className="inline-block h-[1em] leading-[1]">{ch}</span>;
        const d = Number(ch);
        const on = still || seen;
        return (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-[1]">
            <motion.span className="flex flex-col" initial={false} animate={{ y: on ? `${-d * 10}%` : "0%" }} transition={still ? { duration: 0 } : { duration: 1.1 + d * 0.06, delay: delay + i * 0.08, ease }}>
              {Array.from({ length: 10 }, (_, k) => <span key={k} className="block h-[1em] leading-[1]">{k}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
