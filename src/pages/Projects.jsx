import { useMemo } from "react";
import { work } from "../work";
import { Icon } from "../components/icons";
import { ProjectIndex } from "../components/mb/project-index";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const link = "underline decoration-ink/30 underline-offset-4 hover:decoration-ink";

/* Project index: big typographic list, the hovered project's screenshot swaps in on the right. */
export default function Projects() {
  const items = useMemo(() => work.map((p) => ({
    id: p.img, title: p.title, kind: p.kind, img: `/work/${p.img}.webp`, alt: `${p.title} screenshot`,
    children: (
      <>
        <p className="text-sm font-semibold text-ink/45">{p.kind}</p>
        <h3 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{p.title}</h3>
        <p className="mt-2 text-ink/70">{p.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.map((t) => <span key={t} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${BG[p.c]}`}><Icon name={t} className="h-3 w-3" />{t}</span>)}
        </div>
        <div className="mt-4 flex gap-4 text-sm font-semibold">
          <a className={link} href={p.live} target="_blank" rel="noreferrer">Live site</a>
          <a className={`${link} inline-flex items-center gap-1.5`} href={p.gh} target="_blank" rel="noreferrer"><Icon name="GitHub" className="h-4 w-4" mono />Source code</a>
        </div>
      </>
    ),
  })), []);
  return (
    <Page id="projects" eyebrow="Projects" title="Things I've shipped" typed={{ before: "Ten projects. Hover a title to see", words: ["learning apps.", "dev tools.", "full-stack platforms."] }}>
      <Reveal y={24} scale={1}><ProjectIndex items={items} label="Projects" /></Reveal>
    </Page>
  );
}
