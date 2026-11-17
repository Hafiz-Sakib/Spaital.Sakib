import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "../site";
import { contact } from "../about";
import { Icon } from "../components/icons";
import Page, { Reveal } from "./Page";

function CopyRow({ label, value, href, icon }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); }
    catch { const t = document.createElement("textarea"); t.value = value; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch {} t.remove(); }
    setDone(true); setTimeout(() => setDone(false), 1600);
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink/[.05] p-3 sm:p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface"><Icon name={icon} className="h-5 w-5" /></span>
      <a href={href} className="min-w-0 flex-1">
        <div className="text-xs text-ink/50">{label}</div>
        <div className="truncate font-semibold">{value}</div>
      </a>
      <button onClick={copy} className="relative min-w-[4.5rem] rounded-full bg-ink px-4 py-2 text-xs font-semibold text-mist">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={done ? "d" : "c"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.14 }} className="block">{done ? "Copied ✓" : "Copy"}</motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

export default function Contact() {
  return (
    <Page id="contact" eyebrow="Contact" title="Let's talk" sub="Email, call or find me on any of these. Always happy to chat about web, algorithms or NLP.">
      <div className="grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="card h-full space-y-3 p-5 sm:p-6">
            <CopyRow label="Email" value={site.email} href={`mailto:${site.email}`} icon="Email" />
            <CopyRow label="Phone / WhatsApp" value={contact.phone} href={contact.phoneHref} icon="Call" />
            <div className="flex items-center gap-3 rounded-2xl bg-ink/[.05] p-3 sm:p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface"><Icon name="Website" className="h-5 w-5" /></span>
              <div><div className="text-xs text-ink/50">Based in</div><div className="font-semibold">{site.place}</div></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <a href={`mailto:${site.email}`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-mist transition hover:-translate-y-0.5">Email me</a>
              <a href="/Hafiz-Sakib-CV.pdf" target="_blank" rel="noreferrer" className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">Download CV</a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-2">
          <div className="card h-full p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink/55">Find me online</h2>
            <ul className="grid grid-cols-2 gap-2">
              {site.social.map((s) => (
                <li key={s.name}>
                  <motion.a whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.96 }} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-2xl bg-ink/[.05] px-3 py-3 text-sm font-semibold">
                    <Icon name={s.name} className="h-5 w-5" />{s.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Page>
  );
}
