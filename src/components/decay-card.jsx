/* DecayCard (Motion Brew style).
   A full-bleed image card laid over a second image. On pointer enter the picture decays from the inside out:
   a superellipse hole, roughened by slow sine waves and fixed per-vertex grit and ringed by flecks, opens where the
   pointer entered and grows until the second image shows through. Leaving grows the picture back until it is whole,
   then the requestAnimationFrame loop rests. The card leans toward the pointer on springs, with a soft-light glare
   and text that drifts against the lean. Reduced motion shows the plain picture.
   props: src, revealSrc, title, tag?, line?, alt?, className? */
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const TAU = Math.PI * 2;
const N = 168; // outline vertices
const EXP = 4; // superellipse exponent (4 = squircle)
const CHUNKS = 64;
const SPECKS = 150;

/* deterministic pseudo random so the grit is fixed between renders */
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const WAVES = [
  { k: 3, amp: 0.045, speed: 0.55 },
  { k: 5, amp: 0.03, speed: -0.8 },
  { k: 9, amp: 0.016, speed: 1.15 },
  { k: 14, amp: 0.008, speed: -1.6 },
];

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function makeDecay() {
  const rand = seeded(1337);
  return {
    phase: WAVES.map(() => rand() * TAU),
    grit: Array.from({ length: N }, () => (rand() - 0.5) * 0.03),
    chunks: Array.from({ length: CHUNKS }, () => ({
      a: rand() * TAU,
      off: 0.015 + rand() * 0.05,
      size: 0.012 + rand() * 0.03,
      rot: rand() * TAU,
      sides: 3 + Math.floor(rand() * 3),
      from: 0.05 + rand() * 0.9,
    })),
    specks: Array.from({ length: SPECKS }, () => ({
      a: rand() * TAU,
      off: 0.06 + rand() * 0.16,
      size: 0.0035 + rand() * 0.007,
      from: 0.05 + rand() * 0.9,
    })),
  };
}

const sgnPow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

/* draw `img` like object-fit: cover into a w x h box */
function drawCover(ctx, img, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function DecayCard({
  src,
  revealSrc,
  title,
  tag = "Featured",
  line = "",
  alt = "",
  className = "",
}) {
  const reduce = !!useReducedMotion();
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const revealRef = useRef(null);
  const api = useRef({ enter: () => {}, move: () => {}, leave: () => {} });

  /* lean, lift, glare and text drift: all spring driven */
  const px = useMotionValue(0); // -0.5 .. 0.5 across the card
  const py = useMotionValue(0);
  const gx = useMotionValue(50); // glare centre in %
  const gy = useMotionValue(50);
  const cfg = { stiffness: 170, damping: 18, mass: 0.6 };
  const sx = useSpring(px, cfg);
  const sy = useSpring(py, cfg);
  const sgx = useSpring(gx, { stiffness: 220, damping: 26 });
  const sgy = useSpring(gy, { stiffness: 220, damping: 26 });
  const lift = useSpring(0, { stiffness: 220, damping: 20 });
  const glare = useSpring(0, { stiffness: 160, damping: 22 });
  const rotateX = useTransform(sy, (v) => -v * 14);
  const rotateY = useTransform(sx, (v) => v * 14);
  const textX = useTransform(sx, (v) => v * -16);
  const textY = useTransform(sy, (v) => v * -12);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${sgx}% ${sgy}%, rgba(255,255,255,.9), rgba(255,255,255,0) 58%)`;

  /* the decay engine: one canvas, a rAF loop that rests when the picture is whole */
  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const card = cardRef.current;
    const reveal = revealRef.current;
    if (!canvas || !card) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const decay = makeDecay();
    const img = new Image();
    img.decoding = "async";
    let loaded = false;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let time = 0;
    let p = 0; // 0 whole .. 1 fully decayed
    let target = 0;
    let origin = { x: 0.5, y: 0.5 }; // where the pointer entered (card fractions)
    let pointer = { x: 0.5, y: 0.5 };
    let centre = { x: 0.5, y: 0.5 };

    const size = () => {
      const r = card.getBoundingClientRect();
      w = card.offsetWidth || r.width;
      h = card.offsetHeight || r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* superellipse radius multiplier at angle a, roughened */
    const rough = (a, i) => {
      let m = 1 + decay.grit[i];
      for (let k = 0; k < WAVES.length; k++) {
        const wv = WAVES[k];
        m += wv.amp * Math.sin(wv.k * a + decay.phase[k] + time * wv.speed);
      }
      return m;
    };

    const outline = (cx, cy, ax, by, scale) => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU;
        const m = scale * rough(a, i);
        const x = cx + ax * m * sgnPow(Math.cos(a), 2 / EXP);
        const y = cy + by * m * sgnPow(Math.sin(a), 2 / EXP);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const render = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      if (!loaded) return;
      drawCover(ctx, img, w, h);

      const e = easeOut(clamp01(p));
      if (e > 0.0005) {
        const cx = centre.x * w;
        const cy = centre.y * h;
        const ax = w / 2; // superellipse matched to the card proportions
        const by = h / 2;
        // scale needed for the outline to swallow the farthest corner from the centre
        const need = Math.pow(
          Math.pow(Math.max(cx, w - cx) / ax, EXP) + Math.pow(Math.max(cy, h - cy) / by, EXP),
          1 / EXP,
        );
        const full = need * 1.2 + 0.1; // margin for the roughness and the flecks
        const scale = Math.max(0.0001, e * full);

        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        outline(cx, cy, ax, by, scale);
        ctx.fill();

        /* flecks: chunks just past the edge, fine specks further out */
        const fade = Math.min(1, e * 8) * (1 - clamp01((e - 0.82) / 0.18));
        if (fade > 0.01) {
          const unit = Math.min(w, h);
          for (const c of decay.chunks) {
            if (e < c.from * 0.9) continue;
            const a = c.a;
            const i = Math.floor((a / TAU) * N) % N;
            const m = scale * rough(a, i) * (1 + c.off);
            const x = cx + ax * m * sgnPow(Math.cos(a), 2 / EXP);
            const y = cy + by * m * sgnPow(Math.sin(a), 2 / EXP);
            const r = c.size * unit * fade;
            ctx.beginPath();
            for (let s = 0; s < c.sides; s++) {
              const aa = c.rot + (s / c.sides) * TAU + time * 0.2;
              const rr = r * (0.7 + 0.3 * Math.sin(s * 2.3 + c.rot));
              const vx = x + Math.cos(aa) * rr;
              const vy = y + Math.sin(aa) * rr;
              if (s === 0) ctx.moveTo(vx, vy);
              else ctx.lineTo(vx, vy);
            }
            ctx.closePath();
            ctx.fill();
          }
          for (const s of decay.specks) {
            if (e < s.from * 0.9) continue;
            const a = s.a;
            const i = Math.floor((a / TAU) * N) % N;
            const m = scale * rough(a, i) * (1 + s.off);
            const x = cx + ax * m * sgnPow(Math.cos(a), 2 / EXP);
            const y = cy + by * m * sgnPow(Math.sin(a), 2 / EXP);
            const r = s.size * unit * fade;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      /* the picture underneath: eases in from a slight zoom, then drifts after the pointer */
      if (reveal) {
        const zoom = 1 + 0.14 * (1 - easeOut(clamp01(p)));
        const dx = (pointer.x - 0.5) * -26 * easeOut(clamp01(p));
        const dy = (pointer.y - 0.5) * -26 * easeOut(clamp01(p));
        reveal.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${zoom * 1.06})`;
      }
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;
      // grow slowly, heal a little faster
      if (p < target) p = Math.min(target, p + dt / 1.9);
      else if (p > target) p = Math.max(target, p - dt / 0.9);
      // the hole drifts after the pointer once it has opened
      const follow = 0.35 * clamp01(p * 1.5);
      const tx = origin.x + (pointer.x - origin.x) * follow;
      const ty = origin.y + (pointer.y - origin.y) * follow;
      centre.x += (tx - centre.x) * Math.min(1, dt * 5);
      centre.y += (ty - centre.y) * Math.min(1, dt * 5);
      render();
      if (target === 0 && p <= 0) {
        // whole again: draw the plain picture once and rest the loop
        raf = 0;
        render();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const frac = (e) => {
      const r = card.getBoundingClientRect();
      return {
        x: clamp01((e.clientX - r.left) / (r.width || 1)),
        y: clamp01((e.clientY - r.top) / (r.height || 1)),
      };
    };
    api.current = {
      enter: (e) => {
        origin = frac(e);
        pointer = origin;
        if (p <= 0) centre = { ...origin };
        target = 1;
        wake();
      },
      move: (e) => {
        pointer = frac(e);
        if (target === 1) wake();
      },
      leave: () => {
        target = 0;
        wake();
      },
    };

    img.onload = () => {
      loaded = true;
      size();
      render();
    };
    img.src = src;
    if (img.complete && img.naturalWidth) {
      loaded = true;
    }
    size();
    render();
    const ro = new ResizeObserver(() => {
      size();
      render();
    });
    ro.observe(card);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      api.current = { enter: () => {}, move: () => {}, leave: () => {} };
    };
  }, [src, reduce]);

  const track = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(clamp01(x) - 0.5);
    py.set(clamp01(y) - 0.5);
    gx.set(clamp01(x) * 100);
    gy.set(clamp01(y) * 100);
  };
  const onEnter = (e) => {
    if (reduce) return;
    track(e);
    lift.set(-8);
    glare.set(0.55);
    api.current.enter(e);
  };
  const onMove = (e) => {
    if (reduce) return;
    track(e);
    api.current.move(e);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    lift.set(0);
    glare.set(0);
    api.current.leave();
  };

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{ perspective: 1000 }}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
    >
      <motion.div
        ref={cardRef}
        className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-[1.75rem] bg-ink/10 text-white shadow-2xl ring-1 ring-ink/10"
        style={
          reduce
            ? undefined
            : { rotateX, rotateY, y: lift, transformStyle: "preserve-3d", willChange: "transform" }
        }
      >
        {/* the second image, uncovered as the first one decays */}
        {!reduce && revealSrc && (
          <img
            ref={revealRef}
            src={revealSrc}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
          />
        )}

        {/* the first image: plain <img> for reduced motion, canvas otherwise */}
        {reduce ? (
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={alt || title}
            className="absolute inset-0 h-full w-full"
          />
        )}

        {/* dark bottom wash so the text stays readable on both pictures */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        />

        {/* soft-light glare that follows the pointer */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: glareBg, opacity: glare, mixBlendMode: "soft-light" }}
          />
        )}

        {/* text: crisp DOM, drifts against the lean */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:p-7"
          style={reduce ? undefined : { x: textX, y: textY, translateZ: 40 }}
        >
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white ring-1 ring-white/25 backdrop-blur-md">
            {tag}
          </span>
          <h2 className="font-display text-3xl font-semibold leading-[1.02] text-white sm:text-4xl">
            {title}
          </h2>
          {line && <p className="max-w-[22rem] text-sm leading-snug text-white/80 sm:text-base">{line}</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DecayCard;
