import { useDark } from "../theme";
import {
  SiC, SiCplusplus, SiOpenjdk, SiPython, SiJavascript, SiTypescript, SiDart, SiReact, SiNextdotjs,
  SiTailwindcss, SiRedux, SiNodedotjs, SiExpress, SiFirebase, SiMongodb, SiPostgresql, SiDocker,
  SiGit, SiGithub, SiLinux, SiVercel, SiFigma, SiLatex, SiTensorflow, SiPandas, SiJupyter,
  SiCodeforces, SiLeetcode, SiX, SiInstagram, SiFacebook, SiWhatsapp, SiThreedotjs, SiVite,
  SiMysql, SiStripe, SiHackerrank, SiGeeksforgeeks, SiGithubactions, SiFramer, SiReactrouter,
  SiJsonwebtokens, SiPwa,
} from "react-icons/si";
import {
  FaLinkedin, FaHtml5, FaCss3Alt, FaAws, FaGlobe, FaDatabase, FaBrain, FaCircleNodes, FaCode,
  FaPhone, FaEnvelope, FaServer, FaDiagramProject, FaChartLine, FaLanguage, FaKey, FaRoute, FaSquareRootVariable,
} from "react-icons/fa6";

/* name -> [icon, brand colour]. Any name not listed here simply renders without an icon. */
const MAP = {
  // languages
  "C": [SiC, "#5C6BC0"], "C++": [SiCplusplus, "#00599C"], "Java": [SiOpenjdk, "#ED8B00"],
  "Python": [SiPython, "#3776AB"], "JavaScript": [SiJavascript, "#D4A800"], "TypeScript": [SiTypescript, "#3178C6"],
  "Dart": [SiDart, "#0175C2"],
  // frontend
  "React": [SiReact, "#149ECA"], "React 19": [SiReact, "#149ECA"], "Next.js": [SiNextdotjs, "#14151A"],
  "Tailwind CSS": [SiTailwindcss, "#06B6D4"], "Tailwind": [SiTailwindcss, "#06B6D4"],
  "HTML5": [FaHtml5, "#E34F26"], "CSS3": [FaCss3Alt, "#1572B6"], "Redux": [SiRedux, "#764ABC"],
  "Vite": [SiVite, "#7C6CF6"], "PWA": [SiPwa, "#5A0FC8"], "Framer Motion": [SiFramer, "#14151A"],
  "React Router": [SiReactrouter, "#CA4245"], "Three.js": [SiThreedotjs, "#14151A"], "R3F": [SiThreedotjs, "#14151A"],
  "Math.js": [FaSquareRootVariable, "#D2481F"],
  // backend
  "Node.js": [SiNodedotjs, "#339933"], "Express.js": [SiExpress, "#14151A"], "Express": [SiExpress, "#14151A"],
  "Firebase": [SiFirebase, "#F59E0B"], "MongoDB": [SiMongodb, "#47A248"], "PostgreSQL": [SiPostgresql, "#336791"],
  "MySQL": [SiMysql, "#4479A1"], "REST APIs": [FaServer, "#14151A"], "Stripe": [SiStripe, "#635BFF"], "JWT": [SiJsonwebtokens, "#D63AFF"],
  // algorithms
  "Dynamic Programming": [FaDiagramProject, "#7C6CF6"], "Graph Theory": [FaCircleNodes, "#7C6CF6"],
  "Binary Search": [FaRoute, "#7C6CF6"], "STL": [SiCplusplus, "#00599C"], "Number Theory": [FaKey, "#7C6CF6"],
  "VLSM": [FaCircleNodes, "#7C6CF6"],
  // ML
  "Neural Networks": [FaBrain, "#E0457B"], "LSTM": [FaBrain, "#E0457B"], "NLP": [FaLanguage, "#E0457B"],
  "Pandas": [SiPandas, "#150458"], "Jupyter": [SiJupyter, "#F37626"], "TensorFlow": [SiTensorflow, "#FF6F00"],
  // cloud & tools
  "AWS": [FaAws, "#FF9900"], "Docker": [SiDocker, "#2496ED"], "Git": [SiGit, "#F05032"], "GitHub": [SiGithub, "#14151A"],
  "Linux": [SiLinux, "#14151A"], "Vercel": [SiVercel, "#14151A"], "CI/CD": [SiGithubactions, "#2088FF"],
  "Figma": [SiFigma, "#F24E1E"], "LaTeX": [SiLatex, "#008080"],
  // social / contact
  "LinkedIn": [FaLinkedin, "#0A66C2"], "Codeforces": [SiCodeforces, "#1F8ACB"], "LeetCode": [SiLeetcode, "#FFA116"],
  "X": [SiX, "#14151A"], "Instagram": [SiInstagram, "#E4405F"], "Facebook": [SiFacebook, "#1877F2"],
  "WhatsApp": [SiWhatsapp, "#25D366"], "HackerRank": [SiHackerrank, "#00A55A"], "GeeksforGeeks": [SiGeeksforgeeks, "#2F8D46"],
  "Email": [FaEnvelope, "#7C6CF6"], "Call": [FaPhone, "#16A34A"], "Website": [FaGlobe, "#14151A"],
  "Database": [FaDatabase, "#14151A"], "Code": [FaCode, "#14151A"], "Chart": [FaChartLine, "#14151A"],
};

/** <Icon name="C++" /> renders that brand's logo in its colour, or nothing if there isn't one. `mono` uses currentColor. */
/* Brand colours that would disappear on the night background are lightened (black-ish ones follow the text colour). */
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
const night = (hex) => (hex === "#14151A" ? "rgb(var(--ink))" : lum(hex) < 0.42 ? `color-mix(in srgb, ${hex} ${Math.round(50 + (lum(hex) / 0.42) * 20)}%, #fff)` : hex);

export function Icon({ name, className = "h-4 w-4", mono = false }) {
  const dark = useDark();
  const hit = MAP[name];
  if (!hit) return null;
  const [Cmp, color] = hit;
  return <Cmp aria-hidden className={`shrink-0 ${className}`} style={mono ? undefined : { color: dark ? night(color) : color }} />;
}

export const hasIcon = (name) => !!MAP[name];
