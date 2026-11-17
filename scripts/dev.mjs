// `npm run dev` = start Vite + process photos + keep watching photos/ for new ones.
//   - Vite starts immediately (extra args work: npm run dev -- --host)
//   - existing + new photos in photos/ are converted/renamed by scripts/prepare-gallery.mjs
//   - drop more photos into photos/ any time while this runs: they are picked up a few seconds after the copy finishes
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const INBOXES = [path.resolve("photos"), path.resolve("src/images")]; // both folders are watched
const ACCEPT = /\.(jpe?g|jpe|jfif|pjpeg|pjp|png|apng|gif|webp|avif|bmp|tiff?|svg|heic|heif)$/i;
const POLL_MS = 2000;

const vite = spawn(process.execPath, [path.resolve("node_modules/vite/bin/vite.js"), ...process.argv.slice(2)], { stdio: "inherit" });
vite.on("exit", (code) => process.exit(code ?? 0));
const stop = () => { vite.kill("SIGINT"); setTimeout(() => process.exit(0), 300); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

let running = false;
const prepare = () => new Promise((resolve) => {
  running = true;
  const p = spawn(process.execPath, [path.resolve("scripts/prepare-gallery.mjs")], { stdio: "inherit" });
  p.on("exit", (code) => { running = false; resolve(code); });
});

async function signature(dirs) {
  const out = [];
  const walk = async (d) => {
    let entries = [];
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (ACCEPT.test(e.name)) { const st = await fs.stat(p).catch(() => null); if (st) out.push(`${p}:${st.size}:${st.mtimeMs}`); }
    }
  };
  for (const dir of dirs) await walk(dir);
  return out.sort().join("|");
}

// first pass (the page reloads by itself when it is done)
console.log("[photos] checking photos/ and src/images/ ...");
await prepare();
let done = await signature(INBOXES); // what is left after the run (e.g. a file that failed) is not retried in a loop
let prev = done;

setInterval(async () => {
  if (running) return;
  const sig = await signature(INBOXES);
  const stable = sig === prev;   // same as 2 seconds ago = copy finished
  prev = sig;
  if (stable && sig && sig !== done) {
    console.log("[photos] new photos found, processing ...");
    await prepare();
    done = await signature(INBOXES);
    prev = done;
  } else if (!sig) done = sig;
}, POLL_MS);
