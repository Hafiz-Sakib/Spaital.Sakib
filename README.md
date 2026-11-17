# Sakib Spatial Gallery

A single landing page with a WebGL **Spatial tunnel** you fly through (scroll, drag, hover), an About panel, day/night theme and an installable PWA.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Your photos

Put your photos in **`src/images/`** (jpg, jpeg, png, webp, avif, gif). They are picked up automatically.
Tip: resize big photos to ~1600px wide or convert them to WebP so the page stays fast.
The tunnel uses up to 64 random photos per visit (`MAX_PHOTOS` in `src/App.jsx`).

## Content

- `src/site.js`: your name, bio, tagline, social links and About stats.
- `src/gallery.js`: loads everything from `src/images/`.
# Spital.Sakib
