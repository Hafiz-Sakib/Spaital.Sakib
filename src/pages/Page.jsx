import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { PAGES, href } from "../router";

export const BG = { lilac: "bg-lilac", mint: "bg-mint", peach: "bg-peach", sky: "bg-sky", lemon: "bg-lemon" };

/* Fades + rises when scrolled into view */
export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* Number counts up when it appears; pass `key` to replay it */
export function CountUp({ to, suffix = "", className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    const c = animate(0, to, { duration: 1.3, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref} className={className}>{n.toLocaleString()}{suffix}</span>;
}

/* Shared frame of every extra page: title, content, and a link to the next page */
export default function Page({ id, eyebrow, title, sub, children }) {
  const i = PAGES.findIndex((p) => p.id === id);
  const next = PAGES[(i + 1) % PAGES.length];
  return (
    <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-5xl px-4 pb-32 pt-28 sm:px-6 sm:pt-32 lg:pb-24 lg:pr-24">
      <header className="mb-10 sm:mb-14">
        <p className="mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70">{eyebrow}</p>
        <h1 className="font-display text-4xl font-semibold leading-[1] sm:text-6xl">{title}<span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">.</span></h1>
        <p className="mt-3 max-w-xl text-ink/65">{sub}</p>
      </header>
      {children}
      <nav className="mt-16 flex items-center justify-between gap-3 border-t border-ink/10 pt-6 text-sm font-semibold">
        <a href={href("home")} className="rounded-full bg-ink/10 px-5 py-2.5 transition hover:-translate-y-0.5">← Photos</a>
        <a href={href(next.id)} className="rounded-full bg-ink px-5 py-2.5 text-mist transition hover:-translate-y-0.5">Next: {next.label} →</a>
      </nav>
    </motion.main>
  );
}
