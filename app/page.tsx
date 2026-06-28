"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Mail,
  MoveRight
} from "lucide-react";
import { certificates, offerings, registrationFormUrl, testimonials } from "@/lib/data";
import { FadeUp, MotionSection } from "@/components/MotionPrimitives";
import { Navbar } from "@/components/Navbar";
import { SectionHeading } from "@/components/SectionHeading";
import { ThemeProvider } from "@/components/ThemeProvider";

type Certificate = (typeof certificates)[number];

type CertificatePreview = {
  certificate: Certificate;
  left: number;
  top: number;
  width: number;
};

function getPreviewRatio(certificate: Pick<Certificate, "previewAspectRatio">) {
  const [width, height] = certificate.previewAspectRatio.split("/").map((value) => Number(value.trim()));

  return width / height;
}

function getPreviewPlacement(certificate: Certificate, x: number, y: number) {
  const ratio = getPreviewRatio(certificate);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 12;
  const padding = 16;
  const width = Math.min(416, viewportWidth * 0.42, (viewportHeight - padding * 2) * ratio);
  const height = width / ratio;
  const hasRoomRight = x + gap + width <= viewportWidth - padding;
  const hasRoomBelow = y + gap + height <= viewportHeight - padding;
  const preferredLeft = hasRoomRight ? x + gap : x - gap - width;
  const preferredTop = hasRoomBelow ? y + gap : y - gap - height;

  return {
    left: Math.max(padding, Math.min(preferredLeft, viewportWidth - width - padding)),
    top: Math.max(padding, Math.min(preferredTop, viewportHeight - height - padding)),
    width
  };
}

export default function Home() {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="relative overflow-hidden">
        <Offerings />
        <Testimonials />
        <About />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  );
}

function RegisterButton({
  href,
  label = "Register",
  className = ""
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember ${className}`}
    >
      {label}
      <ArrowRight size={16} />
    </a>
  );
}

function RegistrationNote({ inverse = false }: { inverse?: boolean }) {
  return (
    <p className={`text-sm leading-6 ${inverse ? "text-linen/72" : "text-[color:var(--muted)]"}`}>
      Registration opens in Google Forms. The form includes the payment QR and collects the
      details needed to send a confirmation email after payment is completed.
    </p>
  );
}

function Offerings() {
  return (
    <section id="offerings" className="relative px-4 pb-16 pt-28 md:pb-20 md:pt-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,rgba(204,197,185,0.42),rgba(255,252,242,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(25,17,11,0))]" />
      <div className="section-shell">
        <FadeUp className="max-w-3xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.28em] text-moss dark:text-sage">
            Yin for Yoga
          </p>
          <h1 className="text-balance font-serif text-4xl font-medium leading-tight text-bark dark:text-linen md:text-5xl">
            Online yoga offerings you can view, choose, and register for.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
            Current workshops and classes are listed first so visitors can quickly see what is
            available. New offerings can be added to the same section as they are announced.
          </p>
        </FadeUp>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {offerings.map((offering, index) => (
            <OfferingCard key={offering.title} offering={offering} delay={index * 0.08} />
          ))}
        </div>

        <FadeUp delay={0.16} className="mt-6 rounded-[24px] border border-walnut/10 bg-linen/72 p-5 shadow-innerGlow backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <RegistrationNote />
            <RegisterButton href={registrationFormUrl} label="Open Form" className="md:justify-self-end" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function OfferingCard({
  offering,
  delay
}: {
  offering: {
    title: string;
    eyebrow: string;
    theme: string;
    date: string;
    duration: string;
    mode: string;
    status: string;
    formUrl: string;
    icon: LucideIcon;
    description: string;
    details: string[];
    bestFor: string;
  };
  delay: number;
}) {
  const Icon = offering.icon;

  return (
    <FadeUp delay={delay}>
      <article className="flex min-h-full flex-col rounded-[28px] border border-walnut/10 bg-[color:var(--panel-strong)] p-6 shadow-earthy backdrop-blur dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone/48 text-forest dark:bg-white/10 dark:text-linen">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                {offering.eyebrow}
              </p>
              <h2 className="mt-1 font-serif text-3xl font-medium leading-tight text-bark dark:text-linen">
                {offering.title}
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-stone/46 px-3 py-2 text-xs font-bold text-forest dark:bg-white/10 dark:text-linen">
            {offering.status}
          </span>
        </div>

        <p className="mt-5 text-base font-bold text-bark dark:text-linen">{offering.theme}</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{offering.description}</p>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <Info label="Date" value={offering.date} />
          <Info label="Duration" value={offering.duration} />
          <Info label="Mode" value={offering.mode} />
        </div>

        <div className="mt-6 grid gap-3">
          {offering.details.map((detail) => (
            <div key={detail} className="flex gap-3 text-sm leading-6 text-[color:var(--muted)]">
              <CheckCircle2 className="mt-0.5 shrink-0 text-ember" size={17} />
              <span>{detail}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-[20px] bg-stone/24 p-4 text-sm leading-6 text-[color:var(--muted)] dark:bg-white/5">
          <span className="font-bold text-bark dark:text-linen">Best for: </span>
          {offering.bestFor}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <RegisterButton href={offering.formUrl} />
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-walnut/72 dark:text-linen/62">
            Google Form <ExternalLink size={14} />
          </span>
        </div>
      </article>
    </FadeUp>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-walnut/10 bg-linen/62 p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-walnut/68 dark:text-stone">
        {label}
      </p>
      <p className="mt-1 font-bold text-bark dark:text-linen">{value}</p>
    </div>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="bg-bark py-20 text-linen md:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Testimonials"
          title="What students say about the practice."
          copy="A small proof section for warm notes from students and clients. These can be replaced with real messages whenever you are ready."
          inverse
        />
        <div className="grid items-start gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeUp key={testimonial.name} delay={index * 0.06}>
              <article className="min-h-full rounded-[24px] border border-white/10 bg-linen p-5 text-bark shadow-earthy">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-walnut">
                  {testimonial.type}
                </p>
                <p className="mt-5 font-serif text-2xl leading-snug">"{testimonial.quote}"</p>
                <div className="mt-5 border-t border-bark/10 pt-4">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-bark/62">{testimonial.detail}</p>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const credentials = [
    "Certified yoga teacher",
    "Strength and personal training",
    "Prehab and rehab-informed",
    "PCOS-aware movement coaching"
  ];

  return (
    <MotionSection id="about" className="relative py-20 md:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.82fr_1fr]">
        <FadeUp className="rounded-[28px] border border-walnut/10 bg-linen/76 p-6 shadow-earthy dark:border-white/10 dark:bg-white/5">
          <div className="wood-panel rounded-[22px] p-6 text-linen">
            <p className="font-serif text-3xl leading-tight">
              I teach movement as a way to rebuild trust, strength, and steadiness from the inside.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {credentials.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-full border border-walnut/10 bg-linen/60 px-4 py-3 text-sm font-bold text-bark dark:border-white/10 dark:bg-white/5 dark:text-linen"
              >
                <BadgeCheck size={16} className="text-ember" />
                {item}
              </div>
            ))}
          </div>
        </FadeUp>

        <div>
          <SectionHeading
            eyebrow="About me"
            title="Grounded coaching shaped by lived transformation."
            copy="Before coaching, I moved through obesity, bullying, PCOS, low confidence, toxic fitness spaces, and corporate burnout. Movement became the place where I reclaimed strength without losing softness."
          />
          <FadeUp className="space-y-5 text-base leading-8 text-[color:var(--muted)]">
            <p>
              My sessions blend yoga, functional strength, mobility, recovery, prehab principles,
              and nervous-system friendly pacing.
            </p>
            <p>
              The goal is a more capable, confident, resilient relationship with movement, built
              through practice that feels structured without becoming harsh.
            </p>
          </FadeUp>
        </div>
      </div>
    </MotionSection>
  );
}

function Certificates() {
  const [preview, setPreview] = useState<CertificatePreview | null>(null);

  const showPreview = (certificate: Certificate, x: number, y: number) => {
    setPreview({
      certificate,
      ...getPreviewPlacement(certificate, x, y)
    });
  };

  return (
    <section id="certificates" className="bg-stone/24 py-20 dark:bg-white/[0.03] md:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Certifications"
          title="Training that supports each session."
          copy="A clear view of the education behind the practice across yoga, strength, recovery, nutrition, and body-aware movement."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate, index) => (
            <CertificateCard
              key={certificate.title}
              certificate={certificate}
              delay={index * 0.04}
              isPreviewed={preview?.certificate.title === certificate.title}
              onPreview={showPreview}
              onPreviewEnd={() => setPreview(null)}
            />
          ))}
        </div>
      </div>

      {preview ? (
        <CertificatePreviewPopover preview={preview} />
      ) : null}

      <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        {certificates.map((certificate) => (
          <img
            key={certificate.previewImageUrl}
            src={certificate.previewImageUrl}
            alt=""
            loading="eager"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}

function CertificateCard({
  certificate,
  delay,
  isPreviewed,
  onPreview,
  onPreviewEnd
}: {
  certificate: Certificate;
  delay: number;
  isPreviewed: boolean;
  onPreview: (certificate: Certificate, x: number, y: number) => void;
  onPreviewEnd: () => void;
}) {
  const Icon = certificate.icon;
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onPreview(certificate, rect.right, rect.top);
  };

  return (
    <FadeUp delay={delay}>
      <div
        className="group relative min-h-full"
        onMouseEnter={(event) => onPreview(certificate, event.clientX, event.clientY)}
        onMouseMove={(event) => onPreview(certificate, event.clientX, event.clientY)}
        onMouseLeave={onPreviewEnd}
        onFocusCapture={handleFocus}
        onBlurCapture={onPreviewEnd}
      >
        <a
          href={certificate.fileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${certificate.title} certificate in a new tab`}
          className={`block min-h-full rounded-[24px] border bg-linen/78 p-5 shadow-innerGlow outline-none transition hover:-translate-y-1 hover:border-ember/40 hover:shadow-earthy focus-visible:-translate-y-1 focus-visible:border-ember focus-visible:ring-4 focus-visible:ring-ember/18 dark:bg-white/5 ${
            isPreviewed
              ? "border-ember/48 dark:border-ember/55"
              : "border-walnut/10 dark:border-white/10"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-stone/56 text-bark dark:bg-white/10 dark:text-linen">
              <Icon size={21} />
            </div>
            <span className="rounded-full bg-ember px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-linen">
              {certificate.category}
            </span>
          </div>
          <h3 className="font-serif text-2xl leading-tight text-bark dark:text-linen">
            {certificate.title}
          </h3>
          <p className="mt-2 text-sm font-bold text-walnut/70 dark:text-stone">
            {certificate.issuer}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-forest transition group-hover:text-ember dark:text-sage">
            View certificate <ExternalLink size={14} />
          </span>
        </a>
      </div>
    </FadeUp>
  );
}

function CertificatePreviewPopover({ preview }: { preview: CertificatePreview }) {
  return (
    <div
      aria-hidden="true"
      data-cert-preview="popover"
      className="pointer-events-none fixed z-50 hidden rounded-[18px] border border-walnut/14 bg-linen p-2 opacity-100 shadow-earthy transition-opacity duration-150 dark:border-white/14 dark:bg-bark md:block"
      style={{
        left: preview.left,
        top: preview.top,
        width: preview.width
      }}
    >
      <div
        className="overflow-hidden rounded-[12px] bg-white"
        style={{ aspectRatio: preview.certificate.previewAspectRatio }}
      >
        <img
          src={preview.certificate.previewImageUrl}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-20 md:py-24">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Questions before registering?"
            copy="Registration happens through the Google Form. You can also reach out on Instagram or email if you want to confirm whether an offering is right for you."
          />
          <FadeUp className="flex flex-col gap-3 sm:flex-row">
            <RegisterButton href={registrationFormUrl} label="Register" />
            <a href="https://instagram.com/yourhandle" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-walnut/18 bg-linen/54 px-5 text-sm font-bold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:bg-stone/45 dark:border-white/10 dark:bg-white/5 dark:text-linen">
              <Instagram size={17} /> Instagram
            </a>
            <a href="mailto:hello@yinforyoga.com" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-walnut/18 bg-linen/54 px-5 text-sm font-bold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:bg-stone/45 dark:border-white/10 dark:bg-white/5 dark:text-linen">
              <Mail size={17} /> Email
            </a>
          </FadeUp>
        </div>
        <FadeUp delay={0.08}>
          <div className="wood-panel rounded-[28px] p-6 text-linen md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-stone">
              Google Form handles
            </p>
            <div className="mt-6 grid gap-4">
              {[
                "Participant details",
                "Payment QR and transaction reference",
                "Health or injury information",
                "Email confirmation after payment"
              ].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 border-b border-linen/14 pb-4">
                  <span className="font-serif text-2xl leading-tight">{item}</span>
                  <ExternalLink className="shrink-0 text-ember" size={17} />
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bark px-4 py-10 text-linen">
      <div className="section-shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl">Yin for Yoga</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-linen/62">
            Online yoga workshops and theme-based classes with simple Google Form registration.
          </p>
        </div>
        <a href={registrationFormUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-extrabold text-linen/80 transition hover:text-ember">
          Register <MoveRight size={16} />
        </a>
      </div>
    </footer>
  );
}
