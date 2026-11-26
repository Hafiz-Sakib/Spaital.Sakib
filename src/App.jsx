import { Suspense, lazy, useEffect, useMemo } from "react";
import { images } from "./gallery";
import { site } from "./site";
import ThemeToggle from "./components/ThemeToggle";
import Starfield from "./components/Starfield";
import ScrollProgress from "./components/ScrollProgress";
import InstallButton from "./components/InstallButton";
import { TopNav, BottomNav } from "./components/NavMenu";
import { BackspaceText } from "./components/backspace-text";
import { go, href, useRoute } from "./router";

const PAGE = {
  about: lazy(() => import("./pages/About")),
  projects: lazy(() => import("./pages/Projects")),
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

/* Night-mode glow on every card / tile, for mouse hover AND touch.
   Feeds the glow its position (--mx / --my) from the pointer or finger, and marks the pressed surface `.is-hover`
   (kept ~0.9s after release, dropped at once if the gesture turns into a scroll). Mouse hover itself is plain CSS :hover.
   The glow is only drawn in night mode (see index.css), so day mode is untouched. Surfaces: `.card`, `.lift`, `[data-glow]`. */
const GLOW = ".card, .lift, [data-glow]";
function useCardGlow() {
  useEffect(() => {
    let held = [],
      timer = 0;
    const clear = () => {
      clearTimeout(timer);
      held.forEach((c) => c.classList.remove("is-hover"));
      held = [];
    };
    const place = (e) => {
      const list = [];
      for (
        let c = e.target.closest?.(GLOW);
        c;
        c = c.parentElement?.closest(GLOW)
      ) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
        list.push(c);
      }
      return list;
    };
    const down = (e) => {
      const list = place(e);
      if (e.pointerType === "mouse") return;
      clear();
      list.forEach((c) => c.classList.add("is-hover"));
      held = list;
    };
    const move = (e) => {
      place(e);
    };
    const up = (e) => {
      if (e.pointerType !== "mouse") {
        clearTimeout(timer);
        timer = setTimeout(clear, 900);
      }
    };
    const opt = { passive: true };
    document.addEventListener("pointerdown", down, opt);
    document.addEventListener("pointermove", move, opt);
    document.addEventListener("pointerup", up, opt);
    document.addEventListener("pointercancel", clear, opt);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", clear);
      clear();
    };
  }, []);
}

export default function App() {
  useCardGlow();
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/[.07] bg-mist/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          <a
            href={href("home")}
            onClick={go("home")}
            className="logo-link flex shrink-0 items-center gap-2.5 transition active:scale-95"
          >
            <img
              src="/icons/logo-mark.png"
              alt=""
              height="32"
              className="h-8 w-auto"
            />
            <span className="font-display text-lg font-extrabold leading-none">
              {site.title}
            </span>
          </a>
          <TopNav route={route} />
          <div className="flex shrink-0 items-center gap-2">
            <InstallButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {route !== "home" && <ScrollProgress />}
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
      {/* night-only starry sky behind the photo tunnel (hidden in day mode) */}
      <Starfield />
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
                className="font-display leading-none"
                aria-label={`Hello, I'm ${site.name}. ${site.tagline}`}
              >
                <span
                  aria-hidden
                  className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-ink/55 sm:text-sm"
                >
                  <span className="h-px w-8 bg-linear-to-r from-amber-400 to-rose-500 sm:w-12" />
                  Hello
                </span>
                <span
                  aria-hidden
                  className="mt-3 block min-h-[2.2em] text-4xl font-extrabold tracking-tight text-ink sm:min-h-[1.15em] sm:text-6xl"
                >
                  <BackspaceText
                    words={[
                      ["I'm ", site.name],
                      ["I'm a ", "full-stack developer"],
                      ["I'm a ", "competitive programmer"],
                      ["I'm an ", "NLP researcher"],
                      ["I'm building ", "clean UI's"],
                      ["I'm learning ", "System Design"],
                      ["I'm working with ", "Machine Learning"],
                      ["I'm building ", "scalable web apps"],
                    ]}
                    typeSpeed={70}
                    deleteSpeed={30}
                    hold={2000}
                    keyClassName="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent"
                    caretClassName="text-violet-500"
                  />
                </span>
              </h1>

              {/* tagline commented out because it was already included in the
              backspace text component above */}

              {/* <ul className="mt-4 flex max-w-md flex-wrap gap-2 text-xs font-semibold sm:text-sm">
                {site.tagline.split("·").map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-surface/70 px-3 py-1.5 text-ink/70 ring-1 ring-ink/10 backdrop-blur"
                  >
                    {t.trim()}
                  </li>
                ))}
              </ul> */}
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
