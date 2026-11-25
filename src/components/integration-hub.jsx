/* IntegrationHub (Motion Brew "Integration hub"): app tiles wired into one hub, with packets of dots flowing in along every wire.
   Hover a tile or its wire to light it up.
   <IntegrationHub apps={[{ id, name, href?, icon: node }]} label="Find me online" speed={3} trail={10} center={node?} />
   - the stage is drawn at a fixed size (W x H) and scaled to fit its container
   - one requestAnimationFrame loop moves every dot with getPointAtLength, and it pauses while off screen
   - reduced motion: no entrance, the packets stay still */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";

const W = 360;
const H = 340;
const CX = W / 2;
const CY = 164;
const RX = 132;
const RY = 122;
const TILE = 52;
const HUB = 84;

/* Tile positions on an ellipse (clockwise from the top) and one cubic wire per tile.
   Each wire is written hub -> tile, so drawing it with pathLength grows it outward from the hub.
   It leaves the tile heading for the hub and bends in to meet the hub's nearest side. */
function layout(n) {
  const half = HUB / 2;
  const items = Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    const x = CX + RX * Math.cos(a);
    const y = CY + RY * Math.sin(a);
    const horizontal = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a));
    const side = horizontal
      ? x > CX ? "right" : "left"
      : y > CY ? "bottom" : "top";
    return { i, x, y, horizontal, side };
  });

  // spread the wires that land on the same side along it
  const bySide = {};
  items.forEach((it) => (bySide[it.side] ||= []).push(it));
  Object.values(bySide).forEach((g) => {
    g.sort((p, q) => (p.horizontal ? p.y - q.y : p.x - q.x));
    const gap = Math.min(18, (HUB - 30) / Math.max(1, g.length - 1));
    g.forEach((it, r) => (it.lat = (r - (g.length - 1) / 2) * gap));
  });

  items.forEach((it) => {
    const { x, y, side, lat } = it;
    let ex, ey, c1, c2;
    if (it.horizontal) {
      const s = side === "right" ? 1 : -1;
      ex = CX + s * half;
      ey = CY + lat;
      const k = Math.abs(x - ex) * 0.5;
      c1 = [ex + s * k, ey];
      c2 = [x - s * k, y];
    } else {
      const s = side === "bottom" ? 1 : -1;
      ex = CX + lat;
      ey = CY + s * half;
      const k = Math.abs(y - ey) * 0.5;
      c1 = [ex, ey + s * k];
      c2 = [x, y - s * k];
    }
    const f = (v) => v.toFixed(1);
    it.ex = ex;
    it.ey = ey;
    it.d = `M${f(ex)} ${f(ey)} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(x)} ${f(y)}`;
  });
  return items;
}

/* the little orbit mark used when no `center` is given */
function OrbitMark() {
  const still = !!useReducedMotion();
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <circle cx="20" cy="20" r="13" fill="none" className="stroke-ink" strokeOpacity=".18" strokeWidth="1" />
      <circle cx="20" cy="20" r="4" className="fill-ink" />
      <motion.g
        animate={still ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="20" cy="20" r="16" fill="none" />
        <circle cx="20" cy="7" r="2.6" className="fill-ink" />
        <circle cx="31.3" cy="26.5" r="1.8" className="fill-ink" fillOpacity=".5" />
      </motion.g>
    </svg>
  );
}

export function IntegrationHub({
  apps = [],
  label = "Integrations",
  speed = 1,
  trail = 1,
  center,
  className = "",
}) {
  const still = !!useReducedMotion();
  const n = apps.length;
  const geo = useMemo(() => layout(n), [n]);
  const packet = Math.max(1, Math.round(trail));

  const boxRef = useRef(null);
  const [scale, setScale] = useState(1);
  const seen = useInView(boxRef, { once: true, amount: 0.25 });
  const live = useInView(boxRef, { amount: 0.05 }); // pauses the loop off screen
  const show = still || seen;
  const [hover, setHover] = useState(null);

  const hoverRef = useRef(null);
  hoverRef.current = hover;
  const measure = useRef([]);
  const dots = useRef([]);
  const pulse = useRef(null);
  const t0 = useRef(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  /* fit the fixed-size stage into whatever width we get */
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / W) || 1);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* when each wire has reached its tile (seconds after the entrance starts) */
  const wireDelay = (i) => 0.45 + i * 0.1;
  const tileDelay = (i) => wireDelay(i) + 0.45;

  /* motion of the dots: one rAF loop for every wire */
  useEffect(() => {
    if (!show) return;
    if (t0.current == null) t0.current = performance.now();
    const lens = geo.map((_, i) => measure.current[i]?.getTotalLength() || 1);
    const prog = geo.map((_, i) => (i * 0.37) % 1);
    const rate = geo.map((_, i) => 0.17 + ((i * 37) % 7) * 0.022); // each wire has its own pace

    const place = (i, k, t, r, o) => {
      const el = dots.current[i]?.[k];
      const p = measure.current[i];
      if (!el || !p) return;
      const pt = p.getPointAtLength(lens[i] * (1 - t)); // t = 0 at the tile, 1 at the hub
      el.setAttribute("cx", pt.x.toFixed(2));
      el.setAttribute("cy", pt.y.toFixed(2));
      el.setAttribute("r", r.toFixed(2));
      el.setAttribute("opacity", o.toFixed(3));
    };

    if (still) {
      geo.forEach((_, i) => {
        for (let k = 0; k < packet; k++) {
          const f = 1 - k / packet;
          place(i, k, Math.max(0, 0.55 - k * 0.018), 2.4 * (1 - 0.7 * (k / packet)), f * f);
        }
      });
      return;
    }
    if (!live) return;

    let raf;
    let last = performance.now();
    let lastPulse = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const h = hoverRef.current;
      let landed = false;
      for (let i = 0; i < geo.length; i++) {
        const ready = now - t0.current > (tileDelay(i) + 0.15) * 1000;
        const on = h === i;
        const dim = h != null && !on ? 0.3 : 1;
        if (ready) {
          prog[i] += dt * rate[i] * speedRef.current * (on ? 2.2 : 1);
          if (prog[i] >= 1) {
            prog[i] -= 1;
            landed = true;
          }
        }
        const gap = 0.017 * (on ? 1.4 : 1);
        for (let k = 0; k < packet; k++) {
          const tk = prog[i] - k * gap;
          if (!ready || tk < 0) {
            place(i, k, 0, 0, 0);
            continue;
          }
          const f = 1 - k / packet;
          place(i, k, tk, (on ? 3.4 : 2.4) * (1 - 0.7 * (k / packet)), Math.pow(f, 1.4) * dim);
        }
      }
      if (landed && pulse.current && now - lastPulse > 380) {
        lastPulse = now;
        animate(pulse.current, { scale: [1, 1.16], opacity: [0.4, 0] }, { duration: 0.7, ease: "easeOut" });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, live, still, geo, packet]);

  const open = (a) => {
    if (a.href) window.open(a.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={boxRef}
      role="group"
      aria-label={label}
      className={`relative w-full overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_1px_2px_rgb(0_0_0/.04),0_18px_40px_-26px_rgb(0_0_0/.35)] ring-1 ring-ink/8 ${className}`}
      style={{ height: H * scale }}
    >
      <div
        className="absolute top-0"
        style={{
          left: "50%",
          width: W,
          height: H,
          marginLeft: -W / 2,
          transform: `scale(${scale})`,
          transformOrigin: "50% 0",
        }}
      >
        {/* soft glow + two faint rounded rings */}
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: CX - 170,
            top: CY - 170,
            width: 340,
            height: 340,
            background: "radial-gradient(closest-side, rgb(var(--ink) / .09), rgb(var(--ink) / .03) 55%, transparent)",
          }}
        />
        {[132, 186].map((s, k) => (
          <motion.div
            key={s}
            aria-hidden
            className="absolute border border-ink/[.07]"
            style={{ left: CX - s / 2, top: CY - s / 2, width: s, height: s, borderRadius: s * 0.3 }}
            initial={still ? false : { opacity: 0, scale: 0.6 }}
            animate={show ? { opacity: 1, scale: 1 } : undefined}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.12 + k * 0.1 }}
          />
        ))}

        {/* wires: a drawn line, a solid ink line for hover, a measuring path for the dots and a wide invisible hit stroke */}
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="pointer-events-none absolute inset-0" aria-hidden>
          {geo.map((g, i) => {
            const on = hover === i;
            const dim = hover != null && !on;
            return (
              <g key={apps[i].id ?? i} style={{ opacity: dim ? 0.35 : 1, transition: "opacity .25s" }}>
                <motion.path
                  d={g.d}
                  fill="none"
                  className="stroke-ink"
                  strokeOpacity=".22"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  initial={still ? false : { pathLength: 0, opacity: 0 }}
                  animate={show ? { pathLength: 1, opacity: 1 } : undefined}
                  transition={{ duration: 0.55, delay: wireDelay(i), ease: [0.4, 0, 0.2, 1] }}
                />
                <path
                  d={g.d}
                  fill="none"
                  className="stroke-ink"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ opacity: on ? 1 : 0, transition: "opacity .2s" }}
                />
                <path ref={(el) => {
                    measure.current[i] = el;
                  }}
                  d={g.d}
                  fill="none"
                  stroke="none"
                />
                <path
                  d={g.d}
                  fill="none"
                  stroke="rgba(0,0,0,0)"
                  strokeWidth="16"
                  style={{ pointerEvents: "stroke", cursor: apps[i].href ? "pointer" : "default" }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => open(apps[i])}
                />
                {Array.from({ length: packet }, (_, k) => (
                  <circle
                    key={k}
                    ref={(el) => {
                      (dots.current[i] = dots.current[i] || [])[k] = el;
                    }}
                    r="0"
                    opacity="0"
                    className="fill-ink"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* hub */}
        <motion.div
          className="absolute z-10"
          style={{ left: CX - HUB / 2, top: CY - HUB / 2, width: HUB, height: HUB }}
          initial={still ? false : { opacity: 0, scale: 0.55, filter: "blur(14px)" }}
          animate={show ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
          transition={{ type: "spring", stiffness: 170, damping: 15, delay: 0.05 }}
        >
          <div
            ref={pulse}
            aria-hidden
            className="absolute inset-0 rounded-[1.7rem] bg-ink opacity-0"
          />
          {!still && show && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-[1.7rem] ring-2 ring-ink/25"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
            />
          )}
          <div className="relative grid h-full w-full place-items-center rounded-[1.7rem] bg-surface p-[10px] shadow-[0_10px_30px_-10px_rgb(0_0_0/.3)] ring-1 ring-ink/10">
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-[1.25rem] bg-mist">
              {center ?? <OrbitMark />}
            </div>
          </div>
        </motion.div>

        {/* name of the hovered app, in an ink pill under the hub */}
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2"
          style={{ left: CX, top: CY + HUB / 2 + 10 }}
        >
          <AnimatePresence mode="wait">
            {hover != null && apps[hover] && (
              <motion.span
                key={hover}
                className="block whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-mist shadow-lg"
                initial={{ opacity: 0, y: -4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -2, scale: 0.96 }}
                transition={{ duration: 0.16 }}
              >
                {apps[hover].name}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* tiles */}
        {geo.map((g, i) => {
          const a = apps[i];
          const on = hover === i;
          const dim = hover != null && !on;
          const Tag = a.href ? "a" : "span";
          const linkProps = a.href
            ? { href: a.href, target: "_blank", rel: "noreferrer" }
            : { tabIndex: 0 };
          return (
            <motion.div
              key={a.id ?? i}
              className="absolute z-10"
              style={{ left: g.x - TILE / 2, top: g.y - TILE / 2, width: TILE, height: TILE }}
              initial={still ? false : { x: g.ex - g.x, y: g.ey - g.y, scale: 0.35, opacity: 0 }}
              animate={show ? { x: 0, y: 0, scale: 1, opacity: 1 } : undefined}
              transition={{ type: "spring", stiffness: 210, damping: 17, delay: tileDelay(i) }}
            >
              <Tag
                {...linkProps}
                aria-label={a.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="grid h-full w-full place-items-center rounded-2xl bg-surface text-ink shadow-[0_6px_16px_-8px_rgb(0_0_0/.35)] ring-1 ring-ink/10 transition duration-200 dark:bg-white/[.07]"
                style={{
                  opacity: dim ? 0.45 : 1,
                  transform: on ? "translateY(-3px) scale(1.07)" : "none",
                  boxShadow: on ? "0 14px 24px -10px rgb(0 0 0 / .4)" : undefined,
                }}
              >
                {a.icon}
              </Tag>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default IntegrationHub;
