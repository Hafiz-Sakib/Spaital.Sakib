import { useEffect, useMemo, useRef, useState } from "react";

const STEP = 48; // photos rendered per batch; the next batch loads when you scroll near the end
const colCount = () => (window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2);

export function Grid({ items, onOpen }) {
  const [cols, setCols] = useState(colCount);
  const [shown, setShown] = useState(STEP);
  const sentinel = useRef(null);

  useEffect(() => {
    const f = () => setCols(colCount());
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || shown >= items.length) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShown((n) => Math.min(items.length, n + STEP)); }, { rootMargin: "1200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, items.length]);

  // Masonry: each photo goes to the currently shortest column (uses the known aspect ratio, so nothing jumps while loading).
  const columns = useMemo(() => {
    const cs = Array.from({ length: cols }, () => ({ h: 0, list: [] }));
    items.slice(0, shown).forEach((it, i) => {
      const c = cs.reduce((a, b) => (b.h < a.h ? b : a));
      c.list.push(i);
      c.h += it.w && it.h ? it.h / it.w : 1;
    });
    return cs;
  }, [items, shown, cols]);

  return (
    <>
      <div className="flex items-start gap-3">
        {columns.map((c, ci) => (
          <div key={ci} className="flex min-w-0 flex-1 flex-col gap-3">
            {c.list.map((i) => {
              const it = items[i];
              return (
                <button key={it.src} onClick={() => onOpen(i)} className="group block w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                  <img src={it.thumb || it.src} alt={it.alt} width={it.w} height={it.h} decoding="async"
                    loading={i < 8 ? "eager" : "lazy"} {...(i < 4 ? { fetchpriority: "high" } : {})}
                    className="h-auto w-full transition duration-500 group-hover:scale-105" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {shown < items.length && <div ref={sentinel} aria-hidden className="h-10" />}
    </>
  );
}
