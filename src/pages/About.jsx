import { FaDownload } from "react-icons/fa6";
import { LuMail } from "react-icons/lu";
import { site, stats } from "../site";
import { Icon } from "../components/icons";
import { ProfileCard } from "../components/mb/profile-card";
import { FluxCard } from "@/components/flux-card";
import { HighlightText } from "../components/mb/highlight-text";
import { Odometer } from "../components/mb/odometer";
import { Reveal } from "../components/folio-ui";
import Page from "./Page";

/* About page: profile card with a cursor-drift cover, a bio with marker highlights, numbers on odometer wheels,
   and at the bottom a FluxCard "focus mode" that shows how I work (pings wait while I code). */
const PINGS = [
  { label: "Codeforces round in 1h", icon: "calendar" },
  { label: "PR review requested", icon: "message" },
  { label: "Thesis feedback: 1 new", icon: "mail" },
  { label: "Vercel build finished", icon: "bell" },
  { label: "Class group: 12 new", icon: "message" },
];
const LAGOON = ["#00897f", "#1fc2ad", "#9be6d4", "#e4faf3"];
const FOCUS = [
  [
    "Problem solving",
    "Codeforces and LeetCode practice, one clean block at a time.",
  ],
  ["Building", "Full-stack apps and UI details, with the notifications muted."],
  [
    "Research",
    "Thesis and NLP work, where a long unbroken stretch matters most.",
  ],
];

/* Codeforces / LeetCode links live on the Contact page only */
const social = (site.social || []).filter(
  (s) => s.name !== "Codeforces" && s.name !== "LeetCode",
);

export default function About() {
  return (
    <Page
      id="about"
      eyebrow="About"
      title={site.name}
      typed={{
        before: "I'm a",
        words: [
          "full-stack developer.",
          "competitive programmer.",
          "NLP researcher.",
        ],
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:gap-10">
        <Reveal x={-28} y={0}>
          <ProfileCard
            img="/profile.webp"
            name={site.name}
            line={site.tagline}
            place={site.place}
          >
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-mist transition hover:bg-ink/85"
            >
              <LuMail aria-hidden className="h-4 w-4" />
              Email me
            </a>
            <a
              href="/Hafiz-Sakib-CV.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-ink/15"
            >
              <FaDownload aria-hidden className="h-3.5 w-3.5" />
              Download CV
            </a>
          </ProfileCard>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08}>
          <HighlightText
            className="text-xl leading-[1.75] text-ink/80 sm:text-2xl"
            text={site.bio}
            marks={[
              "full-stack",
              "clean UI",
              "competitive programming",
              "Competitive programming",
              "Natural Language Processing",
              "NLP",
              "Codeforces",
              "LeetCode",
            ]}
          />
          <dl className="mt-10 grid grid-cols-2 gap-3 border-t border-ink/10 pt-8 sm:gap-4 md:grid-cols-4 lg:grid-cols-2">
            {stats.map((x) => (
              <div
                key={x.l}
                className="lift rounded-2xl border border-ink/10 px-4 py-4 sm:px-5 sm:py-5"
              >
                <dd className="font-display text-4xl font-extrabold sm:text-5xl">
                  <Odometer to={x.v} suffix={x.s} />
                </dd>
                <dt className="mt-2 text-sm text-ink/55">{x.l}</dt>
              </div>
            ))}
          </dl>
          {social.length > 0 && (
            <ul
              className="mt-10 flex flex-wrap gap-2"
              aria-label="Social links"
            >
              {social.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    title={s.name}
                    className={`brand brand-${s.name.toLowerCase()} grid h-11 w-11 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-ink/8 transition duration-200 hover:-translate-y-1 hover:shadow-md`}
                  >
                    <Icon name={s.name} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      <section
        aria-labelledby="focus-title"
        className="mt-20 grid items-center gap-10 lg:grid-cols-[minmax(0,25rem)_1fr] lg:gap-14"
      >
        <Reveal x={-28} y={0}>
          {/* .flux-night restyles the card for night mode (see index.css) */}
          <div className="flux-night mx-auto lg:mx-0">
          <FluxCard
            className="mx-auto lg:mx-0"
            title="Keep the noise out"
            description="When I'm solving problems or training models, pings wait at the edge until my block ends. Nothing gets lost, it just waits."
            label="Deep work"
            minutes={25}
            pings={PINGS}
            accent="#ffb020"
            colors={LAGOON}
          />
          </div>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08}>
          <p className="mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70">
            How I work
          </p>
          <h2
            id="focus-title"
            className="font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Focus first, notifications later.
          </h2>
          <ul className="mt-6 space-y-5">
            {FOCUS.map(([t, d]) => (
              <li key={t} className="border-l-2 border-ink/10 pl-4">
                <h3 className="font-display text-lg font-semibold">{t}</h3>
                <p className="mt-0.5 text-ink/60">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </Page>
  );
}
