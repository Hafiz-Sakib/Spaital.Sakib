import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { PAGES, go, href, navigate } from "../router";
import { ICONS } from "./TabBar";
import MobileDock from "./MobileDock";

/* One entry per page. `icon` is a key of ICONS in TabBar.jsx (animated lucide icons from motion-brew). */
const ICON = { home: "photos", about: "about", projects: "projects", skills: "skills", journey: "journey", coding: "coding", contact: "contact" };
const ITEMS = [{ id: "home", label: "Photos" }, ...PAGES].map((x) => ({ ...x, icon: ICON[x.id] }));

/* Desktop: a vertical glass dock on the right edge, vertically centred. Icons only; the label slides out on hover / focus. */
export function SideNav({ route }) {
  return (
    <LayoutGroup id="side-nav">
      <nav aria-label="Pages" className="glass fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-full p-1.5 lg:flex">
        {ITEMS.map((x) => {
          const on = route === x.id;
          const Ico = ICONS[x.icon];
          return (
            <a key={x.id} href={href(x.id)} onClick={go(x.id)} aria-label={x.label} aria-current={on ? "page" : undefined} className="group relative grid h-11 w-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ink/40">
              {on && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative grid transition-colors ${on ? "text-mist" : "text-ink/60 group-hover:text-ink"}`}><Ico active={on} strokeWidth={2.1} /></span>
              <span aria-hidden className="pointer-events-none absolute right-full mr-3 translate-x-1 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-mist opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">{x.label}</span>
            </a>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}

/* Phones and tablets: a docked bar (same as the Number System project) with the 4 main pages + "More".
   The other pages open from a sheet above the bar. If the open page is one of those, the fifth tab shows that page instead. */
const PRIMARY = ["home", "about", "projects", "skills"];
const SUB = { journey: "Education & experience", coding: "Competitive programming", contact: "Say hello" };

function MoreSheet({ open, onClose, route }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [open, onClose]);
  const rest = ITEMS.filter((x) => !PRIMARY.includes(x.id));
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="more" className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <motion.div role="dialog" aria-label="More pages" initial={reduce ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-2 bottom-[max(6.25rem,calc(env(safe-area-inset-bottom)+5.75rem))] mx-auto max-w-[380px] rounded-3xl bg-surface p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,.45)] ring-1 ring-ink/[.08]">
            <p className="px-2 pb-2 pt-1 text-sm font-bold text-ink/55">More pages</p>
            <ul className="grid gap-1">
              {rest.map((x, i) => {
                const Icon = ICONS[x.icon];
                const on = x.id === route;
                return (
                  <motion.li key={x.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.05 + i * 0.05 }}>
                    <button type="button" aria-current={on ? "page" : undefined} onClick={() => { onClose(); navigate(x.id); }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition active:scale-[.98] ${on ? "bg-ink text-mist" : "hover:bg-ink/[.06]"}`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? "bg-mist/15" : "bg-ink/[.06]"}`}><Icon className="size-[22px]" strokeWidth={2.1} active={on} /></span>
                      <span className="min-w-0"><span className="block font-bold leading-tight">{x.label}</span>{SUB[x.id] && <span className={`block text-[13px] ${on ? "text-mist/65" : "text-ink/50"}`}>{SUB[x.id]}</span>}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BottomNav({ route }) {
  const [more, setMore] = useState(false);
  useEffect(() => { setMore(false); }, [route]);
  const inPrimary = PRIMARY.includes(route);
  const cur = ITEMS.find((x) => x.id === route);
  const tabs = [
    ...PRIMARY.map((id) => ITEMS.find((x) => x.id === id)),
    inPrimary || !cur ? { id: "more", label: "More", icon: "more" } : { id: "more", label: cur.label, icon: cur.icon },
  ];
  return (
    <>
      <MoreSheet open={more} onClose={() => setMore(false)} route={route} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <MobileDock tabs={tabs} value={inPrimary ? route : "more"} onChange={(id) => (id === "more" ? setMore(true) : navigate(id))} onReselect={(id) => id === "more" && setMore(true)} className="pointer-events-auto" />
      </div>
    </>
  );
}
