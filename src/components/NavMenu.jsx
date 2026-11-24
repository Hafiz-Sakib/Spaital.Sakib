import { motion } from "framer-motion";
import { PAGES, go, href, navigate } from "../router";
import { ICONS } from "./TabBar";
import MobileDock from "./MobileDock";

/* One entry per page. `icon` is a key of ICONS in TabBar.jsx (animated lucide icons from motion-brew). */
const ICON = { home: "photos", about: "about", journey: "journey", projects: "projects", coding: "coding", contact: "contact" };
const ITEMS = [{ id: "home", label: "Photos" }, ...PAGES].map((x) => ({ ...x, icon: ICON[x.id] }));

/* Desktop (lg+): the menu sits in the header as a pill, same as the Number System project.
   The active page gets an ink pill that glides between items (shared layoutId); inactive items show only their icon below 1400px. */
export function TopNav({ route }) {
  return (
    <nav aria-label="Pages" className="hidden rounded-full bg-surface/80 p-1 ring-1 ring-ink/[.08] lg:block">
      <ul className="flex gap-0.5">
        {ITEMS.map((x) => {
          const on = route === x.id;
          const Ico = ICONS[x.icon];
          return (
            <li key={x.id}>
              <a href={href(x.id)} onClick={go(x.id)} title={x.label} aria-label={x.label} aria-current={on ? "page" : undefined} className="relative block whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold transition-transform duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px min-[1400px]:px-3 min-[1400px]:text-[15px]">
                {on && <motion.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-ink" />}
                <span className={`relative flex items-center gap-1.5 ${on ? "text-mist" : "text-ink/60 hover:text-ink"}`}><Ico className="size-[18px]" strokeWidth={2.1} active={on} /><span className={on ? "" : "hidden min-[1400px]:inline"}>{x.label}</span></span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* Phones and tablets: a docked bar (same as the Number System project, with the mist strip under it)
   with every page in one row: Photos, About, Journey, Projects, Coding, Contact. */
export function BottomNav({ route }) {
  const tabs = ITEMS.map(({ id, label, icon }) => ({ id, label, icon }));
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[380px]:px-3 lg:hidden">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[max(0.75rem,env(safe-area-inset-bottom))] bg-mist" />
      <MobileDock tabs={tabs} value={route} onChange={(id) => navigate(id)} className="pointer-events-auto" />
    </div>
  );
}
