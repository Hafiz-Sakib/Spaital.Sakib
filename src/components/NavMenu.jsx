import { LayoutGroup, motion } from "framer-motion";
import { PAGES, href } from "../router";
import { ICONS, TabBar } from "./TabBar";

/* One entry per page. `icon` is a key of ICONS in TabBar.jsx (animated lucide icons from motion-brew). */
const ICON = { home: "photos", projects: "projects", skills: "skills", journey: "journey", coding: "coding", contact: "contact" };
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
            <a key={x.id} href={href(x.id)} aria-label={x.label} aria-current={on ? "page" : undefined} className="group relative grid h-11 w-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ink/40">
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

/* Phones and tablets: the motion-brew TabBar (pill variant) docked at the bottom, above the home indicator. */
export function BottomNav({ route }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <TabBar tabs={ITEMS} variant="pill" value={route} onChange={(id) => { window.location.hash = href(id); }} className="pointer-events-auto" />
    </div>
  );
}
