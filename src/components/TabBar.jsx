/**
 * TabBar, from https://motion-brew.com/components/tab-bar
 *
 * Ported to plain JSX for this Vite + Tailwind project (used as the mobile bottom nav and, via ICONS, in the desktop side dock):
 *  - framer-motion (already installed) instead of motion/react
 *  - no clsx / tailwind-merge (small cn() helper below)
 *  - only the animated icons this site uses (lucide paths, MIT): image, layout-grid, code, cpu, graduation-cap, mail
 *  - up to 6 tabs; inactive icons shrink a little on very narrow phones so the bar always fits
 *
 * Variants: "pill" (default) | "labels" | "action". A tap bounces the tab, plays its icon and sends a ripple.
 */
import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useAnimation, useInView, useReducedMotion } from "framer-motion";

const cn = (...a) => a.filter(Boolean).join(" ");

/* ---------- animated icons (play while `active`) ---------- */
function useIcon(active) {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  React.useEffect(() => {
    if (reduced) return;
    controls.start(active ? "animate" : "normal");
  }, [active, reduced, controls]);
  return controls;
}

const Shell = ({ className, children, strokeWidth = 2, motionProps }) => {
  const Svg = motionProps ? motion.svg : "svg";
  return (
    <span className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}>
      <Svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...motionProps}>
        {children}
      </Svg>
    </span>
  );
};

/* Photos: picture frame, the sun bobs */
function ImageIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <motion.circle animate={c} cx="9" cy="9" r="2" transition={{ duration: 0.5, ease: "easeInOut" }}
        variants={{ normal: { y: 0 }, animate: { y: [0, -2, 0] } }} />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Shell>
  );
}

/* Projects: four tiles pop one after another */
function GridIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  const tile = (x, y, d) => (
    <motion.rect animate={c} width="7" height="7" x={x} y={y} rx="1" style={{ transformBox: "fill-box", transformOrigin: "center" }}
      transition={{ duration: 0.5, delay: d, ease: "easeInOut" }} variants={{ normal: { scale: 1 }, animate: { scale: [1, 0.7, 1] } }} />
  );
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      {tile(3, 3, 0)}{tile(14, 3, 0.08)}{tile(14, 14, 0.16)}{tile(3, 14, 0.24)}
    </Shell>
  );
}

function HomeIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.path animate={c} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" transition={{ duration: 0.6, opacity: { duration: 0.2 } }}
        variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1] } }} />
    </Shell>
  );
}

/* Coding: code brackets slide apart and snap back */
function CodeIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <motion.path animate={c} d="m18 16 4-4-4-4" transition={{ duration: 0.5, ease: "easeInOut" }}
        variants={{ normal: { x: 0 }, animate: { x: [0, 3, 0] } }} />
      <motion.path animate={c} d="m6 8-4 4 4 4" transition={{ duration: 0.5, ease: "easeInOut" }}
        variants={{ normal: { x: 0 }, animate: { x: [0, -3, 0] } }} />
      <path d="m14.5 4-5 16" />
    </Shell>
  );
}

/* Skills: microchip, the core pulses */
function CpuIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <motion.rect animate={c} width="6" height="6" x="9" y="9" rx="1" style={{ transformBox: "fill-box", transformOrigin: "center" }}
        transition={{ duration: 0.6, ease: "easeInOut" }} variants={{ normal: { scale: 1 }, animate: { scale: [1, 1.35, 1] } }} />
      <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" />
      <path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
    </Shell>
  );
}

/* Journey (education + experience): graduation cap hops */
function CapIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}
      motionProps={{ animate: c, transition: { duration: 0.5, ease: "easeInOut" }, variants: { normal: { y: 0, rotate: 0 }, animate: { y: [0, -3, 0], rotate: [0, -6, 0] } } }}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </Shell>
  );
}

/* Contests: trophy gives a little cheer */
function TrophyIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}
      motionProps={{ animate: c, transition: { duration: 0.6, ease: "easeInOut" }, variants: { normal: { rotate: 0, y: 0 }, animate: { rotate: [0, -9, 9, -5, 0], y: [0, -2, 0, -1, 0] } } }}>
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </Shell>
  );
}

/* Contact: envelope, the flap redraws */
function MailIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <motion.path animate={c} d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" transition={{ duration: 0.6, opacity: { duration: 0.2 } }}
        variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1] } }} />
    </Shell>
  );
}

function PlusIcon({ className, strokeWidth }) {
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </Shell>
  );
}

/* tab.icon -> component */
export const ICONS = { home: HomeIcon, photos: ImageIcon, projects: GridIcon, coding: CodeIcon, skills: CpuIcon, journey: CapIcon, contests: TrophyIcon, contact: MailIcon };

const GLIDE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 500, damping: 34 };
const POP = { type: "spring", stiffness: 600, damping: 26 };

/**
 * tabs: [{ id, label, icon: "photos"|"projects"|"skills"|"journey"|"coding"|"contact", badge? }]
 * variant: "pill" | "labels" | "action"
 */
export const TabBar = React.forwardRef(function TabBar(
  { tabs = [], variant = "pill", value, defaultValue, onChange, actionLabel = "Create", onAction, className },
  ref,
) {
  const still = !!useReducedMotion();
  const uid = React.useId();
  const root = React.useRef(null);
  React.useImperativeHandle(ref, () => root.current);
  const seen = useInView(root, { once: true, amount: 0.4 });
  const shown = seen || still;
  const list = variant === "action" ? tabs.slice(0, 4) : tabs.slice(0, 6);
  const crowded = list.length > 5;
  const [own, setOwn] = React.useState(defaultValue ?? list[0]?.id ?? "");
  const current = value ?? own;
  const [playing, setPlaying] = React.useState(null);
  const [taps, setTaps] = React.useState({});
  const [spins, setSpins] = React.useState(0);
  const timer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = (id) => {
    setTaps((t) => ({ ...t, [id]: (t[id] ?? 0) + 1 }));
    setPlaying(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPlaying(null), 900);
    if (id === current) return;
    if (value === undefined) setOwn(id);
    onChange?.(id);
  };

  const onKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const buttons = Array.from(root.current?.querySelectorAll("[data-tab]") ?? []);
    const at = buttons.indexOf(document.activeElement);
    if (at < 0) return;
    e.preventDefault();
    buttons[(at + (e.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length]?.focus();
  };

  const tab = (t, i) => {
    const on = t.id === current;
    const Icon = ICONS[t.icon] || HomeIcon;
    const ripple = taps[t.id] ?? 0;
    const pill = variant === "pill";
    const iconOnly = variant === "action";
    return (
      <motion.button
        key={t.id}
        type="button"
        data-tab=""
        layout={pill && !still ? "position" : false}
        aria-label={t.badge ? `${t.label}, ${t.badge} new` : t.label}
        aria-current={on ? "page" : undefined}
        onClick={() => choose(t.id)}
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        whileTap={still ? undefined : { scale: 0.88 }}
        transition={{ ...SPRING, opacity: { duration: 0.4, delay: still ? 0 : 0.15 + i * 0.05 }, y: { ...SPRING, delay: still ? 0 : 0.15 + i * 0.05 } }}
        className={cn(
          "group relative flex cursor-pointer select-none items-center justify-center outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ink/30",
          pill ? "h-12 rounded-full" : iconOnly ? "h-12 flex-1 rounded-2xl" : "h-14 min-w-0 flex-1 flex-col gap-1 rounded-2xl",
          pill && (on ? "gap-1.5 pl-3 pr-4 min-[380px]:gap-2 min-[380px]:pl-4 min-[380px]:pr-5" : crowded ? "w-9 min-[360px]:w-10 min-[400px]:w-12" : "w-12"),
        )}
      >
        {pill && on && (
          <motion.span layoutId={`${uid}-pill`} transition={still ? { duration: 0 } : SPRING} className="absolute inset-0 rounded-full bg-ink/[0.07]" />
        )}
        {!on && (
          <span aria-hidden className={cn(
            "absolute rounded-full bg-ink/[0.05] opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            pill ? "inset-0" : iconOnly ? "left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2" : "left-1/2 top-1 size-10 -translate-x-1/2",
          )} />
        )}

        <span className="relative grid place-items-center">
          {variant !== "pill" && on && (
            <motion.span layoutId={`${uid}-disc`} transition={still ? { duration: 0 } : SPRING} className="absolute size-10 rounded-full bg-ink/[0.07]" />
          )}
          <AnimatePresence>
            {!still && ripple > 0 && (
              <motion.span key={ripple} aria-hidden initial={{ scale: 0.4, opacity: 0.45 }} animate={{ scale: 2.2, opacity: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: GLIDE }} className="absolute size-8 rounded-full bg-ink/15" />
            )}
          </AnimatePresence>
          <motion.span
            className={cn("relative grid transition-colors duration-300", on ? "text-ink" : "text-ink/40 group-hover:text-ink/70")}
            animate={{ y: variant === "labels" && on && !still ? -1 : 0 }}
            transition={SPRING}
          >
            <motion.span key={ripple} className="grid" initial={ripple > 0 && !still ? { scale: 0.7, rotate: -14 } : false} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 11 }}>
              <Icon className="size-[22px]" strokeWidth={on ? 2.25 : 2} active={playing === t.id} />
            </motion.span>
          </motion.span>
          <AnimatePresence>
            {!!t.badge && (
              <motion.span key="badge" initial={still ? { opacity: 0 } : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={still ? { opacity: 0 } : { scale: 0, opacity: 0 }} transition={POP}
                className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#d64545] px-1 text-[12px] font-semibold leading-none text-white ring-2 ring-surface">
                {t.badge}
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {pill ? (
          <AnimatePresence initial={false} mode="popLayout">
            {on && (
              <motion.span key="label" initial={still ? { opacity: 0 } : { opacity: 0, x: -6, filter: "blur(3px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.3, ease: GLIDE, delay: still ? 0 : 0.06 }}
                className="relative whitespace-nowrap text-[13px] font-medium text-ink min-[380px]:text-[14px]">
                {t.label}
              </motion.span>
            )}
          </AnimatePresence>
        ) : iconOnly ? null : (
          <span className={cn("relative max-w-full truncate px-0.5 text-[11px] leading-4 transition-colors duration-300 min-[380px]:text-[12px]", on ? "font-semibold text-ink" : "font-medium text-ink/45")}>
            {t.label}
          </span>
        )}

        {variant === "labels" && on && (
          <motion.span layoutId={`${uid}-dot`} transition={still ? { duration: 0 } : SPRING} className="absolute -bottom-1 size-1 rounded-full bg-ink" />
        )}
      </motion.button>
    );
  };

  const half = Math.ceil(list.length / 2);

  return (
    <motion.nav
      ref={root}
      aria-label="Main"
      onKeyDown={onKeyDown}
      initial={still ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, ease: GLIDE }}
      className={cn(
        "relative w-[380px] max-w-full rounded-full bg-surface p-2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-ink/[.07]",
        className,
      )}
    >
      <LayoutGroup id={uid}>
        {variant === "action" ? (
          <div className="relative flex items-center">
            {list.slice(0, half).map(tab)}
            <div className="relative grid w-16 shrink-0 place-items-center">
              <motion.button
                type="button"
                aria-label={actionLabel}
                onClick={() => { setSpins((s) => s + 1); onAction?.(); }}
                initial={still ? false : { scale: 0.5, opacity: 0 }}
                animate={shown ? { scale: 1, opacity: 1, rotate: still ? 0 : spins * 90 } : undefined}
                whileHover={still ? undefined : { y: -3 }}
                whileTap={still ? undefined : { scale: 0.88 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, opacity: { duration: 0.3, delay: still ? 0 : 0.3 } }}
                className="relative -mt-10 grid size-14 cursor-pointer place-items-center rounded-full bg-ink text-paper shadow-[0_10px_22px_-10px_rgba(36,36,35,0.6)] outline-none ring-4 ring-surface transition-colors hover:bg-ink/85 focus-visible:ring-ink/30"
              >
                <PlusIcon className="relative size-6" strokeWidth={2.5} />
              </motion.button>
            </div>
            {list.slice(half).map((t, i) => tab(t, i + half))}
          </div>
        ) : (
          <div className={cn("flex items-center", variant === "pill" ? "justify-between px-1" : "")}>{list.map(tab)}</div>
        )}
      </LayoutGroup>
    </motion.nav>
  );
});
