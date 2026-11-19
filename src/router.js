import { useSyncExternalStore } from "react";

/* Tiny path router: "/skills" -> "skills". No extra dependency (History API).
   The landing page (the photo tunnel) is "home" and stays at "/".
   Production host must serve index.html for these paths: see vercel.json / public/_redirects in this update.
   Old "#/skills" links still work: they are rewritten to "/skills" on load. */
export const PAGES = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "coding", label: "Coding" },
  { id: "contact", label: "Contact" },
];

const BASE = (import.meta.env?.BASE_URL || "/").replace(/\/$/, ""); // "" unless the app is deployed under a sub-path

/** "/journey" (or the BASE-prefixed version) -> "journey" */
const idFromPath = (path) => {
  const rest = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  return rest.replace(/^\/+|\/+$/g, "").split("/")[0];
};

if (typeof window !== "undefined" && /^#\/[\w-]+/.test(location.hash)) {
  const id = location.hash.replace(/^#\/?/, "").split("?")[0];
  if (PAGES.some((p) => p.id === id))
    history.replaceState(null, "", `${BASE}/${id}`);
}

const read = () => {
  const id = idFromPath(
    typeof location === "undefined" ? "" : location.pathname,
  );
  if (PAGES.some((p) => p.id === id)) return id;
  // "/" (and /index.html) is the landing page; any other unknown path is the 404 page
  return id === "" || id === "index.html" ? "home" : "notfound";
};
const subscribe = (cb) => {
  window.addEventListener("popstate", cb);
  window.addEventListener("app:navigate", cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("app:navigate", cb);
  };
};

/** const route = useRoute(); -> "home" | "about" | "projects" | "skills" | "journey" | "coding" | "contact" | "notfound" */
export const useRoute = () =>
  useSyncExternalStore(subscribe, read, () => "home");
export const href = (id) => (id === "home" ? `${BASE}/` : `${BASE}/${id}`);

/** Go to a page without reloading. */
export function navigate(id) {
  const to = href(id);
  if (location.pathname !== to) history.pushState(null, "", to);
  window.dispatchEvent(new Event("app:navigate"));
  window.scrollTo(0, 0);
}

/** onClick for <a href={href(id)}>: normal clicks navigate in-app, ctrl/cmd/middle-click still open a new tab. */
export const go = (id) => (e) => {
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  )
    return;
  e.preventDefault();
  navigate(id);
};
