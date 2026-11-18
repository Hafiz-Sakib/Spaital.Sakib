import { Suspense, lazy, useEffect, useMemo } from "react";
import { images } from "./gallery";
import { site } from "./site";
import ThemeToggle from "./components/ThemeToggle";
import InstallButton from "./components/InstallButton";
import { SideNav, BottomNav } from "./components/NavMenu";
import { useRoute } from "./router";

const PAGE = {
  about: lazy(() => import("./pages/About")),
  projects: lazy(() => import("./pages/Projects")),
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
  const tunnel = useMemo(() => shuffle(images).slice(0, MAX_PHOTOS).map((i) => ({ src: i.src, alt: i.alt, href: i.full })), []); // src = 900px WebP texture, href = 1600px WebP opened on click
  useEffect(() => { if (route !== "home") { window.scrollTo(0, 0); return; } document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, [route]); // the photo tunnel owns the scroll; the other pages scroll normally

  const chrome = (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <a href="#/" className="glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"><img src="/icons/logo-128.png" alt="" width="32" height="32" className="h-8 w-8 rounded-[22%]" /><span className="font-display text-base font-semibold sm:text-lg">{site.title}</span></a>
        <div className="flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </div>
      <SideNav route={route} />
      <BottomNav route={route} />
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
            <div className="pointer-events-none absolute bottom-24 left-5 max-w-[80%] sm:left-10 lg:bottom-10">
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
