import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuMail, LuMessageSquareText, LuTag, LuUser } from "react-icons/lu";
import { site } from "../site";
import { Icon } from "../components/icons";
import { OrbitCard } from "../components/mb/orbit-card";
import { BellToggle } from "../components/BellToggle";
import { SuccessModal } from "../components/SuccessModal";
import Page, { Reveal } from "./Page";

/* Contact page: the form, the "Notify me" bell and the delivery code are the portfolio's, unchanged.
   Delivery: every message is sent to your inbox in real time through Web3Forms.
   The access key below is the portfolio's real one. Web3Forms keys are meant to be public (they can only send to the inbox
   they were created for, hafizsakib5@gmail.com); set VITE_WEB3FORMS_KEY in Vercel > Settings > Environment Variables to override it.
   If the key is ever emptied the form falls back to FormSubmit.co (confirm once with the link they email you). */
const INBOX = "hafizsakib5@gmail.com";
const KEY =
  import.meta.env.VITE_WEB3FORMS_KEY || "fa7f8ec7-a4a8-424b-8efd-9b6387755682";
const me = { email: site.email || INBOX };

async function send({ name, email, subject: userSubject, message }) {
  const subject = `${userSubject} (Portfolio: ${name})`;
  const res = KEY
    ? await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: KEY,
          subject,
          from_name: "Portfolio website",
          name,
          email,
          replyto: email,
          message,
        }),
      })
    : await fetch(`https://formsubmit.co/ajax/${INBOX}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: subject,
          _replyto: email,
          _captcha: "false",
          _template: "table",
        }),
      });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.success === false || j.success === "false")
    throw new Error(j.message || "Failed");
}

const chip =
  "flex items-center justify-center gap-2 rounded-full bg-mist px-4 py-3 transition hover:bg-ink/10";
const field =
  "w-full rounded-2xl border border-ink/10 bg-mist/70 px-4 py-3 text-[15px] outline-none transition focus:border-ink/40 focus:bg-surface";

function Form() {
  const [v, setV] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "",
  });
  const [st, setSt] = useState("idle"); // idle | sending | error
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState({});
  const on = (k) => (e) => setV((o) => ({ ...o, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (v.hp) return; // bots fill the hidden field
    const er = {};
    if (v.name.trim().length < 2) er.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email))
      er.email = "Please enter a valid email.";
    if (v.subject.trim().length < 3) er.subject = "Please add a subject.";
    if (v.message.trim().length < 10)
      er.message = "Write at least a short sentence.";
    setErr(er);
    if (Object.keys(er).length) return;
    setSt("sending");
    try {
      await send({
        name: v.name.trim(),
        email: v.email.trim(),
        subject: v.subject.trim(),
        message: v.message.trim(),
      });
      setSt("idle");
      setV({ name: "", email: "", subject: "", message: "", hp: "" });
      setSent(true);
    } catch {
      setSt("error");
    }
  };

  return (
    <div className="card flex h-full flex-col p-6 sm:p-8">
      <SuccessModal
        open={sent}
        onClose={() => setSent(false)}
        title="Message sent"
        text="Thanks for reaching out. I'll reply by email soon."
      />
      <motion.form
        key="form"
        onSubmit={submit}
        noValidate
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-1 flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <LuUser aria-hidden className="h-4 w-4 text-ink/55" />
              Name
            </span>
            <input
              className={`${field} mt-1.5`}
              value={v.name}
              onChange={on("name")}
              autoComplete="name"
              aria-invalid={!!err.name}
              placeholder="Your name"
            />
            {err.name && (
              <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                {err.name}
              </span>
            )}
          </label>
          <label className="block text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <LuMail aria-hidden className="h-4 w-4 text-ink/55" />
              Email
            </span>
            <input
              className={`${field} mt-1.5`}
              type="email"
              value={v.email}
              onChange={on("email")}
              autoComplete="email"
              aria-invalid={!!err.email}
              placeholder="you@example.com"
            />
            {err.email && (
              <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                {err.email}
              </span>
            )}
          </label>
        </div>
        <label className="block text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <LuTag aria-hidden className="h-4 w-4 text-ink/55" />
            Subject
          </span>
          <input
            className={`${field} mt-1.5`}
            value={v.subject}
            onChange={on("subject")}
            maxLength={120}
            aria-invalid={!!err.subject}
            placeholder="What is this about? (job, freelance, research...)"
          />
          {err.subject && (
            <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
              {err.subject}
            </span>
          )}
        </label>
        <label className="flex flex-1 flex-col text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <LuMessageSquareText aria-hidden className="h-4 w-4 text-ink/55" />
            Message
          </span>
          <textarea
            className={`${field} mt-1.5 min-h-42.5 flex-1 resize-none`}
            value={v.message}
            onChange={on("message")}
            aria-invalid={!!err.message}
            placeholder="Tell me about your idea, role or project"
          />
          {err.message && (
            <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
              {err.message}
            </span>
          )}
        </label>
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={v.hp}
          onChange={on("hp")}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          name="website"
        />
        {st === "error" && (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          >
            Couldn't send right now. Please email me directly at{" "}
            <a className="font-semibold underline" href={`mailto:${me.email}`}>
              {me.email}
            </a>
            .
          </p>
        )}
        <button
          disabled={st === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-mist transition hover:bg-ink/85 disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {st === "sending" ? "Sending..." : "Send message"}
          {st !== "sending" && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </motion.form>
    </div>
  );
}

/* "Notify me": toggle the bell, enter an email, subscribe. Arrives in the same inbox via Web3Forms. */
function Notify() {
  const [on, setOn] = useState(false);
  const [email, setEmail] = useState("");
  const [st, setSt] = useState("idle"); // idle | sending | done | error
  const [modal, setModal] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (v) => {
    setOn(v);
    if (!v) {
      setSt("idle");
      setErr("");
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setErr("Please enter a valid email.");
    setErr("");
    setSt("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: KEY,
          subject: `New subscriber: ${email.trim()}`,
          from_name: "Portfolio notify list",
          email: email.trim(),
          replyto: email.trim(),
          message: `${email.trim()} wants to be notified about new projects and updates.`,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === false || j.success === "false")
        throw new Error();
      setSt("done");
      setEmail("");
      setModal(true);
    } catch {
      setSt("error");
    }
  };

  return (
    <div className="card mt-6 p-3">
      <SuccessModal
        open={modal}
        onClose={() => setModal(false)}
        title="You're subscribed"
        text="Thanks! You're on the list. I'll email you when I ship something new."
      />
      <div className="flex flex-col gap-5 rounded-[1.4rem] bg-mist px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 md:max-w-sm">
          <h3 className="text-xl font-extrabold sm:text-2xl">
            Get notified about new work
          </h3>
          <p className="mt-1 text-ink/60">
            Flip the bell, add your email, and I'll let you know when I ship
            something new.
          </p>
        </div>
        <div className="min-w-0 md:w-104">
          <BellToggle
            on={on}
            onChange={toggle}
            label="Notify me"
            onLabel={st === "done" ? "You're subscribed" : "Enter your email"}
          />
          <AnimatePresence initial={false}>
            {on && st !== "done" && (
              <motion.form
                key="f"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-3 sm:flex-row">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!err}
                    aria-label="Your email"
                    placeholder="you@example.com"
                    className={`${field} min-w-0 flex-1 rounded-full! bg-surface`}
                  />
                  <button
                    disabled={st === "sending"}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-mist transition hover:bg-ink/85 disabled:opacity-60"
                  >
                    {st === "sending" ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
                {err && (
                  <p
                    role="alert"
                    className="mt-2 px-2 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {err}
                  </p>
                )}
                {st === "error" && (
                  <p
                    role="alert"
                    className="mt-2 px-2 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    Couldn't subscribe right now. Please try again in a moment.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const social = site.social || [];
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(me.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  const quick = social
    .filter((s) => s.name === "WhatsApp" || s.name === "LinkedIn")
    .sort((a) => (a.name === "WhatsApp" ? -1 : 1));
  return (
    <Page
      id="contact"
      eyebrow="Contact"
      title="Let's talk"
      typed={{
        before: "Send me a message about",
        words: ["a project.", "a role.", "research.", "an idea."],
      }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[.85fr_1.15fr] *:min-w-0">
        <Reveal x={-30} y={0} className="h-full">
          <div className="card flex h-full flex-col p-3">
            <div className="flex-1 rounded-[1.4rem] bg-linear-to-b from-surface to-mist/70 px-6 pb-6 pt-8 text-center">
              <OrbitCard
                center={
                  <img
                    src="/profile.webp"
                    alt=""
                    className="h-20 w-20 rounded-[1.6rem] object-cover shadow-lg ring-4 ring-surface"
                  />
                }
                items={(site.social || []).map((s) => ({
                  key: s.name,
                  href: s.href,
                  label: s.name,
                  node: <Icon name={s.name} className="h-5 w-5" />,
                }))}
              />
              <h3 className="mt-4 text-2xl font-extrabold">
                Let's build something that flows
              </h3>
              <p className="mt-1 text-ink/55">
                Open to roles, freelance and research chats.
              </p>
              <button
                onClick={copy}
                className="mt-6 flex w-full items-center justify-between gap-3 rounded-full bg-mist px-5 py-3.5 text-sm font-semibold hover:bg-ink/10"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon name="Email" />
                  <span className="truncate">{me.email}</span>
                </span>
                <span className="text-violet-600 dark:text-violet-400">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
              {quick.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
                  {quick.map((s) => (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className={chip}
                      >
                        <Icon name={s.name} />
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Reveal>
        <Reveal x={30} y={0} delay={0.1} className="h-full">
          <Form />
        </Reveal>
      </div>
      <Reveal>
        <Notify />
      </Reveal>
    </Page>
  );
}
