/* CalendarAgenda (motion-brew style): a day planner. Pick a day and the pill slides across the week; swipe an event right to
   mark it done (confetti rises out of the card) or left to delete it. Buttons do the same for keyboard / mouse users.
   days:  [{ id, label: "Mon", date: 10, long: "Monday, 10 November", events: [{ id, time, title, meta, tone, done }] }]
   onToggle(event, done)  onDelete(event)  onAdd(dayId, { time, title }) */
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LuCheck, LuPlus, LuTrash2 } from "react-icons/lu";

const TONE = { pink: "#EC4899", amber: "#F59E0B", violet: "#7C6CF6", sky: "#38BDF8", green: "#10B981", ink: "#14151A" };
const BITS = Array.from({ length: 12 }, (_, i) => ({ x: Math.cos(i * 2.4) * (30 + (i % 4) * 14), y: -(34 + (i % 5) * 14), r: i * 47, c: ["#F472B6", "#FBBF24", "#7C6CF6", "#34D399", "#38BDF8"][i % 5] }));

function Confetti() {
  return (
    <span aria-hidden className="pointer-events-none absolute right-10 top-1/2 z-20">
      {BITS.map((b, i) => (
        <motion.span key={i} className="absolute h-1.5 w-2.5 rounded-[2px]" style={{ background: b.c }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: b.x, y: b.y, opacity: 0, rotate: b.r }} transition={{ duration: 0.9, ease: "easeOut" }} />
      ))}
    </span>
  );
}

function Row({ ev, onToggle, onDelete }) {
  const still = !!useReducedMotion();
  const [burst, setBurst] = useState(0);
  const done = (v) => { if (v && !still) setBurst((n) => n + 1); onToggle?.(ev, v); };
  return (
    <motion.li layout={!still} initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="relative mb-2 overflow-hidden rounded-2xl last:mb-0">
      <div aria-hidden className="absolute inset-0 flex items-center justify-between px-5 text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300"><LuCheck className="h-4 w-4" />{ev.done ? "Undo" : "Done"}</span>
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-300">Delete<LuTrash2 className="h-4 w-4" /></span>
      </div>
      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.55} whileDrag={{ cursor: "grabbing" }}
        onDragEnd={(_, i) => { if (i.offset.x > 90) done(!ev.done); else if (i.offset.x < -90) onDelete?.(ev); }}
        className="relative flex cursor-grab items-center gap-3 bg-surface px-4 py-3.5 shadow-sm ring-1 ring-ink/[.05]">
        <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-ink/70">{ev.time}</span>
        <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TONE[ev.tone] || TONE.violet }} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-semibold transition-colors ${ev.done ? "text-ink/40 line-through" : ""}`}>{ev.title}</span>
          {ev.meta && <span className="block truncate text-xs text-ink/50">{ev.meta}</span>}
        </span>
        <button onClick={() => done(!ev.done)} aria-label={ev.done ? `Mark ${ev.title} not done` : `Mark ${ev.title} done`} aria-pressed={!!ev.done} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${ev.done ? "bg-emerald-500 text-white" : "bg-ink/[.07] text-ink/50 hover:bg-ink/10"}`}><LuCheck aria-hidden className="h-4 w-4" /></button>
        <button onClick={() => onDelete?.(ev)} aria-label={`Delete ${ev.title}`} className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[.07] text-ink/50 transition hover:bg-rose-100 hover:text-rose-600 sm:grid"><LuTrash2 aria-hidden className="h-4 w-4" /></button>
      </motion.div>
      {burst > 0 && <Confetti key={burst} />}
    </motion.li>
  );
}

export function CalendarAgenda({ days, defaultDay = 0, title = "Planner", onToggle, onDelete, onAdd }) {
  const uid = useId();
  const [sel, setSel] = useState(defaultDay);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ time: "20:00", title: "" });
  const day = days[sel];
  const left = day.events.filter((e) => !e.done).length;
  const submit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onAdd?.(day.id, { time: draft.time || "20:00", title: draft.title.trim() });
    setDraft({ time: draft.time, title: "" }); setAdding(false);
  };
  return (
    <div data-glow className="mx-auto w-full max-w-xl rounded-[2rem] bg-surface p-3 shadow-[0_20px_60px_-24px_rgba(20,21,26,.3)] ring-1 ring-ink/[.05] sm:p-4">
      <div className="flex items-start justify-between gap-3 px-2 pt-2">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold">{title}</h3>
          <p className="truncate text-sm text-ink/55">{day.long} · {left} left</p>
        </div>
        <button onClick={() => setAdding((v) => !v)} aria-expanded={adding} aria-label="Add task" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/[.07] transition hover:bg-ink/10"><motion.span animate={{ rotate: adding ? 45 : 0 }}><LuPlus aria-hidden className="h-5 w-5" /></motion.span></button>
      </div>
      <AnimatePresence initial={false}>
        {adding && (
          <motion.form onSubmit={submit} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-4">
              <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} aria-label="Time" className="h-11 min-w-0 flex-1 rounded-xl sm:w-[7.5rem] sm:flex-none sm:shrink-0 bg-mist px-3 text-sm outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-ink/30" />
              <input autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What to practise?" aria-label="Task" className="order-first h-11 basis-full rounded-xl sm:order-none sm:min-w-[9rem] sm:flex-1 sm:basis-40 bg-mist px-3 text-sm outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-ink/30" />
              <button className="h-11 shrink-0 rounded-xl bg-ink px-6 text-sm font-semibold text-mist transition hover:bg-ink/85">Add</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <div role="tablist" aria-label="Day" className="mt-4 grid grid-cols-7 gap-1 rounded-[1.4rem] bg-ink/[.05] p-1">
        {days.map((d, i) => {
          const on = i === sel;
          const pending = d.events.some((e) => !e.done);
          return (
            <button key={d.id} role="tab" aria-selected={on} onClick={() => setSel(i)} className="relative flex flex-col items-center rounded-2xl py-2 text-xs">
              {on && <motion.span layoutId={`${uid}-day`} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-2xl bg-ink" />}
              <span className={`relative ${on ? "text-mist/70" : "text-ink/50"}`}>{d.label}</span>
              <span className={`relative text-lg font-bold leading-tight ${on ? "text-mist" : ""}`}>{d.date}</span>
              <span aria-hidden className={`relative mt-0.5 h-1 w-1 rounded-full ${pending ? (on ? "bg-mist" : "bg-ink/40") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <ul className="mt-3 rounded-[1.4rem] bg-ink/[.04] p-2" aria-label={`${day.long} tasks`}>
        <AnimatePresence initial={false} mode="popLayout">
          {day.events.map((ev) => <Row key={ev.id} ev={ev} onToggle={(e, v) => onToggle?.(e, v)} onDelete={(e) => onDelete?.(e)} />)}
        </AnimatePresence>
        {day.events.length === 0 && <li className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/45">Nothing planned. Tap + to add a task.</li>}
      </ul>
      <p className="px-2 pb-1 pt-3 text-center text-xs text-ink/40">Swipe right to finish, left to delete</p>
    </div>
  );
}
