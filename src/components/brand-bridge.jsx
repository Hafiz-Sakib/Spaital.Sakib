/* BrandBridge (Motion Brew "Brand bridge"): a feature card with brand tiles wired to a hub by gradient lines in each brand's
   colours, glowing comets, magnetic wires and a particle field that scatters from the pointer.
   Press a tile to connect it: the wire draws in, particles stream to the hub and the tile fills with the brand's colour.
   Press again to disconnect.

   <BrandBridge title="..." particles={240} speed={1.7} onToggle={(id, on) => ...} />
   Custom brands: brands={[{ id, name, icon: (props) => <svg/>, color: "#1877F2" | "linear-gradient(...)", colors: ["#1877F2"], whiteIcon?: true }]}
   - `color` is the tile's background once connected (any CSS background), `colors` colour the wire and the hub border,
     `whiteIcon: false` keeps the logo's own colours on the connected tile (use it for light tiles like Google).
   - the graphic is drawn at a fixed size and scaled to fit narrower cards; everything pauses off screen;
     reduced motion shows every wire connected and keeps wires and particles still. */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { FaSlack } from "react-icons/fa6";
import { SiFacebook, SiGithub, SiSpotify, SiStripe } from "react-icons/si";

const mk = (Cmp, color) => {
  const C = (p) => <Cmp {...p} style={{ color }} />;
  return C;
};

export const DEFAULT_BRANDS = [
  { id: "google", name: "Google", icon: (p) => <FcGoogle {...p} />, color: "#ffffff", colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"], whiteIcon: false },
  { id: "facebook", name: "Facebook", icon: mk(SiFacebook, "#1877F2"), color: "#1877F2", colors: ["#1877F2"] },
  { id: "slack", name: "Slack", icon: mk(FaSlack, "#4A154B"), color: "#4A154B", colors: ["#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"] },
  { id: "github", name: "GitHub", icon: mk(SiGithub, "#181717"), color: "#181717", colors: ["#6e7681", "#181717"] },
  { id: "stripe", name: "Stripe", icon: mk(SiStripe, "#635BFF"), color: "#635BFF", colors: ["#635BFF"] },
  { id: "spotify", name: "Spotify", icon: mk(SiSpotify, "#1DB954"), color: "#1DB954", colors: ["#1DB954"] },
];

/* ---------- geometry (drawn at a fixed size, scaled to fit) ---------- */
const GW = 400;
const TILE = 52;
const HUB = 88;
const PITCH = 56;
const PAD = 18;

function build(brands) {
  const n = brands.length;
  const ml = Math.ceil(n / 2);
  const cols = [brands.slice(0, ml), brands.slice(ml)];
  const rows = Math.max(ml, n - ml, 1);
  const GH = Math.max(rows * PITCH, 224);
  const HX = GW / 2;
  const HY = GH / 2;
  const tiles = [];
  cols.forEach((col, ci) => {
    const m = col.length;
    const left = ci === 0;
    const tx = left ? 36 : GW - 36;
    const spread = m > 1 ? Math.min(18, (HUB - 30) / (m - 1)) : 0;
    col.forEach((brand, k) => {
      const y = m > 1 ? TILE / 2 + 2 + (k * (GH - TILE - 4)) / (m - 1) : GH / 2;
      const x1 = left ? tx + TILE / 2 : tx - TILE / 2;
      const x2 = left ? HX - HUB / 2 : HX + HUB / 2;
      const y2 = HY + (k - (m - 1) / 2) * spread;
      const s = left ? 1 : -1;
      const dx = Math.abs(x2 - x1) * 0.5;
      const pts = [[x1, y], [x1 + s * dx, y], [x2 - s * dx, y2], [x2, y2]];
      const f = (v) => +v.toFixed(1);
      const d = `M${f(pts[0][0])} ${f(pts[0][1])} C${f(pts[1][0])} ${f(pts[1][1])} ${f(pts[2][0])} ${f(pts[2][1])} ${f(pts[3][0])} ${f(pts[3][1])}`;
      // sample the resting curve so the pointer can find its nearest point
      const samples = Array.from({ length: 21 }, (_, j) => {
        const t = j / 20, u = 1 - t;
        const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        return [
          b[0] * pts[0][0] + b[1] * pts[1][0] + b[2] * pts[2][0] + b[3] * pts[3][0],
          b[0] * pts[0][1] + b[1] * pts[1][1] + b[2] * pts[2][1] + b[3] * pts[3][1],
        ];
      });
      tiles.push({ brand, left, x: tx, y, pts, d, samples, i: tiles.length });
    });
  });
  const byId = {};
  tiles.forEach((t) => (byId[t.brand.id] = t));
  return { GH, HX, HY, tiles, byId };
}

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
const readInk = () => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim().split(/\s+/).map(Number);
    return v.length === 3 && v.every((x) => !Number.isNaN(x)) ? v : [20, 21, 26];
  } catch {
    return [20, 21, 26];
  }
};

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="4" className="fill-ink" />
      <rect x="14" y="13" width="13" height="13" rx="4" fill="none" className="stroke-ink" strokeWidth="2" />
    </svg>
  );
}

export function BrandBridge({
  title = "All your tools, one hub",
  description = "Connect the apps your team already uses and keep every account in sync. Tap a logo to link it, tap it again to let it go.",
  brands = DEFAULT_BRANDS,
  particles = 240,
  speed = 1,
  onToggle,
  center,
  className = "",
}) {
  const still = !!useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const geo = useMemo(() => build(brands), [brands]);
  const { GH, HX, HY, tiles, byId } = geo;

  const cardRef = useRef(null);
  const gfxRef = useRef(null);
  const bgRef = useRef(null);
  const fxRef = useRef(null);
  const ringRef = useRef(null);
  const seen = useInView(cardRef, { once: true, amount: 0.3 });
  const live = useInView(cardRef, { amount: 0.05 });

  const [dims, setDims] = useState({ w: GW, scale: 1 });
  const [conn, setConn] = useState(() => (still ? new Set(brands.map((b) => b.id)) : new Set()));
  const [hover, setHover] = useState(null);

  const connRef = useRef(conn);
  const hoverRef = useRef(null);
  const ptr = useRef(null);
  const manual = useRef(false);
  const hovGfx = useRef(false);
  const liveRef = useRef(live);
  liveRef.current = live;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;
  const geomRef = useRef({ w: GW, h: GH + PAD * 2, scale: 1, ox: 0, oy: PAD });
  const els = useRef({});
  const rt = useRef({});
  const fx = useRef([]);
  const field = useRef([]);
  const stateRef = useRef({ tiles, byId, HX, HY });
  stateRef.current = { tiles, byId, HX, HY };

  useEffect(() => {
    if (still) {
      const all = new Set(brands.map((b) => b.id));
      connRef.current = all;
      setConn(all);
    }
  }, [still, brands]);

  /* fit the fixed-size graphic into the card */
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth || GW;
      setDims({ w, scale: Math.min(1, (w - 24) / GW) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gfxH = GH * dims.scale + PAD * 2;
  geomRef.current = { w: dims.w, h: gfxH, scale: dims.scale, ox: (dims.w - GW * dims.scale) / 2, oy: PAD };

  const getRt = (id) =>
    (rt.current[id] ||= { off: [0, 0, 0, 0], vel: [0, 0, 0, 0], mag: 0, L: 0, bent: false, connectedAt: 0, comet: { running: false, next: 0, t0: 0, dur: 1, landed: false } });

  /* ---------- effects: pulses, sparks, bursts ---------- */
  const toC = (x, y) => {
    const G = geomRef.current;
    return [G.ox + x * G.scale, G.oy + y * G.scale];
  };
  const pulseHub = (color) => {
    const el = ringRef.current;
    if (!el || still) return;
    el.style.borderColor = color;
    animate(el, { scale: [1, 1.75], opacity: [0.65, 0] }, { duration: 0.8, ease: "easeOut" });
  };
  const land = (id) => {
    const t = stateRef.current.byId[id];
    if (!t) return;
    pulseHub(t.brand.colors[0]);
    const [ex, ey] = t.pts[3];
    const [cx, cy] = toC(ex, ey);
    const away = t.left ? Math.PI : 0; // sparks fly back out of the hub side
    for (let k = 0; k < 6; k++) {
      const a = away + rnd(-0.9, 0.9);
      const v = rnd(40, 110);
      fx.current.push({ kind: "spark", x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rnd(0.4, 0.7), color: pick(t.brand.colors), r: rnd(1, 2) });
    }
  };
  const fxFor = (id, on) => {
    if (still) return;
    const t = stateRef.current.byId[id];
    const e = els.current[id];
    if (!t || !e?.core) return;
    if (on) {
      const L = e.core.getTotalLength() || 100;
      for (let k = 0; k < 22; k++)
        fx.current.push({ kind: "stream", el: e.core, L, age: -k * 0.03 - Math.random() * 0.05, life: rnd(0.7, 1.1), color: pick(t.brand.colors), r: rnd(1.3, 2.8), jx: rnd(-8, 8), jy: rnd(-8, 8) });
    } else {
      const [cx, cy] = toC(t.pts[0][0], t.pts[0][1]);
      for (let k = 0; k < 9; k++) {
        const a = rnd(0, Math.PI * 2);
        const v = rnd(10, 36);
        fx.current.push({ kind: "puff", x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, age: 0, life: rnd(0.4, 0.7), color: "#9aa0ad", r: rnd(1.5, 3) });
      }
    }
  };

  const setBrand = useCallback((id, on, byUser) => {
    if (connRef.current.has(id) === on) return;
    const next = new Set(connRef.current);
    if (on) next.add(id);
    else next.delete(id);
    connRef.current = next;
    setConn(next);
    const r = getRt(id);
    if (on) {
      r.connectedAt = performance.now();
      r.comet = { running: false, next: performance.now() + 1100, t0: 0, dur: 1, landed: false };
    }
    fxFor(id, on);
    if (byUser) {
      manual.current = true; // autoplay hands over for good
      toggleRef.current?.(id, on);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- autoplay: wire the brands in one at a time, random order, uneven rhythm ---------- */
  useEffect(() => {
    if (still || !seen) return;
    const queue = shuffle(brands.map((b) => b.id));
    let timer;
    const step = () => {
      if (manual.current || !queue.length) return;
      if (liveRef.current && !hovGfx.current) setBrand(queue.shift(), true, false);
      timer = setTimeout(step, 450 + Math.random() * 900 + (Math.random() < 0.35 ? 900 : 0));
    };
    timer = setTimeout(step, 700);
    return () => clearTimeout(timer);
  }, [seen, still, brands, setBrand]);

  /* ---------- canvases + the one animation loop ---------- */
  useEffect(() => {
    const bg = bgRef.current;
    const fc = fxRef.current;
    if (!bg || !fc) return;
    const G0 = geomRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    [bg, fc].forEach((c) => {
      c.width = Math.round(G0.w * dpr);
      c.height = Math.round(G0.h * dpr);
      c.style.width = `${G0.w}px`;
      c.style.height = `${G0.h}px`;
    });
    const bctx = bg.getContext("2d");
    const fctx = fc.getContext("2d");
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(0, Math.round(particles));
    field.current = Array.from({ length: count }, () => ({
      x: Math.random() * G0.w, y: Math.random() * G0.h, vx: rnd(-6, 6), vy: rnd(-6, 6), s: rnd(0.8, 2.1), a: rnd(0.12, 0.4),
    }));
    let ink = readInk();
    let frames = 0;
    const smooth = (a, b, x) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    const drawField = (dt) => {
      const G = geomRef.current;
      const hub = { x: G.ox + (GW / 2) * G.scale, y: G.oy + (GH / 2) * G.scale };
      bctx.clearRect(0, 0, G.w, G.h);
      const p0 = ptr.current;
      for (const p of field.current) {
        if (dt) {
          const rx = p.x - hub.x, ry = p.y - hub.y;
          const r = Math.hypot(rx, ry) + 1;
          const sw = 16 * Math.exp(-r / 170); // slow swirl round the hub
          p.x += (p.vx - (ry / r) * sw) * dt;
          p.y += (p.vy + (rx / r) * sw) * dt;
          if (p0) {
            const dx = p.x - p0.x, dy = p.y - p0.y;
            const d = Math.hypot(dx, dy) + 0.001;
            if (d < 90) {
              const f = (90 - d) / 90;
              p.x += (dx / d) * f * 150 * dt;
              p.y += (dy / d) * f * 150 * dt;
            }
          }
          if (p.x < -4) p.x = G.w + 4;
          else if (p.x > G.w + 4) p.x = -4;
          if (p.y < -4) p.y = G.h + 4;
          else if (p.y > G.h + 4) p.y = -4;
        }
        const fade = 1 - smooth(0.5, 1, p.y / G.h); // fades out toward the text
        const a = p.a * fade;
        if (a < 0.01) continue;
        bctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${a.toFixed(3)})`;
        bctx.fillRect(p.x, p.y, p.s, p.s);
      }
    };

    if (still) {
      drawField(0);
      return;
    }
    if (!live) return;

    const setD = (id, off) => {
      const t = stateRef.current.byId[id];
      const e = els.current[id];
      if (!t || !e) return;
      const [p0, c1, c2, p3] = t.pts;
      const d = `M${p0[0]} ${p0[1]} C${(c1[0] + off[0]).toFixed(1)} ${(c1[1] + off[1]).toFixed(1)} ${(c2[0] + off[2]).toFixed(1)} ${(c2[1] + off[3]).toFixed(1)} ${p3[0]} ${p3[1]}`;
      e.wire?.setAttribute("d", d);
      e.core?.setAttribute("d", d);
      e.glow?.setAttribute("d", d);
      getRt(id).L = e.core?.getTotalLength() || 1;
    };

    let raf;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (++frames % 90 === 0) ink = readInk();
      const G = geomRef.current;
      drawField(dt);

      const sp = ptr.current ? { x: (ptr.current.x - G.ox) / G.scale, y: (ptr.current.y - G.oy) / G.scale } : null;
      const hv = hoverRef.current;

      for (const t of stateRef.current.tiles) {
        const id = t.brand.id;
        const e = els.current[id];
        if (!e?.core) continue;
        const r = getRt(id);
        if (!connRef.current.has(id)) {
          if (r.cometOn) {
            e.core.setAttribute("opacity", "0");
            e.glow.setAttribute("opacity", "0");
            r.cometOn = false;
            r.comet.running = false;
          }
          if (r.bent) {
            r.off = [0, 0, 0, 0];
            r.vel = [0, 0, 0, 0];
            setD(id, r.off);
            r.bent = false;
          }
          continue;
        }
        if (!r.L) r.L = e.core.getTotalLength() || 1;

        /* magnetic wire: control points are pulled toward the pointer on an underdamped spring */
        const tgt = [0, 0, 0, 0];
        let str = 0;
        if (sp) {
          let best = 1e9, bj = 0;
          t.samples.forEach(([x, y], j) => {
            const d = Math.hypot(x - sp.x, y - sp.y);
            if (d < best) { best = d; bj = j; }
          });
          if (best < 80) {
            str = 1 - best / 80;
            const [nx, ny] = t.samples[bj];
            const u = bj / 20;
            const px = (sp.x - nx) * str * 1.7, py = (sp.y - ny) * str * 1.7;
            tgt[0] = px * (1 - u); tgt[1] = py * (1 - u);
            tgt[2] = px * u; tgt[3] = py * u;
          }
        }
        let energy = 0;
        for (let k = 0; k < 4; k++) {
          r.vel[k] += ((tgt[k] - r.off[k]) * 170 - r.vel[k] * 8) * dt;
          r.off[k] += r.vel[k] * dt;
          energy += Math.abs(r.off[k]) + Math.abs(r.vel[k]);
        }
        r.mag += (str - r.mag) * Math.min(1, dt * 10);
        if (energy > 0.05 || str > 0) {
          setD(id, r.off);
          r.bent = true;
        } else if (r.bent) {
          setD(id, [0, 0, 0, 0]);
          r.bent = false;
        }
        const sw = (hv === id ? 3.2 : 2) + 1.4 * r.mag;
        e.wire.setAttribute("stroke-width", sw.toFixed(2));
        e.core.setAttribute("stroke-width", (sw + 1).toFixed(2));
        e.glow.setAttribute("stroke-width", (sw + 5).toFixed(2));

        /* comet: a short dash on the (possibly bent) wire, now and then */
        const c = r.comet;
        if (now - r.connectedAt > 900) {
          if (!c.running && now >= c.next) {
            c.running = true;
            c.t0 = now;
            c.landed = false;
            c.dur = (1150 / speedRef.current) * (hv === id ? 0.55 : 1);
          }
          if (c.running) {
            const L = r.L;
            const len = Math.min(34, L * 0.3);
            const p = (now - c.t0) / c.dur;
            if (p >= 1 && !c.landed) {
              c.landed = true;
              land(id);
            }
            if (p >= 1 + len / L) {
              c.running = false;
              c.next = now + ((1600 + Math.random() * 3600) / speedRef.current) * (hv === id ? 0.4 : 1);
              e.core.setAttribute("opacity", "0");
              e.glow.setAttribute("opacity", "0");
              r.cometOn = false;
            } else {
              const da = `${len.toFixed(1)} ${(L * 2 + len).toFixed(1)}`;
              const dof = (len - p * L).toFixed(1);
              e.core.setAttribute("stroke-dasharray", da);
              e.core.setAttribute("stroke-dashoffset", dof);
              e.glow.setAttribute("stroke-dasharray", da);
              e.glow.setAttribute("stroke-dashoffset", dof);
              e.core.setAttribute("opacity", "1");
              e.glow.setAttribute("opacity", "0.85");
              r.cometOn = true;
            }
          }
        }
      }

      /* connect bursts, landing sparks and gray puffs */
      fctx.clearRect(0, 0, G.w, G.h);
      const list = fx.current;
      for (let k = list.length - 1; k >= 0; k--) {
        const f = list[k];
        f.age += dt;
        if (f.age < 0) continue;
        const u = f.age / f.life;
        if (u >= 1) { list.splice(k, 1); continue; }
        let x, y, a;
        if (f.kind === "stream") {
          const e = u * u * (3 - 2 * u);
          const pt = f.el.getPointAtLength(f.L * e);
          x = G.ox + (pt.x + f.jx * (1 - e)) * G.scale;
          y = G.oy + (pt.y + f.jy * (1 - e)) * G.scale;
          a = Math.sin(Math.PI * Math.min(1, u * 1.05));
        } else {
          const fr = Math.pow(0.03, dt);
          f.vx *= fr; f.vy *= fr;
          f.x += f.vx * dt; f.y += f.vy * dt;
          x = f.x; y = f.y;
          a = 1 - u;
        }
        fctx.globalAlpha = Math.max(0, a);
        fctx.fillStyle = f.color;
        fctx.beginPath();
        fctx.arc(x, y, f.r * Math.max(0.7, G.scale), 0, Math.PI * 2);
        fctx.fill();
      }
      fctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, still, geo, dims.w, dims.scale, particles]);

  /* ---------- pointer ---------- */
  const onMove = (e) => {
    const r = gfxRef.current?.getBoundingClientRect();
    if (r) ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onEnter = () => (hovGfx.current = true);
  const onLeave = () => {
    hovGfx.current = false;
    ptr.current = null;
    hoverRef.current = null;
    setHover(null);
  };
  const hoverOn = (id) => {
    hoverRef.current = id;
    setHover(id);
  };

  /* hub border: a rotating conic gradient of the connected brands' colours */
  const hubCols = [...conn].flatMap((id) => byId[id]?.colors || []);
  const palette = hubCols.length ? hubCols : ["#c9ced8", "#e6e8ee"];
  const conic = `conic-gradient(from 0deg, ${[...palette, palette[0]].join(", ")})`;

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-[32px] bg-surface text-center shadow-[0_1px_2px_rgb(0_0_0/.04),0_18px_40px_-26px_rgb(0_0_0/.35)] ring-1 ring-ink/8 ${className}`}
      initial={still ? false : { opacity: 0, y: 18, filter: "blur(12px)" }}
      animate={still || seen ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      onAnimationComplete={() => {
        // drop the filter once the blur is gone so text and logos stay crisp
        if (cardRef.current) cardRef.current.style.filter = "none";
      }}
    >
      <style>{`@keyframes bb-spin{to{transform:rotate(360deg)}}`}</style>

      <div
        ref={gfxRef}
        className="relative"
        style={{ height: gfxH }}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <canvas ref={bgRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-0" />

        <div
          className="absolute"
          style={{ left: geomRef.current.ox, top: PAD, width: GW, height: GH, transform: `scale(${dims.scale})`, transformOrigin: "0 0" }}
        >
          <svg className="pointer-events-none absolute left-0 top-0 z-[2]" width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`} aria-hidden>
            <defs>
              <filter id={`${uid}blur`} filterUnits="userSpaceOnUse" x="0" y="0" width={GW} height={GH}>
                <feGaussianBlur stdDeviation="3" />
              </filter>
              {tiles.map((t) => {
                const cs = t.brand.colors;
                return (
                  <linearGradient key={t.brand.id} id={`${uid}g${t.i}`} gradientUnits="userSpaceOnUse" x1={t.pts[0][0]} y1={t.pts[0][1]} x2={t.pts[3][0]} y2={t.pts[3][1]}>
                    {cs.map((c, k) => (
                      <stop key={k} offset={cs.length > 1 ? (k / (cs.length - 1)) * 0.72 : 0} stopColor={c} />
                    ))}
                    <stop offset="1" style={{ stopColor: "rgb(var(--ink))" }} />
                  </linearGradient>
                );
              })}
            </defs>
            {tiles.map((t) => {
              const id = t.brand.id;
              const on = conn.has(id);
              const dim = hover != null && hover !== id;
              const stroke = `url(#${uid}g${t.i})`;
              return (
                <g key={id} style={{ opacity: dim ? 0.3 : 1, transition: "opacity .25s" }}>
                  <path d={t.d} fill="none" className="stroke-ink" strokeWidth="1.4" strokeDasharray="3 5" strokeLinecap="round"
                    style={{ opacity: hover === id && !on ? 0.3 : 0, transition: "opacity .2s" }} />
                  <motion.path
                    ref={(el) => { els.current[id] = { ...els.current[id], wire: el }; }}
                    d={t.d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={still ? false : { pathLength: 0, opacity: 0 }}
                    animate={on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    transition={{ duration: on ? 0.6 : 0.35, ease: [0.4, 0, 0.2, 1] }}
                  />
                  <path ref={(el) => { els.current[id] = { ...els.current[id], glow: el }; }} d={t.d} fill="none" stroke={stroke}
                    strokeWidth="7" strokeLinecap="round" opacity="0" filter={`url(#${uid}blur)`} />
                  <path ref={(el) => { els.current[id] = { ...els.current[id], core: el }; }} d={t.d} fill="none" stroke={stroke}
                    strokeWidth="3" strokeLinecap="round" opacity="0" />
                </g>
              );
            })}
          </svg>

          {/* hub */}
          <div className="absolute z-10" style={{ left: HX - HUB / 2, top: HY - HUB / 2, width: HUB, height: HUB }}>
            <div ref={ringRef} aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] border-2 opacity-0" />
            <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_10px_30px_-10px_rgb(0_0_0/.35)]">
              <div
                aria-hidden
                className="absolute"
                style={{ inset: "-50%", background: conic, animation: "bb-spin 7s linear infinite", animationPlayState: live && !still ? "running" : "paused" }}
              />
              <div className="absolute inset-[2.5px] grid place-items-center rounded-[26px] bg-surface p-2">
                <div className="grid h-full w-full place-items-center overflow-hidden rounded-[18px] bg-mist">{center ?? <Mark />}</div>
              </div>
            </div>
          </div>

          {/* tiles */}
          {tiles.map((t) => {
            const b = t.brand;
            const on = conn.has(b.id);
            const h = hover === b.id;
            const dim = hover != null && !h;
            const Logo = b.icon;
            const white = on && b.whiteIcon !== false;
            return (
              <motion.button
                key={b.id}
                type="button"
                aria-pressed={on}
                aria-label={`${on ? "Disconnect" : "Connect"} ${b.name}`}
                title={b.name}
                onClick={() => setBrand(b.id, !connRef.current.has(b.id), true)}
                onPointerEnter={() => hoverOn(b.id)}
                onPointerLeave={() => hoverRef.current === b.id && hoverOn(null)}
                onFocus={() => hoverOn(b.id)}
                onBlur={() => hoverRef.current === b.id && hoverOn(null)}
                animate={{ y: h ? -3 : 0 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className={`absolute z-10 grid cursor-pointer place-items-center rounded-2xl shadow-[0_6px_16px_-8px_rgb(0_0_0/.4)] ring-1 ring-ink/10 dark:ring-white/15 ${on ? "" : "bg-surface"}`}
                style={{
                  left: t.x - TILE / 2,
                  top: t.y - TILE / 2,
                  width: TILE,
                  height: TILE,
                  background: on ? b.color : undefined,
                  opacity: dim ? 0.55 : 1,
                  transition: "background .35s, opacity .25s",
                }}
              >
                <span
                  className="grid place-items-center"
                  style={{
                    filter: white ? "brightness(0) invert(1)" : on ? "none" : "grayscale(1) opacity(.65)",
                    transform: h ? "rotate(-9deg) scale(1.12)" : "none",
                    transition: "transform .25s, filter .3s",
                  }}
                >
                  <Logo className="h-6 w-6" />
                </span>
              </motion.button>
            );
          })}
        </div>

        <canvas ref={fxRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[6]" />
      </div>

      <div className="px-6 pb-7 pt-1">
        <h3 className="text-xl font-extrabold sm:text-[22px]">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink/55">{description}</p>
      </div>
    </motion.div>
  );
}

export default BrandBridge;
