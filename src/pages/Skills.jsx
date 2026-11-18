import { useState } from "react";
import { motion } from "framer-motion";
import { skills } from "../folio";
import { Icon } from "../components/icons";
import { IntegrationHub } from "../components/mb/integration-hub";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

/* Skills: pick a group, its skills plug into the hub with data flowing along the wires. */
export default function Skills() {
  const [a, setA] = useState(0);
  const [title, c, list] = skills[a];
  const apps = list.map((s) => ({ id: s, name: s, tint: BG[c], icon: <Icon name={s} className="h-6 w-6" /> }));
  return (
    <Page id="skills" eyebrow="Skills" title="What I work with" typed={{ before: "Web, algorithms and", words: ["machine learning.", "clean interfaces.", "solid backends."] }}>
      <Reveal y={24} scale={1}>
        <div className="card p-4 sm:p-8">
          <div role="tablist" aria-label="Skill groups" className="flex gap-1 overflow-x-auto rounded-full bg-ink/[.06] p-1">
            {skills.map(([t], i) => (
              <button key={t} role="tab" aria-selected={a === i} onClick={() => setA(i)} className="relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold">
                {a === i && <motion.span layoutId="skill-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-surface shadow-sm" />}
                <span className={`relative ${a === i ? "text-ink" : "text-ink/55"}`}>{t}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 sm:mt-6">
            <IntegrationHub key={title} apps={apps} label={title} sub={`${list.length} skills`} />
          </div>
        </div>
      </Reveal>
    </Page>
  );
}
