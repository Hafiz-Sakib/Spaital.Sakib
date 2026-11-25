import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { PAGES, go, href } from "../router";
import { BlurText, Reveal } from "../components/folio-ui";
import { BackspaceText } from "../components/backspace-text";
import { useAutoReveal } from "../hooks/useAutoReveal";

export const BG = {
  lilac: "bg-lilac",
  mint: "bg-mint",
  peach: "bg-peach",
  sky: "bg-sky",
  lemon: "bg-lemon",
};

/* Fades + slides when scrolled into view (portfolio version: x / y / scale / delay props) */
export { Reveal };

/* Number counts up when it appears; pass `key` to replay it */
export function CountUp({ to, suffix = "", className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    const c = animate(0, to, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => c.stop();
  }, [seen, to]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/* Shared frame of every extra page: title, content, and a link to the next page */
export default function Page({ id, eyebrow, title, sub, typed, children }) {
  useAutoReveal(id);
  const i = PAGES.findIndex((p) => p.id === id);
  const next = PAGES[(i + 1) % PAGES.length];
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl px-4 pb-32 pt-28 sm:px-6 sm:pt-32 lg:pb-24 lg:pr-24"
    >
      <header className="mb-10 sm:mb-14">
        <p className="mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-semibold leading-none sm:text-6xl">
          <BlurText text={title} />
          <span className="bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            .
          </span>
        </h1>
        {typed ? (
          <Reveal y={16} scale={1} delay={0.25}>
            <p className="mt-3 min-h-[3.2rem] max-w-xl text-lg text-ink/65 sm:min-h-0 sm:text-xl">
              <BackspaceText
                before={typed.before}
                words={typed.words}
                caretClassName="text-violet-500"
              />
            </p>
          </Reveal>
        ) : (
          sub && (
            <Reveal y={16} scale={1} delay={0.25}>
              <p className="mt-3 max-w-xl text-ink/65">{sub}</p>
            </Reveal>
          )
        )}
      </header>
      {children}
      <nav data-reveal="up" className="mt-16 flex items-center justify-between gap-3 border-t border-ink/10 pt-6 text-sm font-semibold">
        <a
          href={href("home")}
          onClick={go("home")}
          className="rounded-full bg-ink/10 px-5 py-2.5 transition hover:-translate-y-0.5"
        >
          ← Photos
        </a>
        <a
          href={href(next.id)}
          onClick={go(next.id)}
          className="rounded-full bg-ink px-5 py-2.5 text-mist transition hover:-translate-y-0.5"
        >
          Next: {next.label} →
        </a>
      </nav>
    </motion.main>
  );
}
