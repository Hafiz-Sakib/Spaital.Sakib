import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { FaArrowUpRightFromSquare, FaAward, FaBookOpen, FaBriefcase, FaFlask, FaGraduationCap, FaLaptopCode } from "react-icons/fa6";
import { LuAward, LuBriefcase, LuBuilding2, LuCalendarDays, LuCode, LuPresentation, LuSchool } from "react-icons/lu";
import { SiCoursera, SiHackerrank, SiUdemy } from "react-icons/si";
import { certs, edu, jobs } from "../about";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

/* Portfolio look: a spine that fills as you scroll, nodes that swell into gradient icon tiles,
   present-day roles with a live dot, certificate cards with the provider's logo. */
const eduIcons = [FaLaptopCode, FaFlask, FaBookOpen]; // degree, HSC science group, SSC science group
const eduGrad = [["#8B7CF8", "#6D5BEF"], ["#34D399", "#10B981"], ["#FBA05B", "#F97316"]];
const jobGrad = [["#F472B6", "#E0457B"], ["#38BDF8", "#0EA5E9"], ["#FBBF24", "#F59E0B"]];
const providerIcon = { Coursera: SiCoursera, Udemy: SiUdemy, HackerRank: SiHackerrank }; // Programming Hero has no brand icon -> award icon
const providerTint = { Coursera: "sky", Udemy: "lilac", HackerRank: "mint", "Programming Hero": "peach" };
// One icon per role: intern/engineer, frontend developer, instructor (falls back to a briefcase)
const roleIcon = (t) => (/intern|engineer/i.test(t) ? LuBriefcase : /front|develop/i.test(t) ? LuCode : /instruct|teach/i.test(t) ? LuPresentation : LuBriefcase);

/* A heading for each block of the journey */
function Block({ id, Icon, title, count, tint, children }) {
  return (
    <section id={id} className="mb-14 scroll-mt-28 last:mb-0 sm:mb-20">
      <Reveal x={-20} y={0}>
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

/* A node on the spine: a quiet dot that swells into an icon tile when the line reaches it */
function Node({ on, Icon, grad, reduce }) {
  const spring = reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 20 };
  return (
    <span aria-hidden className="absolute left-0 top-5 grid h-10 w-10 place-items-center">
      <motion.span className="absolute h-3 w-3 rounded-full bg-ink/20" initial={false} animate={{ scale: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={{ duration: reduce ? 0 : 0.2 }} />
      <motion.span className="absolute grid h-10 w-10 place-items-center rounded-full text-white ring-4 ring-mist" style={{ background: `linear-gradient(145deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 8px 18px -6px ${grad[1]}aa` }} initial={false} animate={{ scale: on ? 1 : 0 }} transition={spring}>
        <Icon className="h-[18px] w-[18px]" />
      </motion.span>
    </span>
  );
}

function TimelineItem({ r, Icon, grad, reduce, school }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -40% 0px" });
  const now = /present/i.test(r.p);
  const Org = school ? LuSchool : LuBuilding2;
  return (
    <li ref={ref} className="relative pl-14 sm:pl-16">
      <Node on={reduce || seen} Icon={Icon} grad={grad} reduce={reduce} />
      <div className="card flex flex-col gap-1 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{r.t}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400"><Org aria-hidden className="h-4 w-4 shrink-0" />{r.o}</p>
          {r.d && <p className="mt-2 max-w-xl text-ink/65">{r.d}</p>}
        </div>
        <span className={`mt-2 inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-semibold sm:mt-0 ${now ? "bg-mint" : "bg-ink/[.06]"}`}>
          {now ? <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" /> : <LuCalendarDays aria-hidden className="h-3.5 w-3.5 text-ink/55" />}
          {r.p}
        </span>
      </div>
    </li>
  );
}

/* Rows hang off a spine that fills as you scroll */
function Timeline({ items, icons, grads, school }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <div className="relative">
      <div aria-hidden className="absolute bottom-10 left-[19px] top-10 w-[2px] overflow-hidden rounded-full bg-ink/10">
        <motion.div className="h-full w-full origin-top bg-gradient-to-b from-violet-500 via-emerald-500 to-orange-400" style={{ scaleY: reduce ? 1 : fill }} />
      </div>
      <ul ref={ref} className="space-y-4">
        {items.map((r, i) => (
          <TimelineItem key={r.t} r={r} reduce={reduce} school={school} Icon={icons ? icons[i % icons.length] : roleIcon(r.t)} grad={grads[i % grads.length]} />
        ))}
      </ul>
    </div>
  );
}

function CertCard({ r, i }) {
  const tint = providerTint[r.o] || "lemon";
  const Brand = providerIcon[r.o] || LuAward;
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full ${BG[tint]} px-3 py-1 text-sm font-semibold`}><Brand aria-hidden className="h-3.5 w-3.5" />{r.o}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink/50"><LuCalendarDays aria-hidden className="h-3.5 w-3.5" />{r.p}</span>
      </div>
      <h4 className="mt-5 flex items-start gap-2.5 font-display text-lg font-bold leading-snug tracking-tight group-hover:underline"><LuAward aria-hidden className="mt-1 h-[18px] w-[18px] shrink-0 text-ink/45" />{r.t}</h4>
      {r.u && (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition-colors group-hover:text-ink">
          View certificate
          <FaArrowUpRightFromSquare aria-hidden className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
        </span>
      )}
    </>
  );
  return (
    <motion.li initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.5, delay: (i % 2) * 0.07, ease: [0.22, 1, 0.36, 1] }}>
      {r.u
        ? <a href={r.u} target="_blank" rel="noreferrer" className="card group flex h-full flex-col p-5">{body}</a>
        : <div className="card group flex h-full flex-col p-5">{body}</div>}
    </motion.li>
  );
}

/* No tabs: three blocks one after another, scroll down through them. */
export default function Journey() {
  return (
    <Page id="journey" eyebrow="Journey" title="Where I've been" typed={{ before: "One scroll through my", words: ["studies.", "certificates.", "experience."] }}>
      <Block id="education" Icon={FaGraduationCap} title="Education" count={edu.length} tint="sky"><Timeline items={edu} icons={eduIcons} grads={eduGrad} school /></Block>
      <Block id="certificates" Icon={FaAward} title="Certificates" count={certs.length} tint="lilac">
        <ul className="grid gap-3 sm:grid-cols-2">{certs.map((c, i) => <CertCard key={c.t} r={c} i={i} />)}</ul>
      </Block>
      <Block id="experience" Icon={FaBriefcase} title="Experience" count={jobs.length} tint="peach"><Timeline items={jobs} grads={jobGrad} /></Block>
    </Page>
  );
}
