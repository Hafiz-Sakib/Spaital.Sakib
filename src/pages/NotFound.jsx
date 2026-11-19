import { useEffect } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "motion-brew/magnetic-button";
import { PAGES, go, href } from "../router";
import { BlurText, Reveal } from "../components/folio-ui";
import { BackspaceText } from "../components/backspace-text";
import { OrbitCard } from "../components/mb/orbit-card";
import { ICONS } from "../components/TabBar";

/* 404: unknown path. The page links orbit the big "404" so a lost visitor can jump straight to a real page. */
export default function NotFound() {
  useEffect(() => {
    const prev = document.title;
    document.title = `Page not found · ${prev}`;
    return () => {
      document.title = prev;
    };
  }, []);

  const items = PAGES.map((p) => {
    const Ico = ICONS[p.id];
    return {
      key: p.id,
      label: p.label,
      href: href(p.id),
      node: Ico ? <Ico strokeWidth={2.1} /> : p.label[0],
    };
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-4 pb-32 pt-28 text-center sm:px-6 lg:pb-24"
    >
      <p className="mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70">
        Error 404
      </p>

      <div className="relative">
        <OrbitCard
          center={
            <span
              aria-hidden
              className="bg-linear-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text font-display text-6xl font-semibold leading-none text-transparent sm:text-7xl"
            >
              404
            </span>
          }
          items={items.map((it) => ({
            ...it,
            node: <span className="grid text-ink/70">{it.node}</span>,
          }))}
        />
      </div>

      <h1 className="mt-2 font-display text-4xl font-semibold leading-none sm:text-6xl">
        <BlurText text="Page not found" />
        <span className="bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
          .
        </span>
      </h1>

      <Reveal y={16} scale={1} delay={0.25}>
        <p className="mt-3 min-h-[3.2rem] max-w-md text-lg text-ink/65 sm:min-h-0 sm:text-xl">
          <BackspaceText
            before="This link leads to"
            words={["nowhere.", "a missing page.", "a typo.", "the void."]}
            caretClassName="text-violet-500"
          />
        </p>
      </Reveal>

      <Reveal y={16} scale={1} delay={0.4}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </Reveal>
    </motion.main>
  );
}
