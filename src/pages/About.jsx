import { FaDownload } from "react-icons/fa6";
import { LuMail, LuMapPin } from "react-icons/lu";
import { site, stats } from "../site";
import { Icon } from "../components/icons";
import { CountUp } from "./Page";
import { Reveal, TiltCard } from "../components/folio-ui";
import Page, { BG } from "./Page";

const tints = ["lilac", "mint", "peach", "sky"];

/* About lives in the navigation now (it used to be a side panel opened from the top bar). Same content, laid out as a page. */
export default function About() {
  return (
    <Page id="about" eyebrow="About" title={site.name} sub={site.tagline}>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
        <Reveal x={-28} y={0}>
          <img src="/profile.webp" alt={site.name} className="h-40 w-40 rounded-[2.2rem] object-cover shadow-xl ring-4 ring-surface sm:h-52 sm:w-52" />
        </Reveal>
        <Reveal x={28} y={0} delay={0.08}>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55"><LuMapPin aria-hidden className="h-4 w-4" />{site.place}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/75">{site.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-ink/85"><LuMail aria-hidden className="h-4 w-4" />Email me</a>
            <a href="/Hafiz-Sakib-CV.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-6 py-3 text-sm font-semibold transition hover:bg-ink/15"><FaDownload aria-hidden className="h-3.5 w-3.5" />Download CV</a>
          </div>
        </Reveal>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:grid-cols-4">
        {stats.map((x, i) => (
          <Reveal key={x.l} delay={(i % 4) * 0.08} className="h-full">
            <TiltCard className={`card h-full p-5 sm:p-6`} max={5}>
              <span aria-hidden className={`mb-4 block h-1.5 w-10 rounded-full ${BG[tints[i % tints.length]]}`} />
              <div className="font-display text-4xl font-extrabold"><CountUp to={x.v} suffix={x.s} /></div>
              <div className="mt-1 text-sm text-ink/55">{x.l}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {site.social?.length > 0 && (
        <Reveal className="mt-12">
          <ul className="flex flex-wrap gap-2" aria-label="Social links">
            {site.social.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name} className="grid h-11 w-11 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-ink/[.08] transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Icon name={s.name} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Page>
  );
}
