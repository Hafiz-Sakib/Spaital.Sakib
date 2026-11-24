import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { work } from "../work";
import { skills } from "../folio";
import { Icon } from "../components/icons";
import { DuoFlip } from "../components/mb/duo-flip";
import { IntegrationHub } from "../components/mb/integration-hub";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const link =
  "underline decoration-ink/30 underline-offset-4 hover:decoration-ink";

/* Skills (moved here from the old Skills page): pick a group, its skills plug into the hub with data flowing along the wires. */
function SkillsBlock() {
  const [g, setG] = useState(0);
  const [title, c, list] = skills[g];
  const apps = list.map((s) => ({
    id: s,
    name: s,
    tint: BG[c],
    icon: <Icon name={s} className="h-6 w-6" />,
  }));
  return (
    <Reveal y={24} scale={1}>
      <div className="card p-4 sm:p-8">
        <div
          role="tablist"
          aria-label="Skill groups"
          className="flex items-center gap-1 overflow-x-auto rounded-full bg-ink/6 p-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {skills.map(([t], i) => (
            <button
              key={t}
              role="tab"
              aria-selected={g === i}
              onClick={() => setG(i)}
              className="relative inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ink/40 sm:flex-1 sm:px-3"
            >
              {g === i && (
                <motion.span
                  layoutId="skill-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-surface shadow-sm"
                />
              )}
              <span className={`relative ${g === i ? "text-ink" : "text-ink/55"}`}>
                {t}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 sm:mt-6">
          <IntegrationHub
            key={title}
            apps={apps}
            label={title}
            sub={`${list.length} skills`}
          />
        </div>
      </div>
    </Reveal>
  );
}

/* Skills first, then the project showcase: DuoFlip turns the screenshot like a page, the project's details sit underneath. */
export default function Projects() {
  const [a, setA] = useState(0);
  const p = work[a];
  const images = useMemo(
    () =>
      work.map((x) => ({
        src: `/work/${x.img}-hd.webp`,
        alt: `${x.title} screenshot`,
        label: x.title,
      })),
    [],
  );
  return (
    <Page
      id="projects"
      eyebrow="Skills & Projects"
      title="What I work with"
      typed={{
        before: "Web, algorithms and",
        words: ["machine learning.", "clean interfaces.", "solid backends."],
      }}
    >
      <SkillsBlock />
      <Reveal y={24} scale={1}>
        <h2 className="mb-1 mt-16 font-display text-3xl font-semibold sm:mt-20 sm:text-4xl">
          Things I've shipped
        </h2>
        <p className="mb-6 text-ink/65">
          Ten projects. Turn the page to see learning apps, dev tools and
          full-stack platforms.
        </p>
      </Reveal>
      <Reveal y={24} scale={1}>
        <div className="card p-3 sm:p-4">
          <DuoFlip images={images} index={a} onIndex={setA} />
          <AnimatePresence mode="wait">
            <motion.article
              key={p.title}
              aria-live="polite"
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.25 }}
              className="grid gap-5 p-3 pt-6 sm:p-5 sm:pt-7 md:grid-cols-[1.1fr_1fr] md:gap-10"
            >
              <div>
                <p className="text-sm font-semibold tabular-nums text-ink/40">
                  {String(a + 1).padStart(2, "0")} /{" "}
                  {String(work.length).padStart(2, "0")} · {p.kind}
                </p>
                <h3 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-xl text-ink/70">{p.desc}</p>
              </div>
              <div className="md:self-end">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${BG[p.c]}`}
                    >
                      <Icon name={t} className="h-3 w-3" />
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-4 text-sm font-semibold">
                  <a
                    className={`${link} inline-flex items-center gap-1.5`}
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="Website" className="h-4 w-4" mono />
                    Live site
                  </a>
                  <a
                    className={`${link} inline-flex items-center gap-1.5`}
                    href={p.gh}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="GitHub" className="h-4 w-4" mono />
                    Source code
                  </a>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </Reveal>
    </Page>
  );
}
