/* IntegrationHub (motion-brew style): tiles around a central hub, wired to it, with dots flowing along the wires.
   <IntegrationHub apps={[{ id, name, icon: node, tint: "bg-lilac" }]} label="Languages" sub="7 skills" /> */
import { motion, useReducedMotion } from "framer-motion";

export function IntegrationHub({ apps, label, sub, className = "" }) {
  const still = !!useReducedMotion();
  const n = apps.length;
  const R = n > 7 ? 38 : 36;
  const pts = apps.map((_, i) => { const t = ((-90 + (360 / n) * i) * Math.PI) / 180; return [50 + R * Math.cos(t), 50 + R * Math.sin(t)]; });
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[34rem] ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {pts.map(([x, y], i) => (
          <g key={apps[i].id}>
            <line x1="50" y1="50" x2={x} y2={y} stroke="currentColor" strokeOpacity=".16" strokeWidth=".35" strokeDasharray="1.2 1.4" />
            {!still && [0, 1].map((k) => (
              <motion.circle key={k} r="1" fill="#7C6CF6" initial={{ cx: i % 2 ? x : 50, cy: i % 2 ? y : 50, opacity: 0 }}
                animate={{ cx: i % 2 ? [x, 50] : [50, x], cy: i % 2 ? [y, 50] : [50, y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 + i * 0.28 + k * 1.2, ease: "easeInOut", times: [0, 0.15, 0.85, 1] }} />
            ))}
          </g>
        ))}
      </svg>
      {/* hub */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        {!still && <motion.span aria-hidden className="absolute inset-0 rounded-[1.6rem] ring-2 ring-violet-400/60" animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />}
        <div className="relative grid min-h-[5.5rem] min-w-[5.5rem] max-w-[8.5rem] place-items-center rounded-[1.6rem] bg-ink px-3 py-3 text-center text-mist shadow-xl sm:min-h-[6.5rem] sm:min-w-[6.5rem]">
          <div>
            <div className="font-display text-base font-bold leading-tight sm:text-lg">{label}</div>
            {sub && <div className="mt-0.5 text-[11px] text-mist/60">{sub}</div>}
          </div>
        </div>
      </div>
      {/* tiles */}
      {apps.map((a, i) => (
        <div key={a.id} className="absolute z-[5] w-[4.6rem] -translate-x-1/2 -translate-y-1/2 sm:w-[5.5rem]" style={{ left: `${pts[i][0]}%`, top: `${pts[i][1]}%` }}>
          <motion.div className="flex flex-col items-center gap-1" initial={still ? false : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.1 + i * 0.07 }}>
            <span data-glow className={`grid h-12 w-12 place-items-center rounded-2xl shadow-md ring-1 ring-ink/[.06] sm:h-14 sm:w-14 ${a.tint || "bg-surface"}`}>{a.icon}</span>
            <span className="max-w-full truncate rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold shadow-sm ring-1 ring-ink/[.05] sm:text-xs">{a.name}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
