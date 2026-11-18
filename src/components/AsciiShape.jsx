import { useEffect, useRef } from "react";
import { useDark } from "../theme";

/* A flower-like shape built from blocks and 0/1 glyphs that ripples like water.
   Hover to speed it up; the cursor pushes ripples through it. */
export function AsciiShape({ className = "" }) {
  const wrap = useRef(null), cv = useRef(null);
  const dark = useDark(); // the effect below reads the colour from this ref, so a theme flip repaints without re-creating the canvas
  const darkRef = useRef(dark);
  darkRef.current = dark;
  useEffect(() => {
    const canvas = cv.current, ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = ["0", "1", "/", ".", ">", "_", "1", "0"];
    let fg = darkRef.current ? "#E4E5F5" : "#14151A";
    let W = 0, H = 0, cell = 8, raf = 0, visible = true, boost = 0, target = 0, px = -1, py = -1;
    const size = () => {
      const r = wrap.current.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(6, Math.round(Math.min(W, H) / 46));
    };
    const draw = (ms) => {
      const t = ms / 1000; boost += (target - boost) * 0.08;
      ctx.clearRect(0, 0, W, H);
      const cols = Math.floor(W / cell), rows = Math.floor(H / cell), cx = cols / 2, cy = rows / 2, R = Math.min(cols, rows) * 0.42;
      ctx.font = `${cell * 0.95}px ui-monospace, Menlo, monospace`; ctx.textBaseline = "top"; fg = darkRef.current ? "#E4E5F5" : "#14151A"; ctx.fillStyle = fg;
      const sp = 0.7 + boost * 1.4;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const dx = x - cx, dy = (y - cy), r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
        let rip = 0;
        if (px >= 0) { const d = Math.hypot(x * cell - px, y * cell - py); rip = Math.sin(d * 0.12 - t * 6) * Math.exp(-d / 70) * 2.2 * boost; }
        const edge = R * (0.52 + 0.38 * Math.abs(Math.cos(4 * th + t * sp)) + 0.07 * Math.sin(th * 9 - t * sp * 2)) + rip;
        const hole = R * 0.16;
        if (r < edge && r > hole) {
          const bar = Math.abs(Math.sin((y + t * sp * 3) * 0.55)) > 0.12;
          if (bar) ctx.fillRect(x * cell, y * cell, cell * 0.86, cell * 0.86);
        } else if (r >= edge && r < edge + 6) {
          const f = 1 - (r - edge) / 6; if (Math.sin(x * 12.9 + y * 78.2 + Math.floor(t * 2) * 3.1) > 0.15 - f * 0.9) {
            ctx.globalAlpha = 0.25 + f * 0.7; ctx.fillText(chars[(x * 7 + y * 13 + Math.floor(t * 3)) % chars.length], x * cell, y * cell); ctx.globalAlpha = 1;
          }
        }
      }
    };
    const loop = (ms) => { if (visible) draw(ms); raf = requestAnimationFrame(loop); };
    size(); const ro = new ResizeObserver(() => { size(); if (reduce) draw(2000); }); ro.observe(wrap.current);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(wrap.current);
    if (reduce) draw(2000); else raf = requestAnimationFrame(loop);
    const el = wrap.current;
    const enter = () => { target = 1; }, leave = () => { target = 0; px = -1; };
    const move = (e) => { const r = el.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
    el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); el.addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("pointermove", move); };
  }, []);
  return <div ref={wrap} className={className}><canvas ref={cv} role="img" aria-label="Animated shape made of blocks and binary digits" className="h-full w-full" /></div>;
}
