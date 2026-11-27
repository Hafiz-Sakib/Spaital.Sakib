import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  FaAward,
  FaBriefcase,
  FaFileLines,
  FaGraduationCap,
} from "react-icons/fa6";
import { LuAward, LuCheck } from "react-icons/lu";
import { SiCoursera, SiHackerrank, SiUdemy } from "react-icons/si";
import { certs, edu, jobs, pubs } from "../about";
import { ExpandList } from "../components/mb/cert-list";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const providerIcon = {
  Coursera: SiCoursera,
  Udemy: SiUdemy,
  HackerRank: SiHackerrank,
};
const providerTint = {
  Coursera: "sky",
  Udemy: "lilac",
  HackerRank: "mint",
  "Programming Hero": "peach",
};

/* Roadmap steps: a bar fills down the left as you scroll, finished steps get a tick, the current one pulses. */
function Steps({ items }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 65%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  return (
    <ol ref={ref} className="relative space-y-8">
      <span
        aria-hidden
        className="absolute bottom-3 left-3.25 top-3 w-0.75 rounded-full bg-ink/10"
      />
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-3.25 top-3 w-0.75 origin-top rounded-full bg-linear-to-b from-violet-500 to-pink-500"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      {items.map((r, i) => {
        const now = /present/i.test(r.p);
        return (
          <li
            key={r.t}
            className="relative grid grid-cols-[28px_1fr] gap-x-5 sm:grid-cols-[28px_9rem_1fr]"
          >
            <span className="relative z-10 mt-0.5 grid h-7 w-7 place-items-center">
              {now && !reduce && (
                <motion.span
                  aria-hidden
                  className="absolute h-7 w-7 rounded-full ring-2 ring-emerald-400"
                  animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-white ring-4 ring-surface ${now ? "bg-emerald-500" : "bg-linear-to-br from-violet-500 to-pink-500"}`}
              >
                {now ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : (
                  <LuCheck aria-hidden className="h-4 w-4" />
                )}
              </span>
            </span>
            <p className="col-start-2 text-sm font-semibold tabular-nums text-ink/50 sm:col-start-2 sm:pt-1">
              {r.p}
              {now && (
                <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-xs text-ink">
                  now
                </span>
              )}
            </p>
            <div className="col-start-2 mt-1 sm:col-start-3 sm:mt-0">
              <h3 className="text-lg font-bold leading-snug sm:text-xl">
                {r.t}
              </h3>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                {r.o}
              </p>
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
const isCertUrl = (u = "") =>
  /coursera\.org\/(share|verify)\/|hackerrank\.com\/certificates\/|udemy\.com\/certificate\/|\/certificate\//i.test(
    u,
  );

/* Link fixes by certificate title (so src/about.js can stay as it is). Move these into about.js whenever you like. */
const LINKS = {
  "Supervised Machine Learning: Regression and Classification":
    "https://www.coursera.org/learn/machine-learning",
};

function Certs() {
  const items = certs.map((c0, i) => {
    const c = LINKS[c0.t] ? { ...c0, u: LINKS[c0.t] } : c0;
    const Brand = providerIcon[c.o] || LuAward;
    const real = isCertUrl(c.u);
    return {
      id: `${i}-${c.t}`,
      title: c.t,
      meta: `${c.o} · ${c.p}`,
      tint: BG[providerTint[c.o] || "lemon"],
      icon: <Brand aria-hidden className="h-5 w-5" />,
      detail: real
        ? `Certificate issued by ${c.o}, ${c.p}.`
        : `${c.o} course, ${c.p}.`,
      href: c.u,
      cta: real ? "View certificate" : "View course",
      outline: !real,
    };
  });
  return <ExpandList items={items} />;
}

function Pubs() {
  const items = pubs.map((x, i) => ({
    id: `${i}-${x.t}`,
    title: x.t,
    meta: `${x.c} · ${x.o} · ${x.s}`,
    tint: BG.lemon,
    icon: <FaFileLines aria-hidden className="h-5 w-5" />,
    href: x.u,
    cta: "View conference",
    outline: true,
    body: (
      <div className="w-full">
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{x.d}</p>
        <ul className="mt-3 space-y-1.5 text-sm leading-6 text-ink/50">
          <li className="font-semibold text-ink/75">
            {x.v} · Paper ID {x.id}
          </li>
          <li>
            {x.venue} · {x.date} · {x.mode}
          </li>
        </ul>
      </div>
    ),
  }));
  return <ExpandList items={items} />;
}

const SECTIONS = [
  {
    id: "edu",
    label: "Education",
    icon: FaGraduationCap,
    body: () => <Steps items={edu} />,
  },
  {
    id: "pub",
    label: "Journals & Publications",
    icon: FaFileLines,
    body: () => <Pubs />,
  },
  {
    id: "cert",
    label: "Certificates & Courses",
    icon: FaAward,
    body: () => <Certs />,
  },
  {
    id: "exp",
    label: "Experience",
    icon: FaBriefcase,
    body: () => <Steps items={jobs} />,
  },
];

/* All four sections one after another (no tabs), each one fully expanded. */
export default function Journey() {
  return (
    <Page
      id="journey"
      eyebrow="Journey"
      title="Where I've been"
      typed={{
        before: "One scroll through my",
        words: ["studies.", "research.", "certificates.", "experience."],
      }}
    >
      <div className="space-y-12 sm:space-y-16">
        {SECTIONS.map(({ id, label, icon: Icon, body }) => (
          <section key={id} id={id} aria-labelledby={`${id}-h`}>
            <Reveal y={24} scale={1}>
              <h2
                id={`${id}-h`}
                className="mb-4 flex items-center gap-2.5 px-1 font-display text-xl font-bold sm:text-2xl"
              >
                <Icon aria-hidden className="h-5 w-5 text-ink/60" />
                {label}
              </h2>
              <div
                data-glow
                className="rounded-4xl bg-surface p-5 shadow-[0_12px_40px_-12px_rgba(20,21,26,.12)] sm:p-8"
              >
                {body()}
              </div>
            </Reveal>
          </section>
        ))}
      </div>
    </Page>
  );
}
