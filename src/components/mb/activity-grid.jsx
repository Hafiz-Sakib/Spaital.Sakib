/* ActivityGrid (motion-brew style): half a year of daily activity as a heatmap that sweeps in column by column.
   Hover a day: its row and column light up and the readout shows the count. Live data from GitHub, with an honest "Sample data" tag if it can't be reached.
   <ActivityGrid title="Contributions" user="Hafiz-Sakib" palette="green" /> */
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDark } from "../../theme";
import { Odometer } from "./odometer";

const WEEKS = 26;
const palettes = {
  green: ["#E6ECE8", "#BDE8CB", "#6FCF97", "#2FA866", "#146B3A"],
  violet: ["#ECEAF6", "#D3CBFA", "#A99BF5", "#7C6CF6", "#4B3BC4"],
};
const night = {
  green: ["#232638", "#17463A", "#1F7A4F", "#2FB070", "#7CF0B0"],
  violet: ["#232638", "#312C5E", "#4F44A8", "#7C6CF6", "#C7BEFF"],
};
const fmt = (s) => new Date(s + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" });
const lvl = (n, max) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / Math.max(max, 4)) * 4)));

function sample() {
  const out = []; const end = new Date(); end.setHours(0, 0, 0, 0);
  for (let k = WEEKS * 7 - 1; k >= 0; k--) {
    const d = new Date(end); d.setDate(end.getDate() - k);
    const r = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
    out.push({ date: d.toISOString().slice(0, 10), count: r > 0.35 ? Math.floor(r * 8) : 0 });
  }
  return out;
}
async function load(user) {
  const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`);
  if (!r.ok) throw new Error("bad response");
  const j = await r.json();
  const days = (j.contributions || []).slice(-WEEKS * 7).map((c) => ({ date: c.date, count: c.count }));
  if (days.length < 30) throw new Error("no data");
  return days;
}
function stats(days) {
  const total = days.reduce((a, d) => a + d.count, 0);
  let best = [0, 0, 0], run = 0, start = 0;
  days.forEach((d, i) => { if (d.count > 0) { if (!run) start = i; run++; if (run > best[0]) best = [run, start, i]; } else run = 0; });
  let cur = 0, j = days.length - 1;
  if (days[j] && days[j].count === 0) j--;
  while (j >= 0 && days[j].count > 0) { cur++; j--; }
  return { total, longest: best[0], lRange: best[0] ? `${fmt(days[best[1]].date)} to ${fmt(days[best[2]].date)}` : "No streak yet", cur, curSince: cur ? `Since ${fmt(days[days.length - cur].date)}` : "Starts with the next commit" };
}

export function ActivityGrid({ title = "Contributions", user = "Hafiz-Sakib", palette = "green" }) {
  const dark = useDark();
  const still = !!useReducedMotion();
  const shade = (dark ? night : palettes)[palette] || (dark ? night : palettes).green;
  const [days, setDays] = useState(null);
  const [live, setLive] = useState(true);
  const [hot, setHot] = useState(null); // { r, c, d }
  useEffect(() => {
    let off = false;
    load(user).then((d) => !off && setDays(d)).catch(() => { if (!off) { setDays(sample()); setLive(false); } });
    return () => { off = true; };
  }, [user]);
  const data = days || sample();
  const s = useMemo(() => stats(data), [data]);
  const max = Math.max(...data.map((d) => d.count));
  const first = (new Date(data[0].date + "T00:00:00").getDay() + 6) % 7; // week starts Monday
  const cells = [...Array(first).fill(null), ...data];
  const cols = Math.ceil(cells.length / 7);
  const months = [];
  for (let c = 0; c < cols; c++) {
    const d = cells.slice(c * 7, c * 7 + 7).find(Boolean);
    if (!d) continue;
    const m = new Date(d.date + "T00:00:00").toLocaleDateString("en", { month: "short" });
    if (months[months.length - 1]?.m !== m) months.push({ m, c });
  }
  const tiles = [["Total", s.total, "contributions", "Last 26 weeks"], ["Longest streak", s.longest, "days", s.lRange], ["Current streak", s.cur, "days", s.curSince]];
  return (
    <div className="card p-3 sm:p-4">
      <div className="rounded-[1.4rem] bg-gradient-to-b from-emerald-50 to-white/60 p-3 dark:from-emerald-400/10 dark:to-transparent sm:p-5">
        <div data-glow className="rounded-3xl bg-surface p-5 shadow-sm dark:ring-1 dark:ring-white/[.06]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-ink/70">{title}</h3>
              <p className="mt-1 flex flex-wrap items-baseline gap-3"><span className="font-display text-5xl font-extrabold"><Odometer to={s.total} /></span><span className="text-ink/60">contributions</span></p>
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold">{hot ? `${hot.d.count} on ${fmt(hot.d.date)}` : "Last 26 weeks"}</span>
          </div>
          <div className="mt-5 overflow-x-auto p-1">
            <div className="min-w-[540px] pr-1">
              <div className="relative ml-8 h-4 text-xs text-ink/50">{months.map((x) => <span key={x.m + x.c} className="absolute" style={{ left: `${(x.c / cols) * 100}%` }}>{x.m}</span>)}</div>
              <div className="flex gap-2">
                <div className="grid w-6 grid-rows-7 gap-[3px] text-[11px] leading-none text-ink/50" aria-hidden>{["Mon", "", "Wed", "", "Fri", "", ""].map((l, i) => <span key={i} className="flex items-center">{l}</span>)}</div>
                <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]" role="img" aria-label={`${s.total} contributions in the last 26 weeks`} onMouseLeave={() => setHot(null)}>
                  {cells.map((d, i) => {
                    if (!d) return <span key={i} />;
                    const r = i % 7, c = Math.floor(i / 7);
                    const near = hot && (hot.r === r || hot.c === c);
                    return (
                      <motion.span key={i} title={`${d.count} on ${fmt(d.date)}`} onMouseEnter={() => setHot({ r, c, d })}
                        initial={still ? false : { scale: 0.3 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: still ? 0 : c * 0.018 }}
                        style={{ background: shade[lvl(d.count, max)] }}
                        className={`aspect-square rounded-[4px] transition-opacity duration-150 ${hot && !near ? "opacity-30" : ""} ${i === cells.length - 1 ? "ring-2 ring-emerald-800 ring-offset-1 ring-offset-surface dark:ring-emerald-300" : ""}`} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
            <span>{live ? (days ? `Live from GitHub (@${user})` : "Loading") : "Sample data (GitHub not reachable)"}</span>
            <span className="flex items-center gap-1.5">Less {shade.map((c, i) => <span key={i} style={{ background: c }} className="h-3 w-3 rounded-[3px]" />)} More</span>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {tiles.map(([t, v, u, f]) => (
            <div key={t} data-glow className="rounded-2xl bg-surface/80 p-4 shadow-sm dark:ring-1 dark:ring-white/[.06]">
              <p className="text-xs font-semibold text-ink/55">{t}</p>
              <p className="mt-1 font-display text-2xl font-extrabold"><Odometer to={v} /> <span className="text-sm font-medium text-ink/60">{u}</span></p>
              <p className="text-xs text-ink/50">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
