import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { FaAward, FaBriefcase, FaGraduationCap } from "react-icons/fa6";
import { LuAward, LuCheck } from "react-icons/lu";
import { SiCoursera, SiHackerrank, SiUdemy } from "react-icons/si";
import { certs, edu, jobs } from "../about";
import { LiquidTabs } from "../components/mb/liquid-tabs";
import { ExpandList } from "../components/mb/cert-list";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const providerIcon = { Coursera: SiCoursera, Udemy: SiUdemy, HackerRank: SiHackerrank };
const providerTint = { Coursera: "sky", Udemy: "lilac", HackerRank: "mint", "Programming Hero": "peach" };

/* Roadmap steps: a bar fills down the left as you scroll, finished steps get a tick, the current one pulses. */
function Steps({ items }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 65%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <ol ref={ref} className="relative space-y-8">
      <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-[3px] rounded-full bg-ink/10" />
      <motion.span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-[3px] origin-top rounded-full bg-gradient-to-b from-violet-500 to-pink-500" style={{ scaleY: reduce ? 1 : fill }} />
      {items.map((r, i) => {
        const now = /present/i.test(r.p);
        return (
          <li key={r.t} className="relative grid grid-cols-[28px_1fr] gap-x-5 sm:grid-cols-[28px_9rem_1fr]">
            <span className="relative z-10 mt-0.5 grid h-7 w-7 place-items-center">
              {now && !reduce && <motion.span aria-hidden className="absolute h-7 w-7 rounded-full ring-2 ring-emerald-400" animate={{ scale: [1, 1.6], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
              <span className={`grid h-7 w-7 place-items-center rounded-full text-white ring-4 ring-surface ${now ? "bg-emerald-500" : "bg-gradient-to-br from-violet-500 to-pink-500"}`}>{now ? <span className="h-2 w-2 rounded-full bg-white" /> : <LuCheck aria-hidden className="h-4 w-4" />}</span>
            </span>
            <p className="col-start-2 text-sm font-semibold tabular-nums text-ink/50 sm:col-start-2 sm:pt-1">{r.p}{now && <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-xs text-ink">now</span>}</p>
            <div className="col-start-2 mt-1 sm:col-start-3 sm:mt-0">
              <h3 className="text-lg font-bold leading-snug sm:text-xl">{r.t}</h3>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{r.o}</p>
              {r.d && <p className="mt-2 max-w-xl text-ink/65">{r.d}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* A link counts as a certificate only if it is a personal certificate URL (Coursera share link, HackerRank certificate,
   Udemy /certificate/UC-...). Anything else is a public course page, so its button says "View course". */
const isCertUrl = (u = "") => /coursera\.org\/(share|verify)\/|hackerrank\.com\/certificates\/|udemy\.com\/certificate\/|\/certificate\//i.test(u);

/* Link fixes by certificate title (so src/about.js can stay as it is). Move these into about.js whenever you like. */
const LINKS = { "Supervised Machine Learning: Regression and Classification": "https://www.coursera.org/learn/machine-learning" };

function Certs() {
  const items = certs.map((c0, i) => {
    const c = LINKS[c0.t] ? { ...c0, u: LINKS[c0.t] } : c0;
    const Brand = providerIcon[c.o] || LuAward;
    const real = isCertUrl(c.u);
    return {
      id: `${i}-${c.t}`, title: c.t, meta: `${c.o} · ${c.p}`, tint: BG[providerTint[c.o] || "lemon"],
      icon: <Brand aria-hidden className="h-5 w-5" />,
      detail: real ? `Certificate issued by ${c.o}, ${c.p}.` : `${c.o} course, ${c.p}.`,
      href: c.u, cta: real ? "View certificate" : "View course", outline: !real,
    };
  });
  return <ExpandList items={items} />;
}

const TABS = [
  { id: "edu", label: "Education", icon: FaGraduationCap },
  { id: "cert", label: "Certificates", icon: FaAward },
  { id: "exp", label: "Experience", icon: FaBriefcase },
];

export default function Journey() {
  const [tab, setTab] = useState("edu");
  return (
    <Page id="journey" eyebrow="Journey" title="Where I've been" typed={{ before: "One scroll through my", words: ["studies.", "certificates.", "experience."] }}>
      <Reveal y={24} scale={1}>
        <LiquidTabs tabs={TABS} value={tab} onChange={setTab}>
          <motion.div key={tab} initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }}>
            {tab === "edu" && <Steps items={edu} />}
            {tab === "exp" && <Steps items={jobs} />}
            {tab === "cert" && <Certs />}
          </motion.div>
        </LiquidTabs>
      </Reveal>
    </Page>
  );
}
