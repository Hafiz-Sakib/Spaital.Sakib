import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toggleTheme, useDark, SWITCH_MS } from "../theme";

/* Day / night switch in the same spring-and-glide style as the other motion-brew pieces.
   The knob slides across, the sun's rays fold away while a moon bites into the disc, and the stars fade in.
   The page itself changes through a circle that grows from this button (see toggleTheme). */
/* Knob, glyph and sky all glide on the same slow curve as the page circle so the whole switch feels like one motion */
const DUR = SWITCH_MS / 1000;
const GLIDE = { duration: DUR * 0.85, ease: [0.5, 0.05, 0.25, 1] };
const SPRING = GLIDE;
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function Glyph({ dark, still }) {
  const id = useId().replace(/:/g, "");
  const t = still ? { duration: 0 } : GLIDE;
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" aria-hidden>
      <mask id={`m${id}`}>
        <rect width="24" height="24" fill="#fff" />
        <motion.circle r="7" fill="#000" initial={false} animate={{ cx: dark ? 15.5 : 32, cy: dark ? 8.5 : -6 }} transition={t} />
      </mask>
      <motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#m${id})`} initial={false} animate={{ r: dark ? 8.5 : 5 }} transition={t} />
      <motion.g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" initial={false} animate={{ rotate: dark ? 80 : 0, scale: dark ? 0.2 : 1, opacity: dark ? 0 : 1 }} transition={t} style={{ originX: "12px", originY: "12px" }}>
        {RAYS.map((a) => <line key={a} x1="12" y1="2.2" x2="12" y2="4.4" transform={`rotate(${a} 12 12)`} />)}
      </motion.g>
    </svg>
  );
}

const STARS = [[7, 6, 1.1], [16, 16, 0.8], [11, 18, 0.9], [20, 7, 0.7]];

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
      className={`relative h-7 w-[3.25rem] shrink-0 cursor-pointer overflow-hidden rounded-full border border-ink/15 outline-none transition-colors duration-1000 focus-visible:ring-2 focus-visible:ring-violet-500/60 ${dark ? "bg-[#1B1D3A]" : "bg-[#DCEBFF]"} shadow-[0_2px_10px_-4px_rgba(20,21,26,.18)] ${className}`}
    >
      {/* stars (night) */}
      {STARS.map(([x, y, r], i) => (
        <motion.span key={i} aria-hidden className="absolute rounded-full bg-white" style={{ left: x, top: y, width: r * 2, height: r * 2 }}
          initial={false} animate={{ opacity: dark ? [0.45, 1, 0.45] : 0, scale: dark ? 1 : 0.2 }}
          transition={dark && !still ? { opacity: { duration: 2.4 + i * 0.5, repeat: Infinity }, scale: { duration: 0.6, delay: 0.5 + i * 0.08 } } : { duration: 0.2 }} />
      ))}
      {/* clouds (day) */}
      <motion.span aria-hidden className="absolute bottom-[4px] right-2 h-2 w-4 rounded-full bg-white/80" initial={false} animate={{ opacity: dark ? 0 : 1, x: dark ? 8 : 0 }} transition={SPRING} />
      <motion.span aria-hidden className="absolute bottom-[9px] right-3.5 h-1.5 w-2.5 rounded-full bg-white/70" initial={false} animate={{ opacity: dark ? 0 : 1, x: dark ? 10 : 0 }} transition={SPRING} />
      {/* knob */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: dark ? 26 : 2 }}
        transition={still ? { duration: 0 } : SPRING}
        className={`absolute left-0 top-[2px] grid h-[22px] w-[22px] place-items-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,.25)] transition-colors duration-1000 ${dark ? "bg-[#2A2D55] text-[#E7E3FF]" : "bg-white text-amber-500"}`}
      >
        <Glyph dark={dark} still={still} />
      </motion.span>
    </motion.button>
  );
}
