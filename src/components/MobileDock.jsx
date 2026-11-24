/* Mobile bottom bar, same behaviour as the Number System project:
   a docked, labelled bar where one ink indicator glides between tabs, icons play on tap and a ripple spreads.
   Reselecting the active tab fires onReselect (used by the "More" tab to open its sheet). */
import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { ICONS } from "./TabBar";

const cn = (...a) => a.filter(Boolean).join(" ");
const GLIDE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 500, damping: 34 };
const SLIDE = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 };

/** tabs: [{ id, label, icon: key of ICONS }] (up to 5 fit comfortably) */
export default function MobileDock({ tabs = [], value, onChange, onReselect, className }) {
  const still = !!useReducedMotion();
  const uid = React.useId();
  const root = React.useRef(null);
  const seen = useInView(root, { once: true, amount: 0.4 });
  const shown = seen || still;
  const list = tabs.slice(0, 6);
  const [playing, setPlaying] = React.useState(null);
  const [taps, setTaps] = React.useState({});
  const timer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = (id) => {
    setTaps((t) => ({ ...t, [id]: (t[id] ?? 0) + 1 }));
    setPlaying(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPlaying(null), 900);
    if (id === value) { onReselect?.(id); return; }
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
    const on = t.id === value;
    const Icon = ICONS[t.icon] || ICONS.home;
    const ripple = taps[t.id] ?? 0;
    return (
      <motion.button
        key={t.id}
        type="button"
        data-tab=""
        aria-label={t.label}
        aria-current={on ? "page" : undefined}
        onClick={() => choose(t.id)}
        initial={still ? false : { opacity: 0, y: 14 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        whileTap={still ? undefined : { scale: 0.92 }}
        transition={{ ...SPRING, opacity: { duration: 0.4, delay: still ? 0 : 0.12 + i * 0.05 }, y: { ...SPRING, delay: still ? 0 : 0.12 + i * 0.05 } }}
        className="group relative flex h-[58px] min-w-0 flex-1 cursor-pointer select-none flex-col items-center justify-center gap-1 rounded-2xl outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ink/30"
      >
        <span className="relative grid h-[30px] w-full max-w-[3.5rem] place-items-center">
          {on && <motion.span layoutId={`${uid}-indicator`} transition={still ? { duration: 0 } : SLIDE} className="absolute inset-0 rounded-full bg-ink shadow-[0_6px_16px_-6px_rgb(var(--ink)/0.55)]" />}
          {!on && <span aria-hidden className="absolute inset-0 rounded-full bg-ink/[0.06] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />}
          <AnimatePresence>
            {!still && ripple > 0 && (
              <motion.span key={ripple} aria-hidden initial={{ scale: 0.4, opacity: 0.4 }} animate={{ scale: 2, opacity: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: GLIDE }} className="absolute size-9 rounded-full bg-ink/20" />
            )}
          </AnimatePresence>
          <span className={cn("relative grid transition-colors duration-300", on ? "text-mist" : "text-ink/45 group-hover:text-ink/80")}>
            <motion.span key={ripple} className="grid" initial={ripple > 0 && !still ? { scale: 0.7, rotate: -14 } : false} animate={{ scale: on ? 1.05 : 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 12 }}>
              <Icon className="size-[22px]" strokeWidth={on ? 2.25 : 2} active={playing === t.id} />
            </motion.span>
          </span>
        </span>
        <motion.span
          animate={still ? undefined : { y: on ? 0 : 1, opacity: on ? 1 : 0.62 }}
          transition={{ duration: 0.3, ease: GLIDE }}
          className={cn("relative w-full truncate px-0.5 text-center text-[11px] font-semibold leading-none transition-colors duration-300 min-[380px]:text-[11.5px]", on ? "text-ink" : "text-ink/55 group-hover:text-ink/80")}
        >
          {t.label}
        </motion.span>
      </motion.button>
    );
  };

  return (
    <motion.nav
      ref={root}
      aria-label="Main"
      onKeyDown={onKeyDown}
      initial={still ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, ease: GLIDE }}
      className={cn("relative w-[420px] max-w-full rounded-[28px] bg-surface/90 p-1.5 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.28)] ring-1 ring-ink/[.08] backdrop-blur-xl", className)}
    >
      <LayoutGroup id={uid}>
        <div className="flex items-stretch justify-between gap-0.5">{list.map(tab)}</div>
      </LayoutGroup>
    </motion.nav>
  );
}
