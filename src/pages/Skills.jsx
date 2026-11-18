import { skills } from "../folio";
import { Icon } from "../components/icons";
import { BlurAccordion } from "../components/mb/blur-accordion";
import { Reveal } from "../components/folio-ui";
import { motion } from "framer-motion";
import Page, { BG } from "./Page";

/* Skills as a blur accordion: one group open at a time, chips pop in when it opens. */
export default function Skills() {
  const items = skills.map(([title, c, list]) => ({
    id: title, title, count: list.length, hint: list.slice(0, 4).join(" · "),
    content: (
      <ul className="flex flex-wrap gap-2.5">
        {list.map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.08 + i * 0.045, type: "spring", stiffness: 380, damping: 24 }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${BG[c]}`}><Icon name={s} className="h-4 w-4" />{s}</motion.li>
        ))}
      </ul>
    ),
  }));
  return (
    <Page id="skills" eyebrow="Skills" title="What I work with" typed={{ before: "Web, algorithms and", words: ["machine learning.", "clean interfaces.", "solid backends."] }}>
      <Reveal y={24} scale={1}><BlurAccordion items={items} /></Reveal>
    </Page>
  );
}
