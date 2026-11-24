import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/* Thin line at the very top of the screen: it fills as the page is scrolled (colour follows the theme's ink). */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  if (reduce) return null;
  return <motion.div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2.5px] origin-left bg-ink/75" style={{ scaleX }} />;
}
