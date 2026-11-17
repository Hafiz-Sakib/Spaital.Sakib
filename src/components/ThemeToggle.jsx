import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toggleTheme, useDark } from "../theme";

/* Day / night switch in the same spring-and-glide style as the other motion-brew pieces.
   The knob slides across, the sun's rays fold away while a moon bites into the disc, and the stars fade in.
   The page itself changes through a circle that grows from this button (see toggleTheme). */
const SPRING = { type: "spring", stiffness: 420, damping: 30 };
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function Glyph({ dark, still }) {
  const id = useId().replace(/:/g, "");
  const t = still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
      <mask id={`m${id}`}>
        <rect width="24" height="24" fill="#fff" />
        <motion.circle r="7" fill="#000" initial={false} animate={{ cx: dark ? 15.5 : 32, cy: dark ? 8.5 : -6 }} transition={t} />
      </mask>
      <motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#m${id})`} initial={false} animate={{ r: dark ? 8.5 : 5 }} transition={t} />
      <motion.g stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={false} animate={{ rotate: dark ? 80 : 0, scale: dark ? 0.2 : 1, opacity: dark ? 0 : 1 }} transition={t} style={{ originX: "12px", originY: "12px" }}>
        {RAYS.map((a) => <line key={a} x1="12" y1="2.2" x2="12" y2="4.4" transform={`rotate(${a} 12 12)`} />)}
      </motion.g>
    </svg>
  );
}

const STARS = [[8, 7, 1.4], [17, 20, 1], [11, 22, 1.1], [24, 10, 0.9]];

export default function ThemeToggle({ className = "" }) {
  const dark = useDark();
  const still = !!useReducedMotion();
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to day mode" : "Switch to night mode"}
      onClick={(e) => toggleTheme(e.currentTarget)}
      whileTap={still ? undefined : { scale: 0.94 }}
      className={`relative h-8 w-[3.75rem] shrink-0 cursor-pointer overflow-hidden rounded-full border border-ink/15 outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-violet-500/60 ${dark ? "bg-[#1B1D3A]" : "bg-[#DCEBFF]"} shadow-[0_8px_30px_-8px_rgba(20,21,26,.25)] ${className}`}
    >
      {/* stars (night) */}
      {STARS.map(([x, y, r], i) => (
        <motion.span key={i} aria-hidden className="absolute rounded-full bg-white" style={{ left: x, top: y, width: r * 2, height: r * 2 }}
          initial={false} animate={{ opacity: dark ? [0.45, 1, 0.45] : 0, scale: dark ? 1 : 0.2 }}
          transition={dark && !still ? { opacity: { duration: 2.4 + i * 0.5, repeat: Infinity }, scale: { duration: 0.4, delay: 0.15 + i * 0.05 } } : { duration: 0.2 }} />
      ))}
      {/* clouds (day) */}
      <motion.span aria-hidden className="absolute bottom-1 right-2 h-2 w-5 rounded-full bg-white/80" initial={false} animate={{ opacity: dark ? 0 : 1, x: dark ? 10 : 0 }} transition={SPRING} />
      <motion.span aria-hidden className="absolute bottom-2.5 right-4 h-1.5 w-3 rounded-full bg-white/70" initial={false} animate={{ opacity: dark ? 0 : 1, x: dark ? 14 : 0 }} transition={SPRING} />
      {/* knob */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: dark ? 30 : 2 }}
        transition={still ? { duration: 0 } : SPRING}
        className={`absolute left-0 top-[2px] grid h-[26px] w-[26px] place-items-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,.25)] transition-colors duration-500 ${dark ? "bg-[#2A2D55] text-[#E7E3FF]" : "bg-white text-amber-500"}`}
      >
        <Glyph dark={dark} still={still} />
      </motion.span>
    </motion.button>
  );
}
