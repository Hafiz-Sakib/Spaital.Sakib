import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { work } from "../work";
import { RibbonGallery } from "../components/RibbonGallery";
import { TiltCarousel } from "../components/tilt-carousel";
import { Icon } from "../components/icons";
import { useMedia } from "../hooks/useMedia";
import { useDark } from "../theme";
import { Reveal } from "../components/folio-ui";
import Page, { BG } from "./Page";

const link = "underline decoration-ink/30 underline-offset-4 hover:decoration-ink";

export default function Projects() {
  const dark = useDark();
  const [a, setA] = useState(0);
  const p = work[a];
  const phone = useMedia("(max-width: 639px)");
  const tiny = useMedia("(max-width: 359px)");
  const tablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  // Desktop / tablet: 3D ribbon. Phones: tilt carousel (sharper, lighter).
  const size = tablet ? { w: 380, h: 250, drift: 55, blur: 8, slices: 24, cls: "h-[560px]" } : { w: 480, h: 310, drift: 70, blur: 20, slices: 20, cls: "h-[78vh] max-h-[820px] min-h-[520px]" };
  const items = useMemo(() => work.map((x) => ({ src: `/work/${x.img}.webp`, hd: `/work/${x.img}-hd.webp`, title: x.title, alt: `${x.title} screenshot`, href: x.live, w: x.w, h: x.h })), []);

  return (
    <Page id="projects" eyebrow="Projects" title="Things I've shipped" sub="Ten projects, from offline learning apps to full-stack platforms. Drag the ribbon, then hover or tap a screenshot to see the project.">
      <Reveal scale={0.94} y={50}>
        <div className="card overflow-hidden p-3">
          <div className="overflow-hidden rounded-[1.4rem] bg-mist">
            {phone ? (
              <TiltCarousel items={items} onActive={setA} cardWidth={tiny ? 230 : 270} cardHeight={tiny ? 150 : 175} speed={3} delay={1.5} label="Project screenshot carousel" className="py-6" />
            ) : (
              <RibbonGallery items={items} onActive={setA} angle={-10} blur={size.blur} drift={size.drift} wave={1} slices={size.slices} momentum={0.8} cardWidth={size.w} cardHeight={size.h} wheel={false} dimColor={dark ? "rgb(14 15 26)" : "rgb(243 244 247)"} label="Project screenshot ribbon" className={size.cls} />
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.article key={p.title} aria-live="polite" initial={{ opacity: 0, y: 8, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.25 }} className="grid gap-5 p-4 pt-6 sm:p-6 sm:pt-7 md:grid-cols-[1.1fr_1fr] md:gap-10">
              <div>
                <p className="text-sm font-semibold tabular-nums text-ink/40">{String(a + 1).padStart(2, "0")} / {String(work.length).padStart(2, "0")} · {p.kind}</p>
                <h3 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{p.title}</h3>
                <p className="mt-3 max-w-xl text-ink/70">{p.desc}</p>
              </div>
              <div className="md:self-end">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => <span key={t} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${BG[p.c]}`}><Icon name={t} className="h-3 w-3" />{t}</span>)}
                </div>
                <div className="mt-5 flex gap-4 text-sm font-semibold">
                  <a className={link} href={p.live} target="_blank" rel="noreferrer">Live site</a>
                  <a className={`${link} inline-flex items-center gap-1.5`} href={p.gh} target="_blank" rel="noreferrer"><Icon name="GitHub" className="h-4 w-4" mono />Source code</a>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </Reveal>
    </Page>
  );
}
