/**
 * BackspaceText, in the style of https://motion-brew.com/components/backspace-text
 *
 *   <BackspaceText before="We design for" words={["people.", "speed.", "delight."]} />
 *
 * Types the first word, waits, backspaces it letter by letter, then types the next one, forever.
 * Plain JSX + framer-motion (already installed). Respects prefers-reduced-motion (shows the first word, no loop).
 * A word can also be ["plain ", "keyword"]: only the keyword part gets keyClassName (e.g. a gradient).
 * Props: before, words, keyClassName, typeSpeed (ms / letter), deleteSpeed, hold (ms a finished word stays), className, caretClassName.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function BackspaceText({ before = "", words = [], typeSpeed = 75, deleteSpeed = 38, hold = 1500, className = "", keyClassName = "", caretClassName = "" }) {
  const still = !!useReducedMotion();
  const [i, setI] = useState(0);        // which word
  const [n, setN] = useState(0);        // how many letters are shown
  const [erasing, setErasing] = useState(false);
  const entry = words[i] ?? "";
  const plain = Array.isArray(entry) ? entry[0] : "";
  const word = Array.isArray(entry) ? entry[0] + entry[1] : entry;

  useEffect(() => {
    if (still || words.length === 0) return;
    let t;
    if (!erasing && n < word.length) t = setTimeout(() => setN(n + 1), typeSpeed);
    else if (!erasing) t = setTimeout(() => setErasing(true), hold);
    else if (n > 0) t = setTimeout(() => setN(n - 1), deleteSpeed);
    else { setErasing(false); setI((i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [n, erasing, i, word, still, words.length, typeSpeed, deleteSpeed, hold]);

  const firstWord = Array.isArray(words[0]) ? words[0].join("") : words[0] ?? "";
  const firstPlain = Array.isArray(words[0]) ? words[0][0] : "";
  const shown = still ? firstWord : word.slice(0, n);
  const cut = still ? firstPlain.length : plain.length;
  return (
    <span className={className} aria-label={`${before} ${words.map((w) => (Array.isArray(w) ? w.join("") : w)).join(" ")}`.trim()}>
      <span aria-hidden>
        {before && <>{before} </>}
        <span className="whitespace-pre-wrap">{shown.slice(0, cut)}<span className={keyClassName}>{shown.slice(cut)}</span></span>
        {!still && <motion.span className={`ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.2em] rounded-full bg-current align-baseline ${caretClassName}`} animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }} />}
      </span>
    </span>
  );
}
