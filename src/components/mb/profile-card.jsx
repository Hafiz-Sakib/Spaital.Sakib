/* ProfileCard (motion-brew style): a pastel cover whose colour blobs drift toward the cursor, with a PixelBlast
   (dithered pixel clouds that light up under the pointer) drawn over them, an avatar that overlaps the cover,
   then name / line / place and a slot for buttons. */
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { PixelBlast } from "@/components/pixel-blast";
import { useDark } from "../../theme";

function Blob({ mx, my, f, className }) {
  const x = useTransform(mx, (n) => n * f), y = useTransform(my, (n) => n * f);
  return <motion.span aria-hidden className={`absolute rounded-full blur-2xl ${className}`} style={{ x, y }} />;
}

export function ProfileCard({ img, name, line, place, children, className = "" }) {
  const still = !!useReducedMotion();
  const dark = useDark();
  const mx = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });
  const move = (e) => { if (still) return; const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width - 0.5) * 2); my.set(((e.clientY - r.top) / r.height - 0.5) * 2); };
  const leave = () => { mx.set(0); my.set(0); };
  return (
    <div onMouseMove={move} onMouseLeave={leave} className={`card overflow-hidden p-3 ${className}`}>
      <div className="relative h-40 overflow-hidden rounded-[1.4rem] bg-lilac sm:h-48">
        <Blob mx={mx} my={my} f={22} className="-left-6 -top-10 h-44 w-44 bg-sky" />
        <Blob mx={mx} my={my} f={-30} className="right-0 top-2 h-40 w-40 bg-peach" />
        <Blob mx={mx} my={my} f={40} className="bottom-[-3rem] left-1/3 h-40 w-52 bg-mint" />
        <PixelBlast color={dark ? "#b4a8ff" : "#7c6cf6"} cellSize={5} speed={0.8} coverage={1.3} density={0.7} className="absolute! inset-0 h-full min-h-0!" />
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <img src={img} alt={name} className="relative z-10 -mt-14 h-28 w-28 rounded-full object-cover object-top shadow-xl ring-4 ring-surface sm:-mt-16 sm:h-32 sm:w-32" />
        <h2 className="mt-4 font-display text-3xl font-bold">{name}</h2>
        {line && <p className="mt-1 text-ink/60">{line}</p>}
        {place && <p className="mt-0.5 text-sm text-ink/45">{place}</p>}
        {children && <div className="mt-5 flex flex-wrap gap-2.5">{children}</div>}
      </div>
    </div>
  );
}

