import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FaArrowUpRightFromSquare, FaAward, FaBriefcase, FaGraduationCap } from "react-icons/fa6";
import { certs, edu, jobs } from "../about";
import Page, { BG, Reveal } from "./Page";

const providerTint = { Coursera: "sky", Udemy: "lilac", HackerRank: "mint", "Programming Hero": "peach" };

/* A heading for each block of the journey */
function Block({ id, Icon, title, count, tint, children }) {
  return (
    <section id={id} className="mb-14 scroll-mt-28 last:mb-0 sm:mb-20">
      <Reveal>
        <div className="mb-6 flex items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${BG[tint]}`}><Icon aria-hidden className="h-5 w-5" /></span>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
          <span className="rounded-full bg-ink/[.07] px-3 py-1 text-xs font-semibold text-ink/60">{count}</span>
        </div>
      </Reveal>
      {children}
    </section>
  );
}

function Timeline({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <div ref={ref} className="relative pl-8 sm:pl-10">
      <div className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-ink/10 sm:left-[11px]" />
      <motion.div style={{ scaleY: grow, transformOrigin: "top" }} className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-gradient-to-b from-violet-500 to-pink-500 sm:left-[11px]" />
      <ul className="space-y-5">
        {items.map((it, i) => (
          <li key={it.t} className="relative">
            <span className="absolute -left-8 top-6 h-5 w-5 rounded-full border-4 border-mist bg-violet-500 sm:-left-10 sm:h-6 sm:w-6" />
            <Reveal delay={Math.min(i, 3) * 0.05}>
              <motion.div whileHover={{ y: -3 }} className="card p-5 sm:p-6">
                <span className="inline-block rounded-full bg-ink/[.07] px-3 py-1 text-xs font-semibold text-ink/65">{it.p}</span>
                <h3 className="mt-3 text-lg font-bold leading-snug sm:text-xl">{it.t}</h3>
                <p className="text-sm font-semibold text-ink/60">{it.o}</p>
                {it.d && <p className="mt-2 text-sm leading-relaxed text-ink/70">{it.d}</p>}
              </motion.div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertGrid({ items }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((c, i) => (
        <li key={c.t}>
          <Reveal delay={(i % 2) * 0.06} className="h-full">
            <a href={c.u} target="_blank" rel="noreferrer" className="card group flex h-full flex-col p-5 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full ${BG[providerTint[c.o]] || "bg-lemon"} px-3 py-1 text-xs font-semibold`}>{c.o}</span>
                <span className="text-xs font-semibold tabular-nums text-ink/50">{c.p}</span>
              </div>
              <h3 className="mt-4 text-base font-bold leading-snug group-hover:underline sm:text-lg">{c.t}</h3>
              {c.u && <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-ink/60 transition-colors group-hover:text-ink">View certificate <FaArrowUpRightFromSquare aria-hidden className="h-2.5 w-2.5" /></span>}
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/* No tabs: three blocks one after another, scroll down through them. */
export default function Journey() {
  return (
    <Page id="journey" eyebrow="Journey" title="Where I've been" sub="Studies, certificates and work, one scroll from top to bottom.">
      <Block id="education" Icon={FaGraduationCap} title="Education" count={edu.length} tint="sky"><Timeline items={edu} /></Block>
      <Block id="certificates" Icon={FaAward} title="Certificates" count={certs.length} tint="lilac"><CertGrid items={certs} /></Block>
      <Block id="experience" Icon={FaBriefcase} title="Experience" count={jobs.length} tint="peach"><Timeline items={jobs} /></Block>
    </Page>
  );
}
