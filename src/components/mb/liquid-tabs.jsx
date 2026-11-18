/* LiquidTabs (motion-brew style): icon tabs; the active tab is a bump of the panel itself rising out of the tab row.
   tabs: [{ id, label, icon: Component }]; children = the panel content. */
import { motion } from "framer-motion";
import { useId } from "react";

export function LiquidTabs({ tabs, value, onChange, children, className = "" }) {
  const uid = useId();
  const at = tabs.findIndex((t) => t.id === value);
  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 px-1">
        {tabs.map((t) => {
          const on = t.id === value;
          const Ico = t.icon;
          return (
            <button key={t.id} role="tab" aria-selected={on} onClick={() => onChange(t.id)} className={`relative flex min-w-0 flex-1 items-center justify-center gap-2 px-2 pb-3 pt-3.5 text-sm font-semibold transition-colors sm:flex-none sm:px-7 ${on ? "text-ink" : "text-ink/50 hover:text-ink/80"}`}>
              {on && <motion.span layoutId={`${uid}-bump`} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-0 -bottom-1 top-0 rounded-t-[1.4rem] bg-surface shadow-[0_-8px_24px_-14px_rgba(20,21,26,.25)]" />}
              {!on && <span aria-hidden className="absolute inset-x-1 inset-y-1.5 rounded-2xl bg-ink/[.04] opacity-0 transition-opacity hover:opacity-100" />}
              <span className="relative flex items-center gap-2">{Ico && <Ico aria-hidden className="h-[18px] w-[18px] shrink-0" />}<span className="truncate">{t.label}</span></span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className={`relative z-[1] -mt-1 bg-surface p-5 shadow-[0_12px_40px_-12px_rgba(20,21,26,.12)] sm:p-8 ${at === 0 ? "rounded-b-[2rem] rounded-tr-[2rem]" : at === tabs.length - 1 ? "rounded-b-[2rem] rounded-tl-[2rem]" : "rounded-[2rem]"}`}>{children}</div>
    </div>
  );
}
