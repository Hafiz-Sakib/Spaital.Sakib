// Photos live in ONE folder, public/gallery/: N.webp (full), N-medium.webp, N-thumb.webp and are listed in gallery-meta.json
// (written by scripts/prepare-gallery.mjs):  [[originalName, width, height, version], ...]  oldest -> newest,
// entry i  <->  file (i + 1).webp.  Nothing is imported per image, so 500 photos cost ~12 KB of JS.
import meta from "./gallery-meta.json";

const BASE = import.meta.env.BASE_URL;
const url = (tier, i, v) => `${BASE}gallery/${i + 1}${tier === "full" ? "" : "-" + tier}.webp?v=${v}`; // ?v= changes when the picture changes (safe immutable caching)

// No titles, file names or captions are shown anywhere: title/label/caption stay empty. `alt` is only for screen readers.
export const images = meta.map(([, w, h, v], i) => {
  const full = url("full", i, v);
  // src = medium (carousels etc.), thumb = grid/strips, full = lightbox / open in new tab
  return { src: url("medium", i, v), thumb: url("thumb", i, v), full, w, h, title: "", label: "", alt: "Photo", meta: "", caption: "", href: full };
});
