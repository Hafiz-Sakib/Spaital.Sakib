// Duo flip: a WebGL "liquid glass" page-turn gallery.
//
// This is a local copy of the `DuoFlip` component from the `motion-brew` package (MIT, motion-brew.com),
// with ONE change: pictures are drawn in full ("contain") instead of being cropped to fill the card
// ("cover"). Where the card is larger than a picture, the gap is filled with a soft blurred copy of the
// same picture. Props: images = { src, alt, label? }[], aspect (card width / height), radius, flare, glass, ...
import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

const PAD_Y = 0.32;
const PAD_X = 28;
const VERTEX = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform vec4 uCard;      // left, top, width, height (canvas px, top down)
uniform float uRadius;
uniform sampler2D uA;    // outgoing picture
uniform sampler2D uB;    // incoming picture
uniform vec2 uAspA;
uniform vec2 uAspB;
uniform float uFold;     // fold line, card px from the left
uniform float uDir;      // 1: the fold travels left to right, the incoming page on its left
uniform float uAmpA;     // lift of the outgoing page
uniform float uAmpB;     // lift of the incoming page
uniform float uFlare;    // full lift, to normalise
uniform float uGlass;
uniform float uFall;     // how far from the fold the lift reaches, px
uniform float uDpr;
uniform float uSideA;    // frost on the outgoing picture, px
uniform float uSideB;    // frost on the incoming picture, px
uniform float uTime;
uniform float uNear;     // share of the frost beside the fold
uniform float uFar;      // share of the frost at the far edge
uniform float uNoise;    // grain in the frost
uniform float uThick;    // how thick the card looks

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// Draws the WHOLE picture inside the card (contain). Where the card is bigger than the picture,
// the gap is filled with a soft, dimmed, blurred copy of the same picture instead of cropping it.
vec3 samp(sampler2D t, vec2 uv, vec2 asp) {
  if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) return texture2D(t, uv).rgb;
  vec2 b = (uv - 0.5) / asp;
  vec2 u = clamp(b / asp.yx + 0.5, 0.0, 1.0);
  vec3 s = texture2D(t, u).rgb * 0.5;
  s += texture2D(t, clamp(u + vec2(0.06, 0.06), 0.0, 1.0)).rgb * 0.25;
  s += texture2D(t, clamp(u - vec2(0.06, 0.06), 0.0, 1.0)).rgb * 0.25;
  return mix(s * 0.72, vec3(0.5), 0.12);
}

// One page at this pixel: its colour and coverage, swollen and blurred by its lift.
vec4 page(sampler2D t, vec2 asp, vec2 local, float amp, float d, float side, float frost) {
  float W = uCard.z;
  float H = uCard.w;
  float k = exp(-d / uFall);
  float s = 1.0 + amp * k;
  vec2 src = vec2(local.x, (local.y - H * 0.5) / s + H * 0.5);
  float sd = sdRound(src - vec2(W, H) * 0.5, vec2(W, H) * 0.5, uRadius);
  // Round the two corners where a lifted page meets the fold: the page as a
  // box running from the fold away from it, cornered by its lift.
  float nl = uFlare > 0.0 ? amp / uFlare : 0.0;
  float rf = 12.0 * uDpr * nl;
  if (rf > 0.5) {
    vec2 c = vec2(uFold + side * W, H * 0.5);
    sd = max(sd, sdRound(src - c, vec2(W, H * 0.5), rf));
  }
  float alpha = clamp(0.5 - sd, 0.0, 1.0);
  vec2 uv = (src / vec2(W, H) - 0.5) * asp + 0.5;
  float n = uFlare > 0.0 ? amp / uFlare : 0.0;
  float lift = uGlass * n * k * 22.0 * uDpr;
  // The frost is a gradient: strongest beside the fold, fading across the card.
  frost *= mix(uNear, uFar, smoothstep(0.0, 1.0, d / W));
  float br = max(lift, frost);
  vec3 col;
  if (br < 0.5) {
    col = samp(t, uv, asp);
  } else {
    // A soft round blur: the centre and two rings of taps, red and blue
    // pulled apart toward and away from the fold for the glass fringe. The
    // rings turn by a random angle per pixel and frame, so a wide frost reads
    // as fine moving grain instead of ghost copies.
    vec2 px = asp / vec2(W, H);
    vec2 ca = vec2(side * lift * 0.55, 0.0) * px;
    float spin = hash(gl_FragCoord.xy + uTime) * 6.2832 * uNoise;
    float jit = 1.0 + (hash(gl_FragCoord.yx * 1.7 + uTime) - 0.5) * 0.5 * uNoise;
    vec3 acc = vec3(samp(t, uv + ca, asp).r, samp(t, uv, asp).g, samp(t, uv - ca, asp).b);
    float wsum = 1.0;
    for (int i = 0; i < 12; i++) {
      float a = float(i) * 0.5236 + (i < 6 ? 0.0 : 0.2618) + spin;
      float rr = (i < 6 ? 0.5 : 1.0) * jit;
      vec2 o = vec2(cos(a), sin(a)) * br * rr * px;
      float w = i < 6 ? 1.0 : 0.7;
      acc.r += samp(t, uv + o + ca, asp).r * w;
      acc.g += samp(t, uv + o, asp).g * w;
      acc.b += samp(t, uv + o - ca, asp).b * w;
      wsum += w;
    }
    col = acc / wsum;
  }
  // Grain over the frost, more as it deepens.
  float g = clamp(frost / (30.0 * uDpr), 0.0, 1.0);
  col += (hash(gl_FragCoord.xy * 0.73 + uTime * 1.3) - 0.5) * 0.06 * g * uNoise;
  // Thickness all round: a slightly dark outer rim and a soft highlight just inside it.
  float inner = -sd;
  col *= 1.0 - 0.16 * uThick * (1.0 - smoothstep(0.0, 1.8 * uDpr, inner));
  float bevel = (inner - 3.0 * uDpr) / (1.2 * uDpr);
  col += 0.06 * uThick * exp(-bevel * bevel);
  // Where the page lifts, its edge shows: a darker band with a bright line inside it.
  float th = 11.0 * uDpr * uThick * n;
  if (th > 0.5) {
    float e = 1.0 - smoothstep(0.0, th, d);
    col = mix(col, col * 0.58, e * 0.85);
    float hl = (d - th * 0.78) / (th * 0.16);
    col += 0.16 * n * uThick * exp(-hl * hl);
  }
  return vec4(col, alpha);
}

void main() {
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 local = fc - uCard.xy;
  float W = uCard.z;
  float H = uCard.w;
  float s = uDir * (local.x - uFold);
  bool outgoing = s > 0.0;
  float d = abs(s);
  float amp = outgoing ? uAmpA : uAmpB;
  float other = outgoing ? uAmpB : uAmpA;
  vec4 c = outgoing
    ? page(uA, uAspA, local, amp, d, uDir, uSideA)
    : page(uB, uAspB, local, amp, d, -uDir, uSideB);
  float n = uFlare > 0.0 ? amp / uFlare : 0.0;
  float no = uFlare > 0.0 ? other / uFlare : 0.0;
  float k = exp(-d / uFall);
  vec3 col = c.rgb;
  // The lifted page: a darker rim right at the fold, and a cool to warm glass sheen.
  col *= 1.0 - 0.3 * n * exp(-d / (uFall * 0.1));
  float y = clamp(local.y / H, -0.4, 1.4);
  vec3 sheen = mix(vec3(0.42, 0.58, 1.0), vec3(1.0, 0.5, 0.86), smoothstep(0.0, 1.0, y));
  col = mix(col, col + sheen * 0.35, 0.32 * n * k * uGlass);
  // The page beside a lifted one lies in its shadow.
  col *= 1.0 - 0.3 * no * exp(-d / (uFall * 0.55));
  // A soft shadow under the resting card.
  float sdb = sdRound(local - vec2(W, H) * 0.5 - vec2(0.0, 16.0 * uDpr), vec2(W, H) * 0.5, uRadius);
  float shadow = 0.2 * (1.0 - smoothstep(-10.0 * uDpr, 34.0 * uDpr, sdb));
  float a = c.a + shadow * (1.0 - c.a);
  vec3 outc = col * c.a;
  gl_FragColor = vec4(outc, a);
}
`;

const cn = (...a) => a.filter(Boolean).join(" ");
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
);

export const DuoFlip = React.forwardRef(function DuoFlip(
  { images = [], aspect = 1.5, radius = 24, flare = 0.34, glass = 1, blur = 24, blurNear = 0.65, blurFar = 0.12, noise = 0.3, thickness = 1, duration = 1.3, autoplay = true, interval = 3.4, onChange, className },
  ref,
) {
  const still = !!useReducedMotion();
  const root = React.useRef(null);
  React.useImperativeHandle(ref, () => root.current);
  const stage = React.useRef(null);
  const canvas = React.useRef(null);
  const inView = useInView(root, { amount: 0.25 });
  const seen = useInView(root, { once: true, amount: 0.3 });
  const n = images.length;
  const [index, setIndex] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [hold, setHold] = React.useState(false);
  const turn = React.useRef(null);
  const current = React.useRef(0);

  const params = React.useRef({});
  params.current = {
    flare: Math.min(0.5, Math.max(0, flare)), glass, blur: Math.max(0, blur), blurNear: clamp01(blurNear), blurFar: clamp01(blurFar),
    noise: clamp01(noise), thickness: Math.min(2, Math.max(0, thickness)), radius, duration,
  };
  const api = React.useRef(null);
  const raf = React.useRef(0);

  const finish = React.useCallback((to) => {
    current.current = to; turn.current = null; setIndex(to); onChange?.(to); api.current?.draw();
  }, [onChange]);

  const play = React.useCallback((target) => {
    const tr = turn.current;
    if (!tr) return;
    cancelAnimationFrame(raf.current);
    const total = Math.max(0.2, params.current.duration) * 1e3;
    const start = performance.now();
    const t0 = tr.t;
    const span = Math.abs(target - t0) * total;
    const step = (now) => {
      const k = span <= 0 ? 1 : Math.min(1, (now - start) / span);
      tr.t = t0 + (target - t0) * k;
      api.current?.draw();
      if (k < 1) raf.current = requestAnimationFrame(step);
      else if (target === 1) finish(tr.to);
      else { turn.current = null; api.current?.draw(); }
    };
    raf.current = requestAnimationFrame(step);
  }, [finish]);

  const go = React.useCallback((to, dir) => {
    if (turn.current || n < 2) return;
    const from = current.current;
    if (to === from) return;
    if (still || failed || !ready) return finish(to);
    turn.current = { from, to, dir, t: 0 };
    play(1);
  }, [n, still, failed, ready, finish, play]);

  const next = React.useCallback(() => go((current.current + 1) % n, 1), [go, n]);
  const prev = React.useCallback(() => go((current.current - 1 + n) % n, -1), [go, n]);

  // WebGL setup: one texture per picture, one fullscreen quad, the fragment shader does the rest.
  React.useEffect(() => {
    const el = canvas.current;
    const box = stage.current;
    if (!el || !box) return;
    const gl = el.getContext("webgl", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) { setFailed(true); return; }
    const compile = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(
      ["uRes", "uCard", "uRadius", "uA", "uB", "uAspA", "uAspB", "uFold", "uDir", "uAmpA", "uAmpB", "uFlare", "uGlass", "uFall", "uDpr", "uSideA", "uSideB", "uTime", "uNear", "uFar", "uNoise", "uThick"]
        .map((k) => [k, gl.getUniformLocation(prog, k)]),
    );
    gl.uniform1i(U.uA, 0);
    gl.uniform1i(U.uB, 1);
    // Textures are created lazily: only the picture on screen, the one being turned to and a few neighbours are
    // kept on the GPU, so a library of 400+ photos costs the same as 10 (all photos are still in the flip order).
    const KEEP = 9;
    const textures = images.map(() => null);
    const sizes = images.map(() => ({ w: 1, h: 1 }));
    const loading = new Set();
    let alive = true;
    let lastNear = -1;
    const mod = (a, m) => ((a % m) + m) % m;
    const placeholder = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([228, 228, 225, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const ensure = (i) => {
      if (textures[i]) return textures[i];
      const tex = (textures[i] = placeholder());
      if (loading.has(i)) return tex; // the pending load fills whatever texture slot i holds when it finishes
      loading.add(i);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        loading.delete(i);
        const target = textures[i];
        if (!alive || !target) return; // evicted while loading
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); sizes[i] = { w: img.naturalWidth, h: img.naturalHeight }; } catch { /* keep the placeholder */ }
        if (i === current.current) setReady(true);
        draw();
      };
      img.onerror = () => { loading.delete(i); if (i === current.current) setReady(true); };
      img.src = images[i].src;
      return tex;
    };
    const evict = (centre) => {
      const held = textures.map((t, i) => (t ? i : -1)).filter((i) => i >= 0);
      if (held.length <= KEEP) return;
      const dist = (i) => { const d = Math.abs(i - centre); return Math.min(d, images.length - d); };
      held.sort((a, b) => dist(b) - dist(a));
      for (const i of held.slice(0, held.length - KEEP)) {
        if (turn.current && (i === turn.current.from || i === turn.current.to)) continue;
        gl.deleteTexture(textures[i]);
        textures[i] = null;
        sizes[i] = { w: 1, h: 1 };
      }
    };
    const near = (c) => {
      if (c === lastNear) return;
      lastNear = c;
      ensure(c);
      for (const d of [1, -1, 2, -2, 3, -3]) ensure(mod(c + d, images.length));
      evict(c);
    };

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = box.clientWidth;
      const ch = cw / aspect;
      const W = Math.max(1, Math.round((cw + PAD_X * 2) * dpr));
      const H = Math.max(1, Math.round(ch * (1 + PAD_Y * 2) * dpr));
      if (el.width !== W || el.height !== H) { el.width = W; el.height = H; }
      const card = { x: PAD_X * dpr, y: ch * PAD_Y * dpr, w: cw * dpr, h: ch * dpr };
      const p = params.current;
      const tr = turn.current;
      const from = tr ? tr.from : current.current;
      const to = tr ? tr.to : current.current;
      const t = tr ? tr.t : 0;
      const e = ease(t);
      const dir = tr ? tr.dir : 1;
      const along = -0.18 + 1.36 * e;
      const fold = (dir === 1 ? along : 1 - along) * card.w;
      const handover = smooth(0.42, 0.6, t);
      const ampA = tr ? p.flare * smooth(0, 0.14, t) * (1 - handover) : 0;
      const ampB = tr ? p.flare * handover * (1 - smooth(0.84, 1, t)) : 0;
      const sideA = tr ? p.blur * dpr * smooth(0.04, 0.5, t) : 0;
      const sideB = tr ? p.blur * dpr * smooth(0, 0.08, t) * (1 - smooth(0.18, 0.7, t)) : 0;
      // CONTAIN: the whole picture fits inside the card (the original used the inverse, which crops).
      const asp = (i) => {
        const ca = card.w / card.h;
        const ia = sizes[i].w / sizes[i].h;
        return ia > ca ? [1, ia / ca] : [ca / ia, 1];
      };
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, W, H);
      gl.uniform4f(U.uCard, card.x, card.y, card.w, card.h);
      gl.uniform1f(U.uRadius, p.radius * dpr);
      gl.uniform1f(U.uFold, tr ? fold : -1e5 * dir);
      gl.uniform1f(U.uDir, dir);
      gl.uniform1f(U.uAmpA, ampA);
      gl.uniform1f(U.uAmpB, ampB);
      gl.uniform1f(U.uFlare, Math.max(1e-4, p.flare));
      gl.uniform1f(U.uGlass, p.glass);
      gl.uniform1f(U.uFall, card.w * 0.11);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uSideA, sideA);
      gl.uniform1f(U.uSideB, sideB);
      gl.uniform1f(U.uNear, p.blurNear);
      gl.uniform1f(U.uFar, p.blurFar);
      gl.uniform1f(U.uNoise, p.noise);
      gl.uniform1f(U.uThick, p.thickness);
      gl.uniform1f(U.uTime, (performance.now() / 1e3) % 100);
      ensure(from); ensure(to); near(current.current);
      const [ax, ay] = asp(from);
      const [bx, by] = asp(to);
      gl.uniform2f(U.uAspA, ax, ay);
      gl.uniform2f(U.uAspB, bx, by);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[from]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[to]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    api.current = { draw };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(box);
    return () => {
      alive = false;
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      api.current = null;
      textures.forEach((t) => t && gl.deleteTexture(t));
      gl.deleteProgram(prog);
    };
  }, [images, aspect]);

  React.useEffect(() => { api.current?.draw(); }, [flare, glass, blur, blurNear, blurFar, noise, thickness, radius]);

  // Autoplay (paused on hover / focus / off screen)
  React.useEffect(() => {
    if (!autoplay || still || hold || !inView || n < 2) return;
    const id = window.setInterval(() => { if (!document.hidden) next(); }, Math.max(1, interval) * 1e3 + Math.max(0.2, duration) * 1e3);
    return () => window.clearInterval(id);
  }, [autoplay, still, hold, inView, n, interval, duration, next]);

  // Click = next, drag sideways = move the fold by hand
  const drag = React.useRef(null);
  const onDown = (e) => {
    if (e.button !== 0 || turn.current || n < 2) return;
    drag.current = { x: e.clientX, started: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.started) {
      if (Math.abs(dx) < 6 || still || failed || !ready) return;
      g.started = true;
      const dir = dx > 0 ? 1 : -1;
      const from = current.current;
      turn.current = { from, to: (from + dir + n) % n, dir, t: 0 };
    }
    const tr = turn.current;
    if (!tr) return;
    const w = stage.current?.clientWidth ?? 1;
    tr.t = Math.min(1, Math.max(0, (dx * tr.dir) / (w * 0.9)));
    api.current?.draw();
  };
  const onUp = (e) => {
    const g = drag.current;
    drag.current = null;
    if (!g) return;
    if (!g.started) { if (Math.abs(e.clientX - g.x) < 6) next(); return; }
    const tr = turn.current;
    if (!tr) return;
    play(tr.t > 0.35 ? 1 : 0);
  };
  const onCancel = () => {
    const g = drag.current;
    drag.current = null;
    if (g?.started && turn.current) play(0);
  };

  const label = images[index]?.label;
  return (
    <motion.div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Pictures"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}
      initial={still ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={seen || still ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative w-[600px] max-w-full select-none rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-8", className)}
    >
      <div
        ref={stage}
        className="relative w-full cursor-pointer touch-pan-y"
        style={{ aspectRatio: String(aspect) }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        {/* Shown until WebGL is ready (or when WebGL is unavailable): the full picture, not cropped */}
        <AnimatePresence initial={false}>
          {(!ready || failed) && (
            <motion.img
              key={index}
              src={images[index]?.src}
              alt=""
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 size-full bg-black/5 object-contain shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)]"
              style={{ borderRadius: radius }}
            />
          )}
        </AnimatePresence>
        <canvas
          ref={canvas}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: -PAD_X, width: `calc(100% + ${PAD_X * 2}px)`, top: `${-PAD_Y * 100}%`, height: `${(1 + PAD_Y * 2) * 100}%`, opacity: ready && !failed ? 1 : 0 }}
        />
        <span role="img" aria-label={images[index]?.alt} className="sr-only" />
      </div>

      <div className="flex items-center justify-between gap-3 px-1" style={{ marginTop: `calc(${(params.current.flare * 50) / aspect}% + 12px)` }}>
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-400">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <span className="relative min-w-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={index}
                initial={still ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={still ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block truncate text-sm font-medium text-[#242423] dark:text-zinc-100"
              >
                {label ?? images[index]?.alt}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {[{ on: prev, aria: "Previous picture", dir: "left" }, { on: next, aria: "Next picture", dir: "right" }].map(({ on, aria, dir }) => (
            <motion.button
              key={aria}
              type="button"
              aria-label={aria}
              onClick={on}
              whileHover={still ? undefined : { scale: 1.06 }}
              whileTap={still ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="grid size-9 cursor-pointer place-items-center rounded-full bg-[#242423]/[0.06] text-[#242423] outline-none transition-colors hover:bg-[#242423]/[0.1] focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-white/[0.08] dark:text-zinc-100"
            >
              <Chevron dir={dir} />
            </motion.button>
          ))}
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">{`${images[index]?.alt ?? ""}, ${index + 1} of ${n}`}</span>
    </motion.div>
  );
});
