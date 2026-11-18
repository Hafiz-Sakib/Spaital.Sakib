import { useState } from "react";
import { motion } from "framer-motion";
import { cp } from "../folio";
import { stats } from "../work";
import { Icon } from "../components/icons";
import { Odometer } from "../components/mb/odometer";
import { UsageRing } from "../components/mb/usage-ring";
import { Reveal } from "../components/folio-ui";
import Page from "./Page";

const LEVEL = [["Easy", "#34D399", "e"], ["Medium", "#FBBF24", "m"], ["Hard", "#F43F5E", "hd"]];
const solved = (p) => p.e + p.m + p.hd;
const PLAT = ["#7C6CF6", "#38BDF8", "#34D399", "#F59E0B"];

export default function Coding() {
  const [a, setA] = useState(0);
  const p = cp[a];
  const total = cp.reduce((s, x) => s + solved(x), 0);
  return (
    <Page id="coding" eyebrow="Coding" title="Problem solving, daily" typed={{ before: "Rated rounds and steady practice across", words: ["four platforms.", "hundreds of problems.", "every single week."] }}>
      {/* headline numbers on odometer wheels */}
      <Reveal y={24} scale={1}>
        <dl className="card grid grid-cols-2 divide-ink/10 sm:grid-cols-4 sm:divide-x [&>div:nth-child(n+3)]:border-t [&>div:nth-child(n+3)]:border-ink/10 sm:[&>div:nth-child(n+3)]:border-t-0">
          {stats.map((s) => (
            <div key={s.l} className="px-5 py-6 sm:px-7">
              <dt className="order-2 text-sm text-ink/55">{s.l}</dt>
              <dd className="mt-1 font-display text-4xl font-extrabold sm:text-5xl"><Odometer to={s.v} suffix={s.s} /></dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* proportional split of solved problems per platform */}
      <Reveal y={24} scale={1} delay={0.05} className="mt-6">
        <div className="card p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">Solved by platform</h2>
            <p className="font-display text-2xl font-bold"><Odometer to={total} /></p>
          </div>
          <div className="mt-5 flex h-4 gap-1 overflow-hidden rounded-full" aria-hidden>
            {cp.map((x, i) => <motion.span key={x.n} className="h-full rounded-full" style={{ background: PLAT[i] }} initial={{ flexGrow: 0 }} whileInView={{ flexGrow: solved(x) }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} />)}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            {cp.map((x, i) => (
              <li key={x.n} className="flex items-center gap-2 text-sm">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PLAT[i] }} />
                <span className="truncate text-ink/60">{x.n}</span>
                <span className="ml-auto font-semibold tabular-nums">{solved(x)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* one platform at a time: ring + breakdown */}
      <Reveal y={24} scale={1} delay={0.05} className="mt-6">
        <div className="card p-4 sm:p-6">
          <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full bg-ink/[.06] p-1">
            {cp.map((x, i) => (
              <button key={x.n} role="tab" aria-selected={a === i} onClick={() => setA(i)} className="relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold">
                {a === i && <motion.span layoutId="cp-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-surface shadow-sm" />}
                <span className={`relative flex items-center gap-2 ${a === i ? "text-ink" : "text-ink/55"}`}><Icon name={x.n} className="h-4 w-4" />{x.n}</span>
              </button>
            ))}
          </div>
          <motion.div key={p.n} initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }} className="grid items-center gap-8 px-2 py-8 sm:px-6 md:grid-cols-[auto_1fr]">
            <UsageRing key={p.n} segments={LEVEL.map(([, color, k]) => ({ value: p[k], color }))} size={210}>
              <div>
                <div className="font-display text-5xl font-extrabold"><Odometer to={solved(p)} /></div>
                <div className="text-sm text-ink/55">solved</div>
              </div>
            </UsageRing>
            <div>
              <a href={p.u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-display text-2xl font-bold hover:underline"><Icon name={p.n} className="h-6 w-6" />{p.n}<span aria-hidden className="text-lg">↗</span></a>
              <p className="text-sm text-ink/55">@{p.h}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-ink/[.07] px-3 py-1">Rating {p.r}</span>
                <span className="rounded-full bg-ink/[.07] px-3 py-1">{p.rk}</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {LEVEL.map(([label, color, k]) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: color }} />
                    <span className="w-16 text-ink/60">{label}</span>
                    <span className="font-semibold tabular-nums">{p[k]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </Reveal>
    </Page>
  );
}
