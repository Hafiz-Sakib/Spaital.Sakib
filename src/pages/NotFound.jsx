import { useEffect } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "motion-brew/magnetic-button";
import { PAGES, go, href } from "../router";
import { BlurText, Reveal } from "../components/folio-ui";
import { BackspaceText } from "../components/backspace-text";
import { DecayCard } from "@/components/decay-card";

/* 404: unknown path. Hover (or press) the card and the picture decays away to the night shot underneath. */
export default function NotFound() {
  useEffect(() => {
    const prev = document.title;
    document.title = `Page not found · ${prev}`;
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid min-h-dvh max-w-5xl items-center gap-10 px-4 pb-32 pt-28 sm:px-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:pb-24"
    >
      <div className="mx-auto w-full max-w-sm lg:max-w-none">
        <DecayCard
          src="/work/coast.jpg"
          revealSrc="/work/coast-night.jpg"
          title="Nothing stays"
          tag="Error 404"
          line="This link decayed. Hover the card (or press and hold) and watch it go."
          alt="A quiet coast at sunset"
        />
      </div>

      <div className="text-center lg:text-left">
        <h1 className="font-display text-4xl font-semibold leading-none sm:text-6xl">
          <BlurText text="Page not found" />
          <span className="bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            .
          </span>
        </h1>

        <Reveal y={16} scale={1} delay={0.25}>
          <p className="mx-auto mt-3 min-h-[3.2rem] max-w-md text-lg text-ink/65 sm:min-h-0 sm:text-xl lg:mx-0">
            <BackspaceText
              before="This link leads to"
              words={["nowhere.", "a missing page.", "a typo.", "the void."]}
              caretClassName="text-violet-500"
            />
          </p>
        </Reveal>

        <Reveal y={16} scale={1} delay={0.4}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <MagneticButton
              href={href("home")}
              onClick={go("home")}
              size="lg"
              className="rounded-full"
            >
              ← Back to photos
            </MagneticButton>
            <MagneticButton
              href={href("contact")}
              onClick={go("contact")}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              Report a broken link
            </MagneticButton>
          </div>

          <nav aria-label="Pages" className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
            {PAGES.map((p) => (
              <a
                key={p.id}
                href={href(p.id)}
                onClick={go(p.id)}
                className="rounded-full bg-ink/[.07] px-4 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/15 hover:text-ink"
              >
                {p.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </div>
    </motion.main>
  );
}
