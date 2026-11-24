import { useLayoutEffect } from "react";

/* Scroll reveal for the whole page: cards and headings rise into place the first time they enter the screen.
   - Anything already animated by framer-motion (Reveal, TiltCard...) is left alone.
   - Only the outermost element of a group is animated, items that arrive together are staggered a little.
   - The helper class is removed when the animation ends, so it never fights hover / transform effects.
   - Skipped for reduced-motion visitors. Styles: `.rv` / `.rv-in` in index.css. */
const SEL = ".card, h2, h3, [data-reveal]";

const animated = (el, main) => {
  for (let n = el; n && n !== main; n = n.parentElement) {
    const st = n.getAttribute("style") || "";
    if (/opacity|transform|filter/.test(st)) return true;
  }
  return false;
};

export function useAutoReveal(key) {
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const main = document.querySelector("main");
    if (!main) return undefined;

    const done = (el) => { el.classList.remove("rv", "rv-in"); el.style.removeProperty("--rv-d"); };
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        const el = e.target;
        io.unobserve(el);
        el.style.setProperty("--rv-d", `${Math.min(i, 5) * 70}ms`);
        requestAnimationFrame(() => el.classList.add("rv-in"));
        const off = () => { el.removeEventListener("transitionend", end); clearTimeout(t); done(el); };
        const end = (ev) => { if (ev.target === el && ev.propertyName === "transform") off(); };
        const t = setTimeout(off, 1800);
        el.addEventListener("transitionend", end);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

    const seen = new WeakSet();
    const scan = (root) => {
      const list = root.matches?.(SEL) ? [root, ...root.querySelectorAll(SEL)] : [...root.querySelectorAll(SEL)];
      list.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.parentElement?.closest(SEL) || el.closest("[role=dialog]") || animated(el, main)) return;
        el.classList.add("rv");
        io.observe(el);
      });
    };
    scan(main);

    /* the observer runs before paint, so parts that load later slide in without a flash */
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n))));
    mo.observe(main, { childList: true, subtree: true });
    const stop = setTimeout(() => mo.disconnect(), 2000);

    return () => { clearTimeout(stop); mo.disconnect(); io.disconnect(); main.querySelectorAll(".rv").forEach(done); };
  }, [key]);
}
