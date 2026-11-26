import { useEffect, useRef } from "react";
import { useDark } from "../theme";

/* Night-only starry sky behind the photo tunnel (Photos / home page).
   Plain <canvas>, no extra npm package. Day mode: the canvas is hidden (`hidden dark:block`) and the loop is stopped.
   - 3 depth layers drifting slowly, each star twinkles on its own phase
   - a few bigger stars get a soft glow + tiny cross sparkle
   - an occasional shooting star
   - respects prefers-reduced-motion (draws one still frame), pauses when the tab is hidden */

const TINTS = [
  [255, 255, 255],
  [210, 225, 255],
  [190, 200, 255],
  [255, 236, 214],
  [225, 205, 255],
];

export default function Starfield() {
  const ref = useRef(null);
  const dark = useDark();

  useEffect(() => {
    const cv = ref.current;
    if (!dark || !cv) return;
    const ctx = cv.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, stars = [], shoot = null, nextShoot = 0, raf = 0, last = 0;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(320, Math.max(90, Math.round((w * h) / 5200)));
      stars = Array.from({ length: n }, () => {
        const z = Math.random(); // 0 far -> 1 near
        const big = Math.random() < 0.07;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: big ? 1.5 + Math.random() * 1.1 : 0.35 + z * 0.95,
          base: 0.35 + Math.random() * 0.65,
          tw: 0.6 + Math.random() * 2.2, // twinkle speed
          ph: Math.random() * Math.PI * 2,
          c: TINTS[(Math.random() * TINTS.length) | 0],
          big,
        };
      });
    };

    const draw = (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!still) {
          s.x -= (4 + s.z * 14) * dt; // slow sideways drift, near stars move more
          s.y += (1 + s.z * 3) * dt;
          if (s.x < -4) s.x = w + 4;
          if (s.y > h + 4) s.y = -4;
        }
        const k = still ? 0.85 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
        const a = s.base * k;
        const [r, g, b] = s.c;
        if (s.big) {
          const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          gr.addColorStop(0, `rgba(${r},${g},${b},${a * 0.55})`);
          gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gr;
          ctx.fillRect(s.x - s.r * 6, s.y - s.r * 6, s.r * 12, s.r * 12);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.5})`;
          ctx.lineWidth = 0.6;
          const L = s.r * 4.2 * (0.7 + 0.3 * k);
          ctx.beginPath();
          ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y);
          ctx.moveTo(s.x, s.y - L); ctx.lineTo(s.x, s.y + L);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (still) return;
      if (!shoot && t > nextShoot) {
        const ang = Math.PI * (0.12 + Math.random() * 0.12); // shallow downward diagonal
        const sp = 620 + Math.random() * 380;
        shoot = {
          x: w * (0.35 + Math.random() * 0.65),
          y: Math.random() * h * 0.45,
          vx: -Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: 0.9 + Math.random() * 0.5,
        };
        nextShoot = t + 5 + Math.random() * 7;
      }
      if (shoot) {
        shoot.life += dt;
        shoot.x += shoot.vx * dt;
        shoot.y += shoot.vy * dt;
        const p = shoot.life / shoot.max;
        const fade = Math.sin(Math.min(1, p) * Math.PI);
        const tail = 120;
        const mag = Math.hypot(shoot.vx, shoot.vy);
        const tx = shoot.x - (shoot.vx / mag) * tail;
        const ty = shoot.y - (shoot.vy / mag) * tail;
        const g2 = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
        g2.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
        g2.addColorStop(1, "rgba(160,180,255,0)");
        ctx.strokeStyle = g2;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (p >= 1 || shoot.x < -tail || shoot.y > h + tail) shoot = null;
      }
    };

    const loop = (ms) => {
      const t = ms / 1000;
      const dt = Math.min(0.05, last ? t - last : 0.016);
      last = t;
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || raf) return;
      last = 0;
      nextShoot = performance.now() / 1000 + 2.5;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());

    build();
    draw(0, 0);
    start();
    const ro = new ResizeObserver(() => {
      build();
      if (still) draw(0, 0);
    });
    ro.observe(cv);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dark]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden h-full w-full dark:block"
    />
  );
}
