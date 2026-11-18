import { FaDownload } from "react-icons/fa6";
import { LuMail } from "react-icons/lu";
import { site, stats } from "../site";
import { Icon } from "../components/icons";
import { ProfileCard } from "../components/mb/profile-card";
import { HighlightText } from "../components/mb/highlight-text";
import { Odometer } from "../components/mb/odometer";
import { Reveal } from "../components/folio-ui";
import Page from "./Page";

/* About page: profile card with a cursor-drift cover, a bio with marker highlights, numbers on odometer wheels. */
export default function About() {
  return (
    <Page id="about" eyebrow="About" title={site.name} typed={{ before: "I'm a", words: ["full-stack developer.", "competitive programmer.", "NLP researcher."] }}>
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:gap-10">
        <Reveal x={-28} y={0}>
          <ProfileCard img="/profile.webp" name={site.name} line={site.tagline} place={site.place}>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-mist transition hover:bg-ink/85"><LuMail aria-hidden className="h-4 w-4" />Email me</a>
            <a href="/Hafiz-Sakib-CV.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-ink/15"><FaDownload aria-hidden className="h-3.5 w-3.5" />Download CV</a>
          </ProfileCard>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08}>
          <HighlightText className="text-xl leading-[1.75] text-ink/80 sm:text-2xl" text={site.bio} marks={["full-stack", "clean UI", "competitive programming", "Competitive programming", "Natural Language Processing", "NLP", "Codeforces", "LeetCode"]} />
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/10 pt-8 sm:grid-cols-4">
            {stats.map((x) => (
              <div key={x.l}>
                <dd className="font-display text-4xl font-extrabold sm:text-5xl"><Odometer to={x.v} suffix={x.s} /></dd>
                <dt className="mt-1 text-sm text-ink/55">{x.l}</dt>
              </div>
            ))}
          </dl>
          {site.social?.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Social links">
              {site.social.map((s) => (
                <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name} className="grid h-11 w-11 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-ink/[.08] transition duration-200 hover:-translate-y-1 hover:shadow-md"><Icon name={s.name} className="h-5 w-5" /></a></li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </Page>
  );
}
