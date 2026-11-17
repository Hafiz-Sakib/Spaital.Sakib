import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { skills } from "../about";
import { Icon } from "../components/icons";
import Page, { BG } from "./Page";

const total = skills.reduce((n, s) => n + s[2].length, 0);

export default function Skills() {
  const [sel, setSel] = useState("All");
  const [hot, setHot] = useState(null); // {name, group}
  const shown = sel === "All" ? skills : skills.filter((s) => s[0] === sel);
  const tabs = ["All", ...skills.map((s) => s[0])];

  return (
    <Page id="skills" eyebrow="Skills" title="What I work with" sub="Web, algorithms and a growing machine learning toolkit. Pick a group, then hover or tap a skill.">
      {/* spotlight */}
      <div className="card mb-6 flex min-h-28 items-center gap-5 p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={hot ? hot.name : "idle"} initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -8 }} transition={{ duration: 0.2 }} className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink/[.06]">
              {hot ? <Icon name={hot.name} className="h-9 w-9" /> : <span className="font-display text-2xl font-bold">{total}</span>}
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">{hot ? hot.name : "Tools & topics"}</div>
              <div className="text-sm text-ink/60">{hot ? `in ${hot.group}` : `${skills.length} areas · hover or tap any skill`}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <LayoutGroup>
        <div role="tablist" className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={sel === t} onClick={() => setSel(t)} className="relative rounded-full px-4 py-2 text-sm font-semibold">
              {sel === t && <motion.span layoutId="skill-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative ${sel === t ? "text-mist" : "text-ink/70"}`}>{t}</span>
            </button>
          ))}
        </div>

        <motion.div layout className={`grid gap-4 ${shown.length > 1 ? "sm:grid-cols-2" : ""}`}>
          <AnimatePresence mode="popLayout">
            {shown.map(([title, c, list], gi) => (
              <motion.section key={title} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: gi * 0.03 }} className="card p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xl font-bold">{title}</h2>
                  <span className="text-xs font-semibold text-ink/45">{list.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <motion.button key={s} whileHover={{ y: -3, scale: 1.05 }} whileTap={{ scale: 0.94 }} onMouseEnter={() => setHot({ name: s, group: title })} onFocus={() => setHot({ name: s, group: title })} onClick={() => setHot({ name: s, group: title })} className={`inline-flex items-center gap-1.5 rounded-full ${BG[c]} px-3.5 py-2 text-sm font-semibold`}>
                      <Icon name={s} className="h-4 w-4" />{s}
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </Page>
  );
}
