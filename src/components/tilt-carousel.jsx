/**
 * TiltCarousel: a looping row of cards that glides on its own. The middle card faces you,
 * the rest turn away in 3D. Drag, flick or tap a side card to take over; autoplay resumes after a pause.
 *
 * Plain <img> cards (no slicing), so screenshots stay sharp on phones. CSS 3D transforms are written
 * straight to the DOM from one rAF loop, so there are no React re-renders while it moves.
 *
 * Props: items [{ src, hd?, title, alt?, href? }], cardWidth, cardHeight, rotation (deg), perspective (px),
 * inactiveScale, speed (glide speed multiplier), autoplay, delay (seconds between auto steps),
 * onActive(index) fires whenever the front card changes.
 */
import * as React from "react";
import { useReducedMotion } from "framer-motion";

const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function TiltCarousel({
  items = [],
  cardWidth = 250,
  cardHeight = 170,
  rotation = 40,
  perspective = 900,
  inactiveScale = 0.86,
  speed = 3,
  autoplay = true,
  delay = 1.5,
  onActive,
  label = "Project carousel",
  className = "",
}) {
  const still = !!useReducedMotion();
  const n = items.length;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const root = React.useRef(null);
  const cards = React.useRef([]);
  const st = React.useRef({ pos: 0, target: 0, idle: 0, drag: null, moved: false, inView: true, active: -1, resume: 0 });
  const cfg = React.useRef({});
  cfg.current = { n, cardWidth, rotation, inactiveScale, speed, autoplay: autoplay && !still, delay };
  const onActiveRef = React.useRef(onActive);
  onActiveRef.current = onActive;

  React.useEffect(() => {
    if (!n) return;
    const s = st.current;
    const paint = () => {
      const c = cfg.current;
      const step = c.cardWidth * 0.64;
      for (let i = 0; i < c.n; i++) {
        const el = cards.current[i];
        if (!el) continue;
        let d = mod(i - s.pos, c.n);
        if (d > c.n / 2) d -= c.n;
        const a = Math.abs(d);
        // Photos download only when a card is within a few steps of the front, so 400+ photos never load at once.
        if (a < 6 && !el.dataset.l) { el.dataset.l = "1"; el.querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; }); }
        if (a > 3.4) { el.style.visibility = "hidden"; continue; }
        const side = clamp(d, -1, 1);
        const sc = 1 - (1 - c.inactiveScale) * Math.min(1, a);
        el.style.visibility = "visible";
        el.style.transform = `translate3d(${(d * step + side * (c.cardWidth * 0.12) * Math.min(1, a)).toFixed(2)}px,0,${(-a * 70).toFixed(1)}px) rotateY(${(-side * c.rotation).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.opacity = String(a < 2.2 ? 1 : Math.max(0, 1 - (a - 2.2) / 1.2).toFixed(3));
        el.style.filter = a > 0.6 ? `brightness(${(1 - Math.min(0.12, (a - 0.6) * 0.06)).toFixed(3)})` : "none";
      }
      const idx = mod(Math.round(s.pos), c.n);
      if (idx !== s.active) { s.active = idx; onActiveRef.current?.(idx); }
    };
    paint();

    let raf = 0, last = performance.now(), acc = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      const c = cfg.current;
      if (!s.inView || document.hidden) return;
      if (!s.drag) {
        if (c.autoplay && t > s.resume) {
          acc += dt;
          if (acc >= c.delay) { acc = 0; s.target = Math.round(s.target) + 1; }
        } else acc = 0;
        const k = 1 - Math.exp(-dt * (1.6 + c.speed * 0.9));
        if (Math.abs(s.target - s.pos) > 0.0005) { s.pos += (s.target - s.pos) * k; paint(); }
        else if (s.pos !== s.target) { s.pos = s.target; paint(); }
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => { s.inView = e.isIntersecting; }, { rootMargin: "80px" });
    io.observe(root.current);
    s.paint = paint;
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [n, cardWidth, rotation, inactiveScale]);

  const hold = () => { st.current.resume = performance.now() + 4000; };
  const go = (i) => {
    const s = st.current;
    let d = mod(i - s.target, n);
    if (d > n / 2) d -= n;
    s.target = Math.round(s.target) + d;
    hold();
  };

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const s = st.current;
    s.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, t: performance.now(), v: 0, start: s.pos, captured: false };
    s.moved = false;
    hold();
  };
  const onMove = (e) => {
    const s = st.current, d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    const dxTotal = e.clientX - d.sx;
    if (!d.captured && Math.abs(dxTotal) > 6) { d.captured = true; s.moved = true; root.current.setPointerCapture?.(e.pointerId); }
    if (!d.captured) return;
    const step = cardWidth * 0.64;
    const now = performance.now();
    const dv = (-(e.clientX - d.x) / step) / (Math.max(1, now - d.t) / 1000);
    d.v = d.v * 0.6 + dv * 0.4;
    s.pos -= (e.clientX - d.x) / step;
    s.target = s.pos;
    d.x = e.clientX; d.t = now;
    s.paint?.();
    hold();
  };
  const onUp = (e) => {
    const s = st.current, d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    s.drag = null;
    if (d.captured) {
      const flick = performance.now() - d.t < 90 ? clamp(d.v * 0.25, -2, 2) : 0;
      s.target = Math.round(s.pos + flick);
    }
    hold();
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(mod(Math.round(st.current.target) - 1, n)); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(mod(Math.round(st.current.target) + 1, n)); }
      }}
      className={`relative w-full select-none overflow-hidden outline-none ${className}`}
      style={{ perspective, touchAction: "pan-y", height: cardHeight + 70 }}
    >
      {items.map((it, i) => {
        const src = dpr >= 1.5 && it.hd ? it.hd : it.src;
        const Tag = it.href ? "a" : "div";
        // Photo shape differs from the card shape (portrait phone photos): show it WHOLE on a blurred copy of itself instead of cropping.
        const ratio = it.w && it.h ? it.w / it.h : 0;
        const fill = ratio && Math.abs(ratio / (cardWidth / cardHeight) - 1) > 0.06;
        return (
          <Tag
            key={it.src}
            ref={(el) => (cards.current[i] = el)}
            {...(it.href ? { href: it.href, target: "_blank", rel: "noreferrer", draggable: false } : {})}
            aria-label={it.alt ?? it.title}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => {
              // Front card opens the project; any other card just comes to the front.
              if (st.current.moved) { e.preventDefault(); return; }
              if (mod(Math.round(st.current.target), n) !== i) { e.preventDefault(); go(i); }
            }}
            className="absolute left-1/2 top-1/2 block overflow-hidden rounded-[22px] bg-zinc-200 dark:bg-zinc-800 shadow-[0_18px_40px_-14px_rgba(20,21,26,.45)] will-change-transform"
            style={{ width: cardWidth, height: cardHeight, marginLeft: -cardWidth / 2, marginTop: -cardHeight / 2, visibility: "hidden", backfaceVisibility: "hidden" }}
          >
            {fill && <img data-src={it.thumb || src} alt="" aria-hidden draggable={false} decoding="async" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl" />}
            <img data-src={src} alt="" draggable={false} decoding="async" className={`relative h-full w-full ${fill ? "object-contain" : "object-cover"}`} />
          </Tag>
        );
      })}
    </div>
  );
}
