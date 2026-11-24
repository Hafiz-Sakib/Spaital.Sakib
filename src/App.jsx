import { Suspense, lazy, useEffect, useMemo } from "react";
import { images } from "./gallery";
import { site } from "./site";
import ThemeToggle from "./components/ThemeToggle";
import ScrollProgress from "./components/ScrollProgress";
import InstallButton from "./components/InstallButton";
import { SideNav, BottomNav } from "./components/NavMenu";
import { BackspaceText } from "./components/backspace-text";
import { go, href, useRoute } from "./router";

const PAGE = {
  about: lazy(() => import("./pages/About")),
  projects: lazy(() => import("./pages/Projects")),
  skills: lazy(() => import("./pages/Skills")),
  journey: lazy(() => import("./pages/Journey")),
  coding: lazy(() => import("./pages/Coding")),
  contact: lazy(() => import("./pages/Contact")),
  notfound: lazy(() => import("./pages/NotFound")),
};

// three.js / gsap are only downloaded when the landing page opens.
const SpatialGallery = lazy(() =>
  import("motion-brew/spatial-gallery").then((m) => ({
    default: m.SpatialGallery,
  })),
);

// The tunnel keeps one texture per photo in GPU memory, so at most MAX_PHOTOS random photos are used per visit
// (a different random set + order every page load). Raise it if you want more, lower it if phones struggle.
const MAX_PHOTOS = 64;
const shuffle = (list) => {
  const r = list.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

export default function App() {
  const route = useRoute();
  const tunnel = useMemo(
    () =>
      shuffle(images)
        .slice(0, MAX_PHOTOS)
        .map((i) => ({ src: i.src, alt: i.alt, href: i.full })),
    [],
  ); // src = 900px WebP texture, href = 1600px WebP opened on click
  useEffect(() => {
    if (route !== "home") {
      window.scrollTo(0, 0);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [route]); // the photo tunnel owns the scroll; the other pages scroll normally

  const chrome = (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <a
          href={href("home")}
          onClick={go("home")}
          className="logo-link glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"
        >
          <img
            src="/icons/logo-mark.png"
            alt=""
            height="32"
            className="h-8 w-auto"
          />
          <span className="font-display text-base font-semibold sm:text-lg">
            {site.title}
          </span>
        </a>
        <div className="flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </div>
      {route !== "home" && <ScrollProgress />}
      <SideNav route={route} />
      <BottomNav route={route} />
    </>
  );

  if (route !== "home") {
    const Pg = PAGE[route];
    return (
      <div id="top" className="min-h-dvh">
        {chrome}
        <Suspense
          fallback={
            <div className="grid h-dvh place-items-center text-sm text-ink/50">
              Loading…
            </div>
          }
        >
          <Pg />
        </Suspense>
      </div>
    );
  }

  return (
    <div id="top" className="fixed inset-0">
      {chrome}
      {tunnel.length === 0 ? (
        <div className="grid h-full place-items-center px-6">
          <p className="max-w-md rounded-2xl border border-dashed border-ink/25 p-10 text-center text-ink/60">
            No photos yet. Put your pictures in <code>photos/</code> and run{" "}
            <code>npm run dev</code>.
          </p>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid h-full place-items-center text-sm text-ink/50">
              Loading…
            </div>
          }
        >
          <SpatialGallery
            className="h-full w-full"
            items={tunnel}
            // ─── Auto Movement ─────────────────────
            speed={1.4} // Auto speed: higher = faster
            autoMove={true} // Auto move: true / false
            // ─── Scroll ────────────────────────────
            scrollSpeed={2.1} // Scroll sensitivity: higher = faster
            captureScroll={true} // Capture scroll: true / false
            followPageScroll={true} // Follow page scroll: true / false
            // ─── Spiral ────────────────────────────
            spiral={true} // Spiral: true / false
            twist={0.3} // Twist: 0 (none) → 1 (maximum)
            // ─── Facing ────────────────────────────
            facing="funnel" // Facing: "front" / "funnel"
            funnel={0.78} // Funnel lean: 0 (none) → 1 (maximum)
            // ─── Layout ────────────────────────────
            count={124} // Planes: 8 – 160
            radius={4.1} // Tunnel radius: higher = wider
            core={0.8} // Hollow core: 0 → 0.95
            spacing={0.2} // Depth spacing: higher = more distance
            size={1.45} // Plane size: higher = larger images
            // ─── Appearance ────────────────────────
            roll={0.0} // Roll: 0 = no rotation, higher = more rotation
            corner={0.22} // Corner radius: 0 (square) → 0.5 (round)
            parallax={0.5} // Parallax: 0 (none) → 1 (maximum)
            fog={0.5} // Fog: 0 (none) → 1 (maximum fade)
            // ─── Interaction ───────────────────────
            drag={true} // Drag to travel: true / false
            caption={false} // Caption: true / false
            // ─── Links ─────────────────────────────
            linkTarget="_blank" // Link target: "_blank" / "_self"
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-mist via-mist/70 to-transparent" />
            <div className="pointer-events-none absolute bottom-24 left-5 max-w-[80%] sm:left-10 lg:bottom-10">
              <h1
                className="font-display font-semibold leading-none"
                aria-label={`Hi, I'm ${site.name}. ${site.tagline}`}
              >
                <span
                  aria-hidden
                  className="block text-2xl text-ink/50 sm:text-3xl"
                >
                  Hi, I'm
                </span>
                <span
                  aria-hidden
                  className="mt-1 block text-ink min-h-[2.1em] text-5xl sm:min-h-[1.1em] sm:text-7xl"
                >
                  <BackspaceText
                    words={[
                      ["", site.name],
                      ["a ", "full-stack dev"],
                      ["a ", "problem solver"],
                      ["an ", "NLP researcher"],
                    ]}
                    typeSpeed={80}
                    deleteSpeed={38}
                    hold={2200}
                    keyClassName="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent"
                    caretClassName="text-violet-500"
                  />
                </span>
              </h1>
              <p className="mt-3 max-w-md text-ink/65">{site.tagline}</p>
            </div>
            <p className="pointer-events-none absolute bottom-10 right-10 hidden text-sm text-ink/55 lg:block">
              Scroll · drag · hover
            </p>
          </SpatialGallery>
        </Suspense>
      )}
    </div>
  );
}
