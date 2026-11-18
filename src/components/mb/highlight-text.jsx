/* HighlightText (motion-brew style): a marker sweeps behind key phrases as the paragraph scrolls in.
   <HighlightText text="..." marks={["full-stack", "NLP"]} /> */
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function HighlightText({ text = "", marks = [], className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const still = !!useReducedMotion();
  const list = marks.filter((m) => m && text.toLowerCase().includes(m.toLowerCase()));
  const parts = list.length ? text.split(new RegExp(`(${list.map(esc).join("|")})`, "gi")) : [text];
  let k = 0;
  return (
    <p ref={ref} className={className}>
      {parts.map((p, i) => {
        if (!list.some((m) => m.toLowerCase() === p.toLowerCase())) return <span key={i}>{p}</span>;
        const n = k++;
        return (
          <motion.mark key={i} className="rounded-md bg-transparent px-0.5 text-inherit [box-decoration-break:clone]"
            style={{ backgroundImage: "linear-gradient(90deg, rgb(167 139 250 / .45), rgb(244 114 182 / .4))", backgroundRepeat: "no-repeat", backgroundPosition: "0 100%" }}
            initial={false} animate={{ backgroundSize: still || seen ? "100% 100%" : "0% 100%" }} transition={{ duration: 0.8, delay: 0.3 + n * 0.35, ease: [0.22, 1, 0.36, 1] }}>
            {p}
          </motion.mark>
        );
      })}
    </p>
  );
}
