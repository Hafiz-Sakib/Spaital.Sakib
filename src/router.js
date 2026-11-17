import { useSyncExternalStore } from "react";

/* Tiny hash router: "#/skills" -> "skills". No extra dependency and no server rewrites needed on Vercel.
   The landing page (the photo tunnel) is "home" and stays at "/" (or "#/" / "#top"). */
export const PAGES = [
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "coding", label: "Coding" },
  { id: "contact", label: "Contact" },
];

const read = () => {
  const id = (typeof location === "undefined" ? "" : location.hash).replace(/^#\/?/, "").split("?")[0];
  return PAGES.some((p) => p.id === id) ? id : "home";
};
const subscribe = (cb) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };

/** const route = useRoute(); -> "home" | "skills" | "journey" | "coding" | "contact" */
export const useRoute = () => useSyncExternalStore(subscribe, read, () => "home");
export const href = (id) => (id === "home" ? "#/" : `#/${id}`);
