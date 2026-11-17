/**
 * RibbonGallery, from https://motion-brew.com/components/ribbon-gallery
 *
 * Ported to plain JSX for this Vite + Tailwind v3 project. Differences from the original:
 *  - uses framer-motion (already installed) instead of motion/react
 *  - no clsx / tailwind-merge / lucide-react dependencies
 *  - `onActive(index)` fires when a card is hovered, focused or tapped, so the page can show that
 *    project's info next to the ribbon
 *  - screenshots of any aspect ratio are cover-cropped onto the cards instead of being stretched
 *
 * Trigger: drag (plus wheel, trackpad and touch). An endless ribbon of cards wrapped on the inside
 * of a curved screen and tilted across the frame. Every card is cut into thin vertical slices placed
 * on a cylinder with CSS 3D transforms written straight to the DOM (no WebGL, no React re-renders).
 */

import * as React from "react";
import { useAnimationFrame, useReducedMotion } from "framer-motion";

const cn = (...a) => a.filter(Boolean).join(" ");

/** Vertical slices per card; more is smoother, fewer is cheaper. */
const SLICES = 20;
const PERSPECTIVE = 1400;
/** Slices overlap their neighbours by this much so no hairline seams show between them. */
const OVERLAP = 2;
/** The slice a card's title sits on. */
const TITLE_SLICE = 2;
/** Slices are drawn at this multiple of their size and scaled back down so the images stay sharp. */
const SUPERSAMPLE = 2; // minimum; raised to the screen's pixel ratio (up to 3) so phones stay sharp
const mod = (a, n) => ((a % n) + n) % n;

const ArrowRight = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** items: [{ src, title, alt?, href? }] */
export const RibbonGallery = React.forwardRef(function RibbonGallery(
  {
    items = [],
    angle = 20,
    curve = 0.45,
    cardWidth = 230,
    cardHeight = 290,
    gap = 14,
    drift = 30,
    momentum = 0.65,
    wave = 1,
    blur = 9.5,
    intro = true,
    wheel = true,
    dim = 0.75,
    dimColor = "rgb(245 245 245)",
    label = "Project ribbon",
    /** Horizontal focal point (0 left, 1 right) when a wide screenshot is cropped onto a card. */
    focusX = 0.5,
    /** Vertical slices per card (more = smoother edges, a little heavier). */
    slices: SL = SLICES,
    onActive,
    className,
  },
  forwardedRef,
) {
  const still = !!useReducedMotion();
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const ss = React.useMemo(() => Math.min(3, Math.max(SUPERSAMPLE, Math.ceil(dpr))), [dpr]);
  // Retina / phone screens get the item's `hd` image (if it has one) so screenshots are not stretched and blurry.
  const srcOf = React.useCallback((it) => (dpr >= 1.5 && it.hd ? it.hd : it.src), [dpr]);
  const inView = React.useRef(true);
  const culled = React.useRef([]);
  const root = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => root.current);
  const track = React.useRef(null);
  const blurNode = React.useRef(null);
  const slices = React.useRef([]);
  const cardEls = React.useRef([]);
  const assigned = React.useRef([]); // slot -> { key, idx }: which photo each ring slot currently shows
  const washes = React.useRef([]);
  const titles = React.useRef([]);
  const arrows = React.useRef([]);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [view, setView] = React.useState({ w: 0, h: 0 });
  const [ratios, setRatios] = React.useState({});
  const known = React.useMemo(() => { // ratios already known from the gallery data (no need to download images to measure them)
    const m = {};
    items.forEach((it) => { if (it.w && it.h) m[srcOf(it)] = it.w / it.h; });
    return m;
  }, [items, srcOf]);

  const cam = React.useRef({ x: 0, tx: 0, v: 0, time: 0, phase: 0 });
  const band = React.useRef({ x: 0, v: 0 });
  const drag = React.useRef(null);
  const swallowClick = React.useRef(false);
  const hovering = React.useRef(false);
  const pointerType = React.useRef("mouse");
  const hovered = React.useRef(null);
  const activeIdx = React.useRef(-1);
  const focus = React.useRef([]);
  const settled = React.useRef([]);
  const written = React.useRef([]);
  const introAt = React.useRef(null);
  const onActiveRef = React.useRef(onActive);
  onActiveRef.current = onActive;
  const settings = React.useRef({ angle, drift, momentum, wave, blur, dim, still });
  settings.current = { angle, drift, momentum, wave, blur, dim, still };

  const pitch = cardWidth + gap;
  const sliceW = cardWidth / SL;
  const rad = (angle * Math.PI) / 180;
  const run = view.w ? Math.abs(view.w * Math.cos(rad)) + Math.abs(view.h * Math.sin(rad)) : 0;
  const radius = run ? run / (0.9 + Math.max(0, Math.min(1, curve)) * 2.6) : 1;
  const visibleHalf = Math.min(radius * 1.45, run * 0.9);
  const needed = Math.ceil((2 * visibleHalf + cardWidth) / pitch) + 2;
  // A fixed small ring of cards (about a screen's worth). As a card scrolls out of sight and wraps around, it is
  // re-filled with the next photo, so ALL photos play in order but only ~15 cards ever exist in the DOM.
  const count = run && items.length ? needed : 0;
  const span = count * pitch;

  const idxOf = (k) => assigned.current[k]?.idx ?? k % items.length;
  const activate = (k) => {
    const idx = idxOf(k);
    if (activeIdx.current === idx) return;
    activeIdx.current = idx;
    onActiveRef.current?.(idx);
  };

  // Fill ring slot k with photo number v (any integer; wraps over the list). Written straight to the DOM, no re-render.
  const paintCard = (k, v) => {
    const n = items.length;
    const idx = mod(v, n);
    const item = items[idx];
    const src = srcOf(item);
    const key = `${idx}|${cardWidth}|${cardHeight}|${ss}|${ratios[src] || 0}`;
    if (assigned.current[k]?.key === key) return;
    assigned.current[k] = { key, idx };
    const { w: bw, h: bh, ox, oy } = fit(src);
    for (let j = 0; j < SL; j++) {
      const el = slices.current[k * SL + j];
      if (!el) continue;
      el.style.backgroundImage = `url("${src}")`;
      el.style.backgroundSize = `${bw * ss}px ${bh * ss}px`;
      el.style.backgroundPosition = `${(ox - j * sliceW + OVERLAP) * ss}px ${oy * ss}px`;
    }
    const card = cardEls.current[k];
    if (card) {
      if (item.href) card.setAttribute("href", item.href);
      card.setAttribute("aria-label", item.alt ?? item.title ?? "Photo");
    }
  };

  // Layout or list changed: forget what each slot shows so the next frame repaints them.
  React.useEffect(() => { assigned.current = []; }, [items, cardWidth, cardHeight, ss, ratios, SL, srcOf]);

  // Learn each screenshot's aspect ratio so it can be cover-cropped rather than stretched.
  React.useEffect(() => {
    let dead = false;
    items.forEach((it) => {
      if (it.w && it.h) return;
      const src = srcOf(it);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (dead || !img.naturalHeight) return;
        setRatios((r) => (r[src] ? r : { ...r, [src]: img.naturalWidth / img.naturalHeight }));
      };
      img.src = src;
    });
    return () => { dead = true; };
  }, [items, srcOf]);

  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!intro || still) {
      introAt.current = -Infinity;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && introAt.current === null) {
          introAt.current = performance.now();
          cam.current.x = cam.current.tx + pitch * 3.2;
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop all slice maths while the ribbon is off screen.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = root.current;
    if (!el || !wheel) return;
    const onWheel = (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : 1;
      cam.current.tx -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel]);

  useAnimationFrame((_, delta) => {
    if (!count || !inView.current) return;
    const dt = Math.min(delta, 50) / 1000;
    const s = settings.current;
    const c = cam.current;
    c.time += dt;

    if (!drag.current) {
      c.tx += c.v * dt;
      c.v *= Math.exp(-dt * (1.5 + (1 - s.momentum) * 10));
      if (!hovering.current && !s.still && s.drift > 0) c.tx -= s.drift * dt;
    }
    const introAge = introAt.current === null ? -1 : (performance.now() - introAt.current) / 1000;
    if (introAge < 0 && !s.still) {
      if (track.current) track.current.style.opacity = "0";
      return;
    }
    const rate = introAge < 1.6 ? 2.6 + introAge * 4 : 12;
    const px = c.x;
    c.x += (c.tx - c.x) * (s.still ? 1 : 1 - Math.exp(-dt * rate));
    const speed = dt > 0 ? (c.x - px) / dt : 0;

    const b = band.current;
    const K = 160;
    b.v += ((speed - b.x) * K - b.v * 2 * Math.sqrt(K) * 0.45) * dt;
    b.x += b.v * dt;
    const pull = s.still ? 0 : Math.min(1, Math.abs(b.x) / 2200);

    if (track.current) {
      track.current.style.opacity = s.still ? "1" : Math.min(1, Math.max(0, introAge) * 2.5).toFixed(3);
      const raw = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.x) / 240);
      const sd = raw > 0.6 ? raw : 0;
      blurNode.current?.setAttribute("stdDeviation", `${sd.toFixed(2)} 0`);
      track.current.style.filter = sd > 0 ? `url(#${uid}-blur)` : "none";
    }

    const amp = s.still ? 0 : (0.4 + pull * 0.55) * s.wave;
    c.phase += dt * (1.2 - Math.max(-3, Math.min(3, b.x / 300)));
    const R = radius;
    const maxPhi = 1.45;

    const focusEase = s.still ? 1 : 1 - Math.exp(-dt * 9);
    for (let k = 0; k < count; k++) {
      const u = k * pitch + c.x + span / 2;
      const center = mod(u, span) - span / 2;
      paintCard(k, k - Math.floor(u / span) * count);
      // Cards well outside the visible arc: hide once, then skip all per-slice work.
      if (Math.abs(center) > visibleHalf + cardWidth) {
        if (!culled.current[k]) {
          culled.current[k] = true;
          for (let j = 0; j < SL; j++) { const e = slices.current[k * SL + j]; if (e) e.style.visibility = "hidden"; }
          if (titles.current[k]) titles.current[k].style.visibility = "hidden";
          if (arrows.current[k]) arrows.current[k].style.visibility = "hidden";
        }
        continue;
      }
      culled.current[k] = false;
      const want = hovered.current === null || hovered.current === k ? 1 : 0;
      const f = (focus.current[k] ??= 1) + (want - (focus.current[k] ?? 1)) * focusEase;
      focus.current[k] = f;
      const up = (settled.current[k] ?? 0) + ((hovered.current === k ? 1 : 0) - (settled.current[k] ?? 0)) * focusEase;
      settled.current[k] = up;
      const cardAmp = amp * (1 - up);
      const opacity = 1 - (1 - f) * Math.max(0, Math.min(1, s.dim)) * 0.88;
      const writeOpacity = Math.abs((written.current[k] ?? 1) - opacity) > 0.002;
      if (writeOpacity) written.current[k] = opacity;
      for (let j = 0; j < SL; j++) {
        const el = slices.current[k * SL + j];
        if (!el) continue;
        const x = center - cardWidth / 2 + (j + 0.5) * sliceW;
        const phi = x / R;
        const depth = R * (1 - Math.cos(phi));
        const hidden = Math.abs(phi) > maxPhi || depth > PERSPECTIVE * 0.7;
        let transform = "";
        if (!hidden) {
          const wobble = Math.sin(phi * 2.4 - c.phase);
          const ty = wobble * 26 * cardAmp;
          const sy = 1 + Math.cos(phi * 1.9 + c.time * 1.2) * 0.1 * cardAmp;
          transform = `translate3d(${(R * Math.sin(phi)).toFixed(2)}px, ${ty.toFixed(2)}px, ${depth.toFixed(2)}px) rotateY(${(-phi).toFixed(4)}rad) scaleY(${sy.toFixed(4)})`;
          el.style.transform = `${transform} scale(${1 / ss})`;
        }
        el.style.visibility = hidden ? "hidden" : "visible";
        const wash = washes.current[k * SL + j];
        if (writeOpacity && wash) wash.style.opacity = (1 - opacity).toFixed(3);
        const overlay = j === TITLE_SLICE ? titles.current[k] : j === SL - 1 ? arrows.current[k] : null;
        if (overlay) {
          overlay.style.visibility = hidden ? "hidden" : "visible";
          if (writeOpacity) overlay.style.opacity = opacity.toFixed(3);
          if (!hidden) overlay.style.transform = transform;
        }
      }
    }
  });

  // "Contain" geometry: the WHOLE photo fits inside the card (nothing is cropped), centred; the rest of the card is the card colour.
  function fit(src) {
    const r = ratios[src] || known[src] || cardWidth / cardHeight;
    const wide = r >= cardWidth / cardHeight;
    const w = wide ? cardWidth : cardHeight * r;
    const h = wide ? cardWidth / r : cardHeight;
    return { w, h, ox: (cardWidth - w) / 2, oy: (cardHeight - h) / 2 };
  }

  return (
    <div
      ref={root}
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
      tabIndex={0}
      onPointerEnter={(e) => e.pointerType === "mouse" && (hovering.current = true)}
      onPointerLeave={() => {
        hovering.current = false;
        hovered.current = null;
      }}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
        if (e.button !== 0) return;
        drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false };
        cam.current.v = 0;
        swallowClick.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const now = performance.now();
        const a = (settings.current.angle * Math.PI) / 180;
        const along = (e.clientX - d.x) * Math.cos(a) - (e.clientY - d.y) * Math.sin(a);
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
          d.moved = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        cam.current.tx += along;
        cam.current.v = cam.current.v * 0.6 + (along / (Math.max(1, now - d.t) / 1000)) * 0.4;
        Object.assign(d, { x: e.clientX, y: e.clientY, t: now });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (d.moved) swallowClick.current = true;
        if (performance.now() - d.t > 80 || still) cam.current.v = 0;
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), (cam.current.tx += pitch));
        if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), (cam.current.tx -= pitch));
      }}
      className={cn(
        "relative h-[520px] w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400",
        className,
      )}
    >
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur ref={blurNode} stdDeviation="0 0" />
        </filter>
      </svg>

      <div
        ref={track}
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{ transform: `rotate(${-angle}deg)`, opacity: 0 }}
      >
        {Array.from({ length: count }, (_, k) => {
          const repeat = k >= items.length;
          const Card = items[0]?.href ? "a" : "div";
          return (
            <Card
              key={k}
              ref={(el) => void (cardEls.current[k] = el)}
              {...(items[0]?.href ? { target: "_blank", rel: "noreferrer", draggable: false } : {})}
              {...(repeat ? { "aria-hidden": true, tabIndex: -1 } : {})}
              onClick={(e) => {
                if (swallowClick.current) return e.preventDefault();
                // On touch the first tap only selects the card (shows its info); a second tap opens it.
                if (pointerType.current !== "mouse" && activeIdx.current !== idxOf(k)) {
                  e.preventDefault();
                  activate(k);
                }
              }}
              onDragStart={(e) => e.preventDefault()}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && !drag.current?.moved) {
                  hovered.current = k;
                  activate(k);
                }
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse" && hovered.current === k) hovered.current = null;
              }}
              onFocus={(e) => {
                if (!e.currentTarget.matches(":focus-visible")) return;
                hovered.current = k;
                activate(k);
              }}
              onBlur={() => hovered.current === k && (hovered.current = null)}
              className="group/card absolute left-0 top-0 block outline-none"
              style={{ perspective: PERSPECTIVE }}
            >
              {Array.from({ length: SL }, (_, j) => (
                <span
                  key={j}
                  ref={(el) => void (slices.current[k * SL + j] = el)}
                  className={cn(
                    "absolute block bg-zinc-300 will-change-transform dark:bg-zinc-700",
                    j === 0 && "rounded-l-[36px]",
                    j === SL - 1 && "rounded-r-[36px]",
                  )}
                  style={{
                    width: (sliceW + OVERLAP * 2) * ss,
                    height: cardHeight * ss,
                    left: (-sliceW / 2 - OVERLAP) * ss,
                    top: (-cardHeight / 2) * ss,
                    backgroundRepeat: "no-repeat",
                    visibility: "hidden",
                  }}
                >
                  <span
                    ref={(el) => void (washes.current[k * SL + j] = el)}
                    className="pointer-events-none absolute inset-0 block rounded-[inherit]"
                    style={{ background: dimColor, opacity: 0 }}
                  />
                </span>
              ))}
              <span
                ref={(el) => void (titles.current[k] = el)}
                className="pointer-events-none absolute block whitespace-nowrap text-[14px] font-medium leading-none tracking-tight text-white will-change-transform [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
                style={{ left: -sliceW / 2 - TITLE_SLICE * sliceW + 18, top: cardHeight / 2 - 34, visibility: "hidden" }}
              >
              </span>
              <span
                ref={(el) => void (arrows.current[k] = el)}
                className="pointer-events-none absolute block will-change-transform"
                style={{ left: sliceW / 2 - 14 - 28, top: cardHeight / 2 - 18 - 28, visibility: "hidden" }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-zinc-900 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.18]">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
});
