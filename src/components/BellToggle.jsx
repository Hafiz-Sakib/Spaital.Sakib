/**
 * BellToggle, from https://motion-brew.com/components/bell-toggle
 *
 * Ported to plain JSX for this Vite + Tailwind project (framer-motion instead of motion/react, plain gsap (no @gsap/react),
 * no clsx / tailwind-merge). Press: the pill unfurls, the slash draws away, the bell rings.
 * Props: on, defaultOn, onChange, label ("Notify me"), onLabel ("Notifications on"), className.
 */
import * as React from "react";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";


const cn = (...a) => a.filter(Boolean).join(" ");
const GLIDE = [0.22, 1, 0.36, 1];
const UNFURL = { type: "spring", stiffness: 420, damping: 32 };

export const BellToggle = React.forwardRef(function BellToggle(
  { on: controlled, defaultOn = false, onChange, label = "Notify me", onLabel = "Notifications on", className },
  ref,
) {
  const still = !!useReducedMotion();
  const [inner, setInner] = React.useState(defaultOn);
  const on = controlled ?? inner;
  const bell = React.useRef(null);
  const first = React.useRef(true);

  // gsap.context scopes every "[data-...]" selector to this bell and lets us revert on unmount.
  const ctx = React.useRef(null);
  React.useLayoutEffect(() => {
    ctx.current = gsap.context(() => {
      gsap.set("[data-slash]", { strokeDashoffset: on ? 1 : 0 });
      gsap.set("[data-wave]", { strokeDashoffset: 1, opacity: 0 });
      gsap.set("[data-body], [data-clapper]", { rotation: 0, svgOrigin: "12 4" });
    }, bell);
    return () => ctx.current?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contextSafe = (fn) => (...a) => (ctx.current ? ctx.current.add(() => fn(...a)) : fn(...a));

  const ring = contextSafe(() => {
    if (still) { gsap.set("[data-slash]", { strokeDashoffset: 1 }); return; }
    const tl = gsap.timeline();
    tl.to("[data-slash]", { strokeDashoffset: 1, duration: 0.25, ease: "power2.in" })
      .to("[data-body]", { keyframes: { rotation: [0, 22, -18, 13, -9, 5, -2, 0] }, duration: 0.9, ease: "sine.inOut", svgOrigin: "12 4" }, 0.08)
      .to("[data-clapper]", { keyframes: { rotation: [0, -26, 22, -16, 10, -5, 0] }, duration: 0.95, ease: "sine.inOut", svgOrigin: "12 4" }, 0.14)
      .fromTo("[data-wave]", { strokeDashoffset: 1, opacity: 1, scale: 0.85, svgOrigin: "12 12" }, { strokeDashoffset: 0, scale: 1.1, duration: 0.35, ease: "power2.out", stagger: 0.06 }, 0.15)
      .to("[data-wave]", { opacity: 0, duration: 0.35, ease: "power1.in" }, 0.6);
  });

  const silence = contextSafe(() => {
    if (still) { gsap.set("[data-slash]", { strokeDashoffset: 0 }); return; }
    gsap.killTweensOf("[data-body], [data-clapper], [data-wave]");
    gsap.set("[data-wave]", { opacity: 0 });
    gsap.timeline()
      .to("[data-body], [data-clapper]", { keyframes: { rotation: [0, -8, 0] }, duration: 0.4, ease: "sine.inOut", svgOrigin: "12 4" })
      .to("[data-slash]", { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, 0.05);
  });

  const nudge = contextSafe(() => {
    if (!on || still) return;
    gsap.to("[data-body]", { keyframes: { rotation: [0, 9, -6, 0] }, duration: 0.5, ease: "sine.inOut", svgOrigin: "12 4", overwrite: true });
  });

  React.useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (on) ring(); else silence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const toggle = () => {
    const next = !on;
    if (controlled === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? onLabel : label}
      onClick={toggle}
      onPointerEnter={nudge}
      layout
      transition={still ? { duration: 0 } : UNFURL}
      style={{ borderRadius: 999 }}
      whileTap={still ? undefined : { scale: 0.96 }}
      className={cn(
        "inline-flex h-11 cursor-pointer items-center overflow-hidden whitespace-nowrap text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2",
        on ? "gap-2.5 bg-surface pl-4 pr-5 text-ink shadow-sm ring-1 ring-ink/[.06]" : "gap-2 bg-ink/[0.07] pl-3.5 pr-4 text-ink/65 hover:bg-ink/[0.11]",
        className,
      )}
    >
      <motion.span layout="position" transition={still ? { duration: 0 } : UNFURL} className="grid">
        <svg ref={bell} viewBox="0 0 24 24" className="size-[18px] overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path data-wave d="M3.2 8.5a9 9 0 0 0 0 5" pathLength={1} strokeDasharray="1" />
          <path data-wave d="M20.8 8.5a9 9 0 0 1 0 5" pathLength={1} strokeDasharray="1" />
          <path data-wave d="M1 6.5a12.5 12.5 0 0 0 0 9" pathLength={1} strokeDasharray="1" />
          <path data-wave d="M23 6.5a12.5 12.5 0 0 1 0 9" pathLength={1} strokeDasharray="1" />
          <g data-clapper><path d="M10.2 19.4a1.9 1.9 0 0 0 3.6 0" /></g>
          <g data-body>
            <path d="M12 3v1" />
            <path d="M6.2 10.4a5.8 5.8 0 0 1 11.6 0c0 3.9 1.4 5.6 2.2 6.4H4c.8-.8 2.2-2.5 2.2-6.4Z" />
          </g>
          <path data-slash d="M4 3.5 20 20.5" pathLength={1} strokeDasharray="1" />
        </svg>
      </motion.span>
      <motion.span layout="position" transition={still ? { duration: 0 } : UNFURL} className="relative inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={on ? "on" : "off"}
            initial={still ? { opacity: 0 } : { opacity: 0, y: "60%", filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: "-60%", filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: GLIDE }}
          >
            {on ? onLabel : label}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
});
