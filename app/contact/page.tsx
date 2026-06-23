"use client";

import InfoPage from "@/components/ui/info-page";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import { FormEvent, useState } from "react";
import { FiBookOpen, FiGithub, FiMail, FiMessageCircle } from "react-icons/fi";

const SUPPORT_EMAIL = "support@thebazaar.example";

const CHANNELS = [
  {
    Icon: FiGithub,
    title: "GitHub",
    desc: "Report a bug or open an issue.",
    href: "https://github.com/TechXTT/The-Bazaar/issues/new",
    cta: "Open an issue",
  },
  {
    Icon: FiBookOpen,
    title: "Help center",
    desc: "Browse common questions first.",
    href: "/faq",
    cta: "Read the FAQ",
  },
  {
    Icon: FiMail,
    title: "Email",
    desc: "Reach the team directly.",
    href: `mailto:${SUPPORT_EMAIL}`,
    cta: SUPPORT_EMAIL,
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // There is no backend contact endpoint, so compose a prefilled email rather than
  // pretending to submit. This keeps the flow honest and dependency-free.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Support request from ${name || "a Bazaar user"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <InfoPage
      eyebrow="Contact"
      title="Get in touch"
      subtitle="Questions, feedback, or trouble with an order? Pick a channel below or send us a message."
    >
      {/* Channels */}
      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <a
            key={c.title}
            href={c.href}
            {...(c.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="group rounded-2xl border border-vault-border bg-vault-surface p-5 transition-colors hover:border-vault-accent/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-vault-accent/20 bg-vault-accent/10 text-vault-accent">
              <c.Icon size={18} />
            </div>
            <h3 className="mt-3 font-semibold text-white">{c.title}</h3>
            <p className="mt-1 text-sm text-vault-text-secondary">{c.desc}</p>
            <span className="mt-3 inline-block break-all text-xs font-semibold text-vault-accent group-hover:underline">
              {c.cta}
            </span>
          </a>
        ))}
      </div>

      {/* Message form */}
      <div className="mt-10 rounded-2xl border border-vault-border bg-vault-surface p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <FiMessageCircle size={18} className="text-vault-accent" />
          <h2 className="text-lg font-semibold text-white">Send a message</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="contact-name">
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Satoshi"
                required
              />
            </Field>
            <Field label="Email" htmlFor="contact-email" helper="So we can reply.">
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>
          </div>
          <Field label="Message" htmlFor="contact-message">
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              required
            />
          </Field>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-vault-text-tertiary">
              This opens your email client with the message prefilled.
            </p>
            <Button type="submit" disabled={!name || !email || !message}>
              Send message
            </Button>
          </div>
        </form>
      </div>
    </InfoPage>
  );
}
