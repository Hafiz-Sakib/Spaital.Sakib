import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cp, stats } from "../about";
import { Icon } from "../components/icons";
import Page, { BG, CountUp, Reveal } from "./Page";

const LEVELS = [["Easy", "e", "bg-emerald-400"], ["Medium", "m", "bg-amber-400"], ["Hard", "hd", "bg-rose-400"]];

export default function Coding() {
  const [i, setI] = useState(0);
  const p = cp[i];
  const solved = p.e + p.m + p.hd;
  const numeric = /^\d+$/.test(p.r);

  return (
    <Page id="coding" eyebrow="Coding" title="By the numbers" sub="Problem solving keeps the fundamentals sharp. Tap a platform to see how the solves break down.">
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((x, n) => (
          <Reveal key={x.l} delay={n * 0.06}>
            <div className="card p-5">
              <div className="font-display text-3xl font-bold sm:text-4xl"><CountUp to={x.v} suffix={x.s} /></div>
              <div className="mt-1 text-xs text-ink/55">{x.l}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div role="tablist" className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cp.map((x, n) => (
          <motion.button key={x.n} role="tab" aria-selected={i === n} onClick={() => setI(n)} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className={`card flex flex-col items-start gap-2 p-4 text-left transition-shadow ${i === n ? "ring-2 ring-ink" : ""}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${BG[x.c]}`}><Icon name={x.n} className="h-5 w-5" /></span>
            <span className="text-sm font-bold leading-tight">{x.n}</span>
            <span className="text-xs text-ink/50">@{x.h}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={p.n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-ink/55">{p.n} · {numeric ? "rating" : "badge"}</div>
              <div className="font-display text-6xl font-bold leading-none sm:text-7xl">{numeric ? <CountUp to={Number(p.r)} /> : p.r}</div>
              <div className={`mt-3 inline-block rounded-full ${BG[p.c]} px-3 py-1 text-xs font-semibold`}>{p.rk}</div>
            </div>
            <a href={p.u} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-mist transition hover:-translate-y-0.5">Open profile ↗</a>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between text-sm"><span className="font-semibold">Problems solved</span><span className="font-display text-2xl font-bold"><CountUp to={solved} /></span></div>
            <div className="flex h-4 overflow-hidden rounded-full bg-ink/10">
              {LEVELS.map(([l, k, c], n) => (
                <motion.div key={l} title={`${l}: ${p[k]}`} className={`${c} h-full`} initial={{ width: 0 }} animate={{ width: `${(p[k] / solved) * 100}%` }} transition={{ duration: 0.9, delay: 0.1 + n * 0.12, ease: [0.22, 1, 0.36, 1] }} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {LEVELS.map(([l, k, c]) => (
                <div key={l} className="rounded-2xl bg-ink/[.05] p-3">
                  <div className="flex items-center gap-2 text-xs text-ink/60"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{l}</div>
                  <div className="mt-1 font-display text-2xl font-bold">{p[k]}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Page>
  );
}
