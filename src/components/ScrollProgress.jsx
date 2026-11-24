import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/* Thin line right under the header: it fills as the page is scrolled (colour follows the theme's ink). */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  if (reduce) return null;
  return <motion.div aria-hidden className="pointer-events-none fixed inset-x-0 z-[51] h-[2.5px] origin-left bg-ink/75" style={{ scaleX, top: "calc(3.5rem + env(safe-area-inset-top))" }} />;
}
