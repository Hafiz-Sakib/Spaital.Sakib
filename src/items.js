// Every picture you drop into  src/images/  becomes part of the gallery automatically.
// (jpg, jpeg, png, webp, avif, gif, svg). No list to edit: add or remove files and the page updates.
const files = import.meta.glob("./images/*.{jpg,jpeg,png,webp,avif,gif,svg,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const items = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({
    src,
    type: "image",
    alt: path.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
  }));
