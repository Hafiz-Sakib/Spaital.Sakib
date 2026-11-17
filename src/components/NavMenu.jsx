import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PAGES, href } from "../router";

const ITEMS = [{ id: "home", label: "Photos" }, ...PAGES];

/* Desktop: a pill bar with a sliding highlight. */
export function NavBar({ route }) {
  return (
      <LayoutGroup id="nav">
        <nav aria-label="Pages" className="glass hidden items-center gap-0.5 rounded-full p-1 lg:flex">
          {ITEMS.map((x) => (
            <a key={x.id} href={href(x.id)} aria-current={route === x.id ? "page" : undefined} className="relative rounded-full px-4 py-2 text-sm font-semibold">
              {route === x.id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative ${route === x.id ? "text-mist" : "text-ink/70 hover:text-ink"}`}>{x.label}</span>
            </a>
          ))}
        </nav>
      </LayoutGroup>
  );
}

/* Mobile: a menu button that drops a small panel. */
export function NavButton({ route }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);
  useEffect(() => { const k = (e) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  return (
      <div className="relative lg:hidden">
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="glass grid h-10 w-10 place-items-center rounded-full">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <motion.path initial={false} animate={{ d: open ? "M6 6L18 18" : "M4 7H20" }} />
            <motion.path initial={false} animate={{ opacity: open ? 0 : 1 }} d="M4 12H20" />
            <motion.path initial={false} animate={{ d: open ? "M18 6L6 18" : "M4 17H20" }} />
          </svg>
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.nav aria-label="Pages" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.16 }} className="glass absolute right-0 top-12 z-50 w-44 rounded-2xl p-1.5">
                {ITEMS.map((x) => (
                  <a key={x.id} href={href(x.id)} aria-current={route === x.id ? "page" : undefined} className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${route === x.id ? "bg-ink text-mist" : "text-ink/75 hover:bg-ink/10"}`}>{x.label}</a>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>
  );
}
