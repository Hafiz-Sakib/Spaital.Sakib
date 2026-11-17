// Photos live in src/images/. Every jpg/jpeg/png/webp/avif/gif in that folder is picked up automatically
// (Vite bundles + hashes them, nothing to import by hand). No titles or captions are shown; `alt` is only for screen readers.
const files = import.meta.glob("./images/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}", { eager: true, query: "?url", import: "default" });

export const images = Object.keys(files).sort().map((path) => ({ src: files[path], alt: "Photo", href: files[path] }));
