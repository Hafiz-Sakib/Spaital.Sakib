// Infinite gallery: a drifting wall of photos you can drag.
//
// Local copy of `InfiniteGallery` from Motion Brew (MIT, motion-brew.com) with ONE change: the library reuses the same
// cols x rows photos forever (so a 400-photo library only ever showed ~30). Here a card gets the NEXT photo every time it
// wraps around the wall, so every photo in the list is shown while you drift or drag.
import * as React from "react";
import { animate, useAnimationFrame, useReducedMotion } from "motion/react";
import { jsx, jsxs } from "react/jsx-runtime";

const cn = (...a) => a.filter(Boolean).join(" ");
const ArrowUpRightIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
);
const DEFAULT_ITEMS = [];
var mod = (a, n) => (a % n + n) % n;
function spread(n, cols, rows) {
  if (n < 2) return [0, 0];
  let best = [1, Math.min(2, n - 1)];
  let bestScore = -1;
  for (let a = 1; a < n; a++)
    for (let b = 1; b < n; b++) {
      const diffs = [a, b, a + b, a - b, a * (cols - 1), b * (rows - 1), 2 * a];
      const score = diffs.filter((d) => mod(d, n) !== 0).length;
      if (score > bestScore) best = [a, b], bestScore = score;
      if (score === diffs.length) return [a, b];
    }
  return best;
}
var InfiniteGallery = React.forwardRef(function InfiniteGallery2({
  items = DEFAULT_ITEMS,
  cardWidth = 220,
  cardHeight = 280,
  gap = 20,
  stagger = true,
  drift = 24,
  momentum = 0.6,
  depth = 0.35,
  parallax = 0.5,
  wheel = true,
  stretch = 0.6,
  blur = 6,
  intro = true,
  pixelate = true,
  pixelSize = 12,
  showTitles = true,
  newTab = false,
  label = "Project gallery",
  className
}, forwardedRef) {
  const still = !!useReducedMotion();
  const root = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => root.current);
  const [view, setView] = React.useState({ w: 0, h: 0 });
  const cards = React.useRef([]);
  const media = React.useRef([]);
  const sources = React.useRef(
    []
  );
  const canvases = React.useRef([]);
  const resolving = React.useRef(new Map());
  const cam = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    speed: 0
  });
  const drag = React.useRef(null);
  const swallowClick = React.useRef(false);
  const hovering = React.useRef(false);
  const settings = React.useRef({
    drift,
    momentum,
    depth,
    parallax,
    stretch,
    blur,
    still
  });
  settings.current = { drift, momentum, depth, parallax, stretch, blur, still };
  const band = React.useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const blurNode = React.useRef(null);
  const wall = React.useRef(null);
  const cellW = cardWidth + gap;
  const cellH = cardHeight + gap;
  const cols = view.w ? Math.ceil(view.w / cellW) + 2 : 0;
  const rows = view.h ? Math.ceil(view.h / cellH) + 2 : 0;
  const steps = React.useMemo(() => spread(items.length, cols, rows), [items.length, cols, rows]);
  const assigned = React.useRef([]); // slot -> photo index it currently shows
  const slots = React.useMemo(() => {
    const n = items.length;
    const [stepX, stepY] = steps;
    const out = [];
    const seen = new Set();
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const item = mod(c * stepX + r * stepY, n);
        out.push({ c, r, item, first: !seen.has(item) });
        seen.add(item);
      }
    return out;
  }, [cols, rows, items.length, steps]);
  React.useEffect(() => { assigned.current = []; }, [slots, items]);
  const introAt = React.useRef(null);
  const introDone = React.useRef(!intro || still);
  const introStarted = React.useRef([]);
  React.useEffect(() => {
    const el = root.current;
    if (!el || introDone.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && introAt.current === null) {
          introAt.current = performance.now() + 120;
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
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
    if (!el || !wheel) return;
    const onWheel = (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 32 : 1;
      cam.current.tx -= e.deltaX * k;
      cam.current.ty -= e.deltaY * k;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel]);
  useAnimationFrame((_, delta) => {
    if (!cols || !rows) return;
    const dt = Math.min(delta, 50) / 1e3;
    const s = settings.current;
    const c = cam.current;
    if (!drag.current) {
      c.tx += c.vx * dt;
      c.ty += c.vy * dt;
      const decay = Math.exp(-dt * (1.5 + (1 - s.momentum) * 10));
      c.vx *= decay;
      c.vy *= decay;
      if (!hovering.current && !s.still && s.drift > 0) {
        c.tx -= s.drift * dt * 0.6;
        c.ty -= s.drift * dt;
      }
    }
    const px = c.x;
    const py = c.y;
    const ease = s.still ? 1 : 1 - Math.exp(-dt * 12);
    c.x += (c.tx - c.x) * ease;
    c.y += (c.ty - c.y) * ease;
    const sp = dt > 0 ? Math.hypot(c.x - px, c.y - py) / dt : 0;
    c.speed += (sp - c.speed) * Math.min(1, dt * 8);
    const spanX = cols * cellW;
    const spanY = rows * cellH;
    const cx = view.w / 2;
    const cy = view.h / 2;
    const reach = Math.hypot(cx, cy) || 1;
    const rush = s.still ? 1 : 1 - Math.min(0.08, c.speed / 9e3);
    const b = band.current;
    const camVx = dt > 0 ? (c.x - px) / dt : 0;
    const camVy = dt > 0 ? (c.y - py) / dt : 0;
    const K = 190;
    const D = 2 * Math.sqrt(K) * 0.5;
    b.vx += ((camVx - b.x) * K - b.vx * D) * dt;
    b.vy += ((camVy - b.y) * K - b.vy * D) * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const pull = Math.hypot(b.x, b.y);
    const amount = s.still ? 0 : Math.min(0.2, pull / 3800) * s.stretch;
    const angle = Math.atan2(b.y, b.x);
    const rubber = amount > 5e-4 ? ` rotate(${angle.toFixed(4)}rad) scale(${(1 + amount).toFixed(4)}, ${(1 - amount * 0.45).toFixed(4)}) rotate(${(-angle).toFixed(4)}rad)` : "";
    const sdx = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.x) / 220);
    const sdy = s.still || !s.blur ? 0 : Math.min(s.blur, Math.abs(b.y) / 220);
    blurNode.current?.setAttribute(
      "stdDeviation",
      `${sdx.toFixed(2)} ${sdy.toFixed(2)}`
    );
    if (wall.current)
      wall.current.style.filter = sdx + sdy > 0.08 ? `url(#${uid}-blur)` : "none";
    const INTRO_SPREAD = 0.6;
    const INTRO_DURATION = 0.9;
    const introClock = introDone.current ? Infinity : introAt.current === null ? -1 : (performance.now() - introAt.current) / 1e3;
    if (introClock > INTRO_SPREAD + INTRO_DURATION + 0.1) {
      introDone.current = true;
      cards.current.forEach(
        (el) => el && (el.style.opacity = "", el.style.filter = "")
      );
    }
    slots.forEach((slot, i) => {
      const el = cards.current[i];
      if (!el) return;
      const shift = stagger && slot.c % 2 ? cellH * 0.45 : 0;
      const rawX = slot.c * cellW + c.x;
      const rawY = slot.r * cellH + c.y + shift;
      const x = mod(rawX, spanX) - cellW;
      const y = mod(rawY, spanY) - cellH;
      // Virtual wall cell this card stands for after wrapping around: it gets that cell's photo.
      const vc = slot.c - Math.floor(rawX / spanX) * cols;
      const vr = slot.r - Math.floor(rawY / spanY) * rows;
      const want = mod(vc * steps[0] + vr * steps[1], items.length);
      if (assigned.current[i] !== want) {
        assigned.current[i] = want;
        const it = items[want];
        const im = sources.current[i];
        if (im && it) {
          im.loading = "eager";
          im.src = it.src;
          im.alt = it.alt ?? it.title ?? "";
        }
        if (it?.href) el.setAttribute("href", it.href);
      }
      const mx = x + cardWidth / 2 - cx;
      const my = y + cardHeight / 2 - cy;
      const scale = s.still ? 1 : (1 - Math.hypot(mx, my) / reach * 0.14 * s.depth) * rush;
      let lift = 0;
      let grow = 1;
      if (!introDone.current) {
        const delay = Math.hypot(mx, my) / reach * INTRO_SPREAD + i * 0.137 % 0.08;
        const p = Math.min(
          1,
          Math.max(0, (introClock - delay) / INTRO_DURATION)
        );
        const e = 1 - Math.pow(1 - p, 4);
        lift = (1 - e) * 36;
        grow = 0.78 + 0.22 * e;
        el.style.opacity = Math.min(1, p * 2.2).toFixed(3);
        if (p > 0 && !introStarted.current[i]) {
          introStarted.current[i] = true;
          if (!resolvePixels(i, true) && p < 1) el.dataset.blurIn = "1";
        }
        el.style.filter = el.dataset.blurIn && p < 1 ? `blur(${((1 - e) * 10).toFixed(2)}px)` : "";
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(y + lift).toFixed(2)}px, 0) scale(${(scale * grow).toFixed(4)})${rubber}`;
      const img = media.current[i];
      if (img && !s.still) {
        const k = s.parallax * 0.06;
        img.style.transform = `translate3d(${(-mx * k).toFixed(2)}px, ${(-my * k).toFixed(2)}px, 0)`;
      }
    });
  });
  const local = (e) => ({ x: e.clientX, y: e.clientY });
  const resolvePixels = (i, fromIntro = false) => {
    if (!pixelate || still || !fromIntro && drag.current?.moved) return false;
    const src = sources.current[i];
    const canvas = canvases.current[i];
    if (!src || !canvas) return false;
    const natW = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
    const natH = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
    if (!natW || !natH) return false;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return false;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const k = Math.max(W / natW, H / natH);
    const sw = W / k;
    const sh = H / k;
    const sx = (natW - sw) / 2;
    const sy = (natH - sh) / 2;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");
    if (!sctx) return false;
    const draw = (block) => {
      const w = Math.max(1, Math.ceil(W / block));
      const h = Math.max(1, Math.ceil(H / block));
      small.width = w;
      small.height = h;
      sctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, w, h, 0, 0, w * block, h * block);
    };
    const steps = [1, 0.72, 0.5, 0.34, 0.22, 0.13, 0.07].map(
      (f) => Math.max(2, Math.round(pixelSize * f))
    );
    resolving.current.get(i)?.stop();
    let shown = -1;
    canvas.style.transition = "none";
    canvas.style.opacity = "1";
    draw(steps[0]);
    resolving.current.set(
      i,
      animate(0, steps.length, {
        duration: 0.55,
        ease: "linear",
        onUpdate: (v) => {
          const at = Math.min(steps.length - 1, Math.floor(v));
          if (at !== shown) {
            shown = at;
            draw(steps[at]);
          }
        },
        onComplete: () => {
          canvas.style.transition = "opacity 180ms ease-out";
          canvas.style.opacity = "0";
          resolving.current.delete(i);
        }
      })
    );
    return true;
  };
  React.useEffect(() => () => resolving.current.forEach((c) => c.stop()), []);
  return jsxs(
    "div",
    {
      ref: root,
      role: "region",
      "aria-label": label,
      "aria-roledescription": "infinite gallery",
      tabIndex: 0,
      onPointerEnter: (e) => e.pointerType === "mouse" && (hovering.current = true),
      onPointerLeave: () => hovering.current = false,
      onPointerDown: (e) => {
        if (e.button !== 0) return;
        const p = local(e);
        drag.current = {
          id: e.pointerId,
          x: p.x,
          y: p.y,
          sx: p.x,
          sy: p.y,
          t: performance.now(),
          moved: false
        };
        cam.current.vx = cam.current.vy = 0;
        swallowClick.current = false;
      },
      onPointerMove: (e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const p = local(e);
        const now = performance.now();
        const dx = p.x - d.x;
        const dy = p.y - d.y;
        const dt = Math.max(1, now - d.t) / 1e3;
        if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 5) {
          d.moved = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        cam.current.tx += dx;
        cam.current.ty += dy;
        cam.current.vx = cam.current.vx * 0.6 + dx / dt * 0.4;
        cam.current.vy = cam.current.vy * 0.6 + dy / dt * 0.4;
        Object.assign(d, { x: p.x, y: p.y, t: now });
      },
      onPointerUp: (e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (d.moved) swallowClick.current = true;
        if (performance.now() - d.t > 80 || still)
          cam.current.vx = cam.current.vy = 0;
        drag.current = null;
      },
      onPointerCancel: () => drag.current = null,
      onKeyDown: (e) => {
        const step = {
          ArrowLeft: [cellW, 0],
          ArrowRight: [-cellW, 0],
          ArrowUp: [0, cellH],
          ArrowDown: [0, -cellH]
        }[e.key];
        if (!step || e.target !== e.currentTarget) return;
        e.preventDefault();
        cam.current.tx += step[0];
        cam.current.ty += step[1];
      },
      className: cn(
        "relative h-[520px] w-full cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-inset",
        className
      ),
      children: [
        jsx("svg", { "aria-hidden": true, className: "absolute size-0", children: jsx("filter", { id: `${uid}-blur`, x: "-10%", y: "-10%", width: "120%", height: "120%", children: jsx("feGaussianBlur", { ref: blurNode, stdDeviation: "0 0" }) }) }),
        jsx("div", { ref: wall, className: "absolute inset-0", children: slots.map((slot, i) => {
          const item = items[slot.item];
          const Card = items[0]?.href ? "a" : "div";
          const repeat = !slot.first;
          return jsxs(
            Card,
            {
              ref: (el) => void (cards.current[i] = el),
              ...items[0]?.href ? {
                draggable: false,
                ...newTab ? { target: "_blank", rel: "noreferrer" } : {}
              } : {},
              ...repeat ? { "aria-hidden": true, tabIndex: -1 } : {},
              onClick: (e) => {
                if (swallowClick.current) e.preventDefault();
              },
              onDragStart: (e) => e.preventDefault(),
              onPointerEnter: (e) => e.pointerType === "mouse" && resolvePixels(i),
              onFocus: () => resolvePixels(i),
              className: "group/card absolute left-0 top-0 block origin-center overflow-hidden rounded-[20px] bg-zinc-200 outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-zinc-900 dark:bg-zinc-800",
              style: {
                width: cardWidth,
                height: cardHeight,
                opacity: introDone.current ? void 0 : 0
              },
              children: [
                jsx("span", { className: "absolute -inset-[8%] block", children: jsx(
                  "span",
                  {
                    ref: (el) => void (media.current[i] = el),
                    className: "block size-full will-change-transform",
                    children: jsxs("span", { className: "relative block size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]", children: [
                      item.video ? jsx(
                        "video",
                        {
                          src: item.video,
                          poster: item.src,
                          muted: true,
                          loop: true,
                          autoPlay: true,
                          playsInline: true,
                          "aria-label": item.alt ?? item.title,
                          ref: (el) => void (sources.current[i] = el),
                          className: "block size-full object-cover"
                        }
                      ) : jsx(
                        "img",
                        {
                          alt: "",
                          loading: "lazy",
                          decoding: "async",
                          draggable: false,
                          ref: (el) => void (sources.current[i] = el),
                          className: "block size-full object-cover"
                        }
                      ),
                      pixelate && jsx(
                        "canvas",
                        {
                          "aria-hidden": true,
                          ref: (el) => void (canvases.current[i] = el),
                          className: "pointer-events-none absolute inset-0 size-full opacity-0"
                        }
                      )
                    ] })
                  }
                ) }),
                showTitles && jsxs("span", { className: "pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between gap-2 opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100", children: [
                  jsx("span", { className: "truncate rounded-full bg-white px-3.5 py-2 text-[12px] font-medium leading-none text-zinc-900", children: item.title }),
                  item.href && jsx("span", { className: "grid size-8 shrink-0 place-items-center rounded-full bg-white text-zinc-900", children: jsx(ArrowUpRightIcon, { className: "size-4", strokeWidth: 2.25 }) })
                ] })
              ]
            },
            `${slot.c}-${slot.r}`
          );
        }) })
      ]
    }
  );
});

export {
  InfiniteGallery
};
