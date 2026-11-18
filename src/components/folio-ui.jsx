/* Small motion helpers shared by every page, ported from the portfolio (same behaviour, same look):
   Reveal (fade + slide on scroll), BlurText (words rise out of a blur), TiltCard (3D tilt + glare),
   PillTabs (gliding pill) and SectionTitle. Opacity/transform only, so they stay cheap on phones. */
import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export function Reveal({ children, className = "", delay = 0, y = 34, x = 0, scale = 0.97, as = "div", once = true }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduce) { const T = as; return <T className={className}>{children}</T>; }
  return (
    <M className={className} initial={{ opacity: 0, y, x, scale }} whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: "0px 0px -9% 0px" }} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}

export function BlurText({ text, className = "", delay = 0, as: Tag = "span" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i, all) => (
        <motion.span key={i} aria-hidden className="inline-block whitespace-pre"
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(12px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{i < all.length - 1 ? w + " " : w}</motion.span>
      ))}
    </Tag>
  );
}

export function TiltCard({ children, className = "", max = 8 }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const gx = useMotionValue(50), gy = useMotionValue(50);
  const glare = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, rgb(255 255 255 / var(--glare, .4)), transparent 55%)`);
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; ry.set((px - 0.5) * max * 2); rx.set((0.5 - py) * max * 2); gx.set(100 - px * 100); gy.set(100 - py * 100); };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div onMouseMove={move} onMouseLeave={leave} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} className={`relative ${className}`}>
      {children}
      <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity [div:hover>&]:opacity-100" />
    </motion.div>
  );
}

export function PillTabs({ tabs, value, onChange, id = "tabs" }) {
  return (
    <div role="tablist" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink/[.06] p-1">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} onClick={() => onChange(t)} className="relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold min-[400px]:px-5 sm:text-sm">
          {value === t && <motion.span layoutId={id} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-ink/15 dark:shadow-none" />}
          <span className={`relative ${value === t ? "text-ink" : "text-ink/55"}`}>{t}</span>
        </button>
      ))}
    </div>
  );
}

export function SectionTitle({ title, sub }) {
  return (
    <div className="mb-7 max-w-2xl sm:mb-10">
      <BlurText as="h2" text={title} className="text-4xl font-extrabold sm:text-5xl" />
      {sub && <Reveal y={16} scale={1} delay={0.25}><p className="mt-3 text-lg text-ink/60">{sub}</p></Reveal>}
    </div>
  );
}
