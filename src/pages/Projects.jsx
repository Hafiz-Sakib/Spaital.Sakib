import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { work } from "../work";
import { Icon } from "../components/icons";
import { DuoFlip } from "../components/mb/duo-flip";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const link =
  "underline decoration-ink/30 underline-offset-4 hover:decoration-ink";

/* Project showcase: DuoFlip turns the screenshot like a page, the project's details sit underneath. */
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
      eyebrow="Projects"
      title="Things I've shipped"
      typed={{
        before: "Ten projects. Turn the page to see",
        words: ["learning apps.", "dev tools.", "full-stack platforms."],
      }}
    >
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
                    className={link}
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                  >
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
