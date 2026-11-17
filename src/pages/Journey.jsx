import { useRef, useState } from "react";
import { LayoutGroup, motion, useScroll, useSpring } from "framer-motion";
import { certs, edu, jobs } from "../about";
import Page, { Reveal } from "./Page";

const TABS = [
  ["Education", edu, "sky"],
  ["Experience", jobs, "peach"],
  ["Certificates", certs, "lilac"],
];

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
                {it.u && <a href={it.u} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-ink/10 px-4 py-1.5 text-xs font-semibold transition hover:bg-ink/15">View certificate ↗</a>}
              </motion.div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Journey() {
  const [tab, setTab] = useState(0);
  const [name, items] = TABS[tab];
  return (
    <Page id="journey" eyebrow="Journey" title="Where I've been" sub="Studies, work and the courses along the way. Switch the tabs and scroll the line.">
      <LayoutGroup>
        <div role="tablist" className="mb-8 inline-flex rounded-full bg-ink/[.07] p-1">
          {TABS.map(([t, list], i) => (
            <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="relative rounded-full px-4 py-2 text-sm font-semibold sm:px-5">
              {tab === i && <motion.span layoutId="journey-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative ${tab === i ? "text-mist" : "text-ink/70"}`}>{t} <span className="opacity-60">{list.length}</span></span>
            </button>
          ))}
        </div>
      </LayoutGroup>
      <Timeline key={name} items={items} />
    </Page>
  );
}
