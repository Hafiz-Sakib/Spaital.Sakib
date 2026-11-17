import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { images } from "./gallery";
import { site, stats } from "./site";
import { Icon } from "./components/icons";
import ThemeToggle from "./components/ThemeToggle";
import InstallButton from "./components/InstallButton";
import { NavBar, NavButton } from "./components/NavMenu";
import { useRoute } from "./router";

const PAGE = {
  skills: lazy(() => import("./pages/Skills")),
  journey: lazy(() => import("./pages/Journey")),
  coding: lazy(() => import("./pages/Coding")),
  contact: lazy(() => import("./pages/Contact")),
};

// three.js / gsap are only downloaded when the landing page opens.
const SpatialGallery = lazy(() => import("motion-brew/spatial-gallery").then((m) => ({ default: m.SpatialGallery })));

// The tunnel keeps one texture per photo in GPU memory, so at most MAX_PHOTOS random photos are used per visit
// (a different random set + order every page load). Raise it if you want more, lower it if phones struggle.
const MAX_PHOTOS = 64;
const shuffle = (list) => { const r = list.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export default function App() {
  const route = useRoute();
  const [about, setAbout] = useState(false);
  const tunnel = useMemo(() => shuffle(images).slice(0, MAX_PHOTOS).map((i) => ({ src: i.src, alt: i.alt, href: i.full })), []); // src = 900px WebP texture, href = 1600px WebP opened on click
  useEffect(() => { if (route !== "home") { window.scrollTo(0, 0); return; } document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, [route]); // the photo tunnel owns the scroll; the other pages scroll normally
  useEffect(() => { const k = (e) => e.key === "Escape" && setAbout(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  const chrome = (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <a href="#/" className="glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"><img src="/icons/logo-128.png" alt="" width="32" height="32" className="h-8 w-8 rounded-[22%]" /><span className="font-display text-base font-semibold sm:text-lg">{site.title}</span></a>
        <NavBar route={route} />
        <div className="flex items-center gap-2">
          <button onClick={() => setAbout(true)} className="glass rounded-full px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">About</button>
          <InstallButton />
          <ThemeToggle />
          <NavButton route={route} />
        </div>
      </div>
      <AnimatePresence>
        {about && (
          <>
            <motion.div key="bg" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAbout(false)} />
            <motion.aside key="panel" role="dialog" aria-label="About" className="glass fixed right-0 top-0 z-50 h-dvh w-[min(26rem,100%)] overflow-y-auto p-7" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 36 }}>
              <button onClick={() => setAbout(false)} aria-label="Close" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-ink/10 text-lg">×</button>
              <img src="/profile.webp" alt={site.name} className="h-28 w-28 rounded-[2rem] object-cover shadow-xl ring-4 ring-surface" />
              <h2 className="mt-5 text-3xl font-semibold">{site.name}</h2>
              <p className="mt-1 text-ink/60">{site.tagline}</p>
              <p className="mt-0.5 text-sm text-ink/45">{site.place}</p>
              <p className="mt-5 leading-relaxed text-ink/75">{site.bio}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {stats.map((x) => (<div key={x.l} className="rounded-2xl bg-ink/[.06] p-4"><div className="font-display text-3xl font-bold">{x.v}{x.s}</div><div className="text-xs text-ink/55">{x.l}</div></div>))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={`mailto:${site.email}`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-mist">Email me</a>
                <a href="/Hafiz-Sakib-CV.pdf" target="_blank" rel="noreferrer" className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold">Download CV</a>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {site.social.map((s) => (<li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name} className="grid h-11 w-11 place-items-center rounded-full bg-surface ring-1 ring-ink/10 transition hover:-translate-y-1"><Icon name={s.name} className="h-5 w-5" /></a></li>))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  if (route !== "home") {
    const Pg = PAGE[route];
    return (
      <div id="top" className="min-h-dvh">
        {chrome}
        <Suspense fallback={<div className="grid h-dvh place-items-center text-sm text-ink/50">Loading…</div>}><Pg /></Suspense>
      </div>
    );
  }

  return (
    <div id="top" className="fixed inset-0">
      {chrome}
      {tunnel.length === 0 ? (
        <div className="grid h-full place-items-center px-6">
          <p className="max-w-md rounded-2xl border border-dashed border-ink/25 p-10 text-center text-ink/60">No photos yet. Put your pictures in <code>photos/</code> and run <code>npm run dev</code>.</p>
        </div>
      ) : (
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-ink/50">Loading…</div>}>
          <SpatialGallery className="h-full w-full" items={tunnel} count={110} radius={3.6} scrollSpeed={2.5} twist={0.35} roll={0.15} linkTarget="_blank">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-mist via-mist/70 to-transparent" />
            <div className="pointer-events-none absolute bottom-8 left-5 max-w-[80%] sm:left-10 lg:bottom-10">
              <p className="mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70">{images.length} photos</p>
              <h1 className="font-display text-5xl font-semibold leading-[.95] sm:text-7xl">{site.name}<span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">.</span></h1>
              <p className="mt-3 max-w-md text-ink/65">{site.tagline}</p>
            </div>
            <p className="pointer-events-none absolute bottom-10 right-10 hidden text-sm text-ink/55 lg:block">Scroll · drag · hover</p>
          </SpatialGallery>
        </Suspense>
      )}
    </div>
  );
}
