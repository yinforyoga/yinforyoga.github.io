"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Mail,
  MoveRight,
} from "lucide-react";
import {
  certificates,
  type Offering,
  type OfferingLocalTime,
  type OfferingSchedule,
  type OfferingScheduleItem,
  type OfferingWeekday,
  offerings,
  registrationFormUrl,
  testimonials,
} from "@/lib/data";
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

const siteMode = process.env.NEXT_PUBLIC_SITE_MODE ?? "auto";
const shouldShowConstructionPage =
  siteMode === "construction" ||
  (siteMode !== "full" && process.env.NODE_ENV === "production");

function getPreviewRatio(certificate: Pick<Certificate, "previewAspectRatio">) {
  const [width, height] = certificate.previewAspectRatio
    .split("/")
    .map((value) => Number(value.trim()));

  return width / height;
}

function getPreviewPlacement(certificate: Certificate, x: number, y: number) {
  const ratio = getPreviewRatio(certificate);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 12;
  const padding = 16;
  const width = Math.min(
    416,
    viewportWidth * 0.42,
    (viewportHeight - padding * 2) * ratio,
  );
  const height = width / ratio;
  const hasRoomRight = x + gap + width <= viewportWidth - padding;
  const hasRoomBelow = y + gap + height <= viewportHeight - padding;
  const preferredLeft = hasRoomRight ? x + gap : x - gap - width;
  const preferredTop = hasRoomBelow ? y + gap : y - gap - height;

  return {
    left: Math.max(
      padding,
      Math.min(preferredLeft, viewportWidth - width - padding),
    ),
    top: Math.max(
      padding,
      Math.min(preferredTop, viewportHeight - height - padding),
    ),
    width,
  };
}

export default function Home() {
  if (shouldShowConstructionPage) {
    return <ConstructionPage />;
  }

  return (
    <ThemeProvider>
      <Navbar />
      <main className="relative overflow-hidden">
        <Offerings />
        <Testimonials />
        <Certificates />
        <Contact />
      </main>
    </ThemeProvider>
  );
}

function ConstructionPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-3xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-ember">
          Yin for Yoga
        </p>
        <h1 className="mt-5 text-balance font-serif text-5xl font-medium leading-none text-bark dark:text-linen md:text-7xl">
          Website is taking shape.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[color:var(--muted)] md:text-lg">
          The full site is being prepared with current classes, workshops, and
          registration details. Until then, you can reach out directly for
          updates.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:yinforyoga@gmail.com"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember"
          >
            <Mail size={17} /> Email
          </a>
          <a
            href="https://instagram.com/yinforyoga"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-walnut/18 bg-linen/54 px-5 text-sm font-bold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:bg-stone/45 dark:border-white/10 dark:bg-white/5 dark:text-linen"
          >
            <Instagram size={17} /> Instagram
          </a>
        </div>
      </section>
    </main>
  );
}

function RegisterButton({
  href,
  label = "Register",
  className = "",
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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[28px] bg-forest px-5 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember ${className}`}
    >
      {label}
      <ArrowRight size={16} />
    </a>
  );
}

function Offerings() {
  return (
    <section
      id="offerings"
      className="relative pb-16 pt-28 md:pb-20 md:pt-32"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,rgba(204,197,185,0.42),rgba(255,252,242,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(25,17,11,0))]" />
      <div className="section-shell">
        <SectionHeading eyebrow="Offerings" />

        <div className="flex flex-wrap gap-5">
          {offerings.map((offering, index) => (
            <OfferingCard
              key={offering.title}
              offering={offering}
              delay={index * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferingCard({
  offering,
  delay,
}: {
  offering: Offering;
  delay: number;
}) {
  const Icon = offering.icon;

  return (
    <FadeUp
      delay={delay}
      className="min-w-0 flex-[1_1_32rem] max-w-2xl"
    >
      <article className="flex min-h-full w-full flex-col rounded-[28px] border border-walnut/10 bg-[color:var(--panel-strong)] p-5 shadow-earthy backdrop-blur dark:border-white/10 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone/48 text-forest dark:bg-white/10 dark:text-linen">
              <Icon size={20} />
            </span>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                {offering.eyebrow}
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start">
                <h2 className="font-serif text-[2rem] font-medium leading-[1.05] text-bark dark:text-linen sm:text-3xl sm:leading-tight">
                  {offering.title}
                </h2>
                <OfferingModeBadge mode={offering.mode} />
              </div>
            </div>
          </div>
          <RegisterButton
            href={offering.formUrl}
            label="Register"
            className="w-full shrink-0 sm:w-auto"
          />
        </div>

        <p className="mt-5 text-base font-bold text-bark dark:text-linen">
          {offering.theme}
        </p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          {offering.description}
        </p>

        <div className="mt-6 text-sm">
          <ScheduleInfo schedule={offering.schedule} />
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <OfferingListInfo title="Details" items={offering.details} />
          <OfferingListInfo title="Best for" items={offering.bestFor} />
        </div>
      </article>
    </FadeUp>
  );
}

function OfferingListInfo({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-walnut/68 dark:text-stone">
        {title}
      </p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-6 text-[color:var(--muted)]"
          >
            <CheckCircle2 className="mt-1 shrink-0 text-ember" size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfferingModeBadge({ mode }: { mode: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-forest/8 px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-forest dark:border-linen/15 dark:bg-linen/8 dark:text-linen">
      <span className="h-1.5 w-1.5 rounded-full bg-ember" />
      {mode}
    </span>
  );
}

function ScheduleInfo({ schedule }: { schedule: OfferingSchedule }) {
  const [browserTimeZone, setBrowserTimeZone] = useState<string | null>(null);

  useEffect(() => {
    setBrowserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const displayTimeZone =
    browserTimeZone && browserTimeZone !== schedule.timezone.id
      ? browserTimeZone
      : null;

  return (
    <div className="rounded-2xl border border-ember/20 p-4 sm:p-5 dark:border-ember/30">
      <div>
        <div className="flex items-center justify-center gap-2 text-ember">
          <CalendarDays aria-hidden="true" size={17} strokeWidth={2.25} />
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em]">
            Schedule
          </p>
        </div>
        <p className="mt-2 whitespace-nowrap text-center font-serif text-lg font-medium text-bark dark:text-linen sm:text-xl">
          <FormattedScheduleTime schedule={schedule} timeZone={displayTimeZone} />
        </p>
      </div>
      <ul className="mx-auto mt-5 grid max-w-md gap-3">
        {schedule.split.map((item) => (
          <li
            key={`${item.days.join("-")}-${item.classType}`}
            className="grid content-start justify-items-center gap-3 rounded-xl bg-stone/25 p-3.5 text-center dark:bg-white/[0.05]"
          >
            <p className="text-sm font-extrabold leading-5 text-bark dark:text-linen">
              {item.classType}
              {item.optional ? (
                <span className="font-medium text-[color:var(--muted)]">
                  {" "}
                  (optional)
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {getScheduleItemDays(item, schedule, displayTimeZone).map(
                (day) => (
                  <span
                    key={day}
                    className="min-w-10 rounded-full border border-forest/10 bg-[color:var(--panel-strong)] px-2.5 py-1.5 text-center text-[0.68rem] font-extrabold leading-none text-forest shadow-sm dark:border-white/10 dark:text-linen"
                  >
                    {day}
                  </span>
                ),
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormattedScheduleTime({
  schedule,
  timeZone,
}: {
  schedule: OfferingSchedule;
  timeZone: string | null;
}) {
  const start = timeZone
    ? getDateTimeClockParts(
        getScheduleDate(schedule.startTime, schedule, "Mon"),
        timeZone,
      )
    : formatScheduleClockParts(schedule.startTime);
  const end = timeZone
    ? getDateTimeClockParts(
        getScheduleDate(schedule.endTime, schedule, "Mon"),
        timeZone,
      )
    : formatScheduleClockParts(schedule.endTime);

  return (
    <>
      <FormattedClock clock={start.clock} meridiem={start.meridiem} /> -{" "}
      <FormattedClock clock={end.clock} meridiem={end.meridiem} />
    </>
  );
}

function FormattedClock({
  clock,
  meridiem,
}: {
  clock: string;
  meridiem: string;
}) {
  return (
    <>
      <strong className="font-bold">{clock}</strong> {meridiem}
    </>
  );
}

function getConvertedScheduleItemDays(
  item: OfferingScheduleItem,
  schedule: OfferingSchedule,
  timeZone: string,
) {
  const convertedDays = item.days.map((day) =>
    formatDateTimeWeekday(
      getScheduleDate(schedule.startTime, schedule, day),
      timeZone,
    ),
  );

  return uniqueValues(convertedDays);
}

function formatScheduleClockParts(time: OfferingLocalTime) {
  const minuteLabel =
    time.minute === undefined
      ? ":00"
      : `:${String(time.minute).padStart(2, "0")}`;

  return {
    clock: `${time.hour}${minuteLabel}`,
    meridiem: time.meridiem,
  };
}

function getScheduleItemDays(
  item: OfferingScheduleItem,
  schedule: OfferingSchedule,
  timeZone: string | null,
) {
  return timeZone
    ? getConvertedScheduleItemDays(item, schedule, timeZone)
    : item.days;
}

const scheduleWeekdayIndex: Record<OfferingWeekday, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const intlWeekdayIndex: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function getScheduleDate(
  time: OfferingLocalTime,
  schedule: OfferingSchedule,
  weekday: OfferingWeekday,
) {
  const sourceWeek = getCurrentSourceWeek(schedule);
  const hour24 = toHour24(time);
  const minute = time.minute ?? 0;
  const sourceDay = sourceWeek.mondayDate + scheduleWeekdayIndex[weekday];
  const sourceLocalUtc = Date.UTC(
    sourceWeek.year,
    sourceWeek.month,
    sourceDay,
    hour24,
    minute,
  );

  return new Date(
    sourceLocalUtc - schedule.timezone.utcOffsetMinutes * 60 * 1000,
  );
}

function getCurrentSourceWeek(schedule: OfferingSchedule) {
  const sourceParts = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "numeric",
    timeZone: schedule.timezone.id,
    weekday: "short",
    year: "numeric",
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    sourceParts.find((part) => part.type === type)?.value ?? "";
  const weekday = getPart("weekday");
  const day = Number(getPart("day"));

  return {
    day,
    mondayDate: day - intlWeekdayIndex[weekday],
    month: Number(getPart("month")) - 1,
    year: Number(getPart("year")),
  };
}

function toHour24(time: OfferingLocalTime) {
  if (time.meridiem === "am") {
    return time.hour === 12 ? 0 : time.hour;
  }

  return time.hour === 12 ? 12 : time.hour + 12;
}

function getDateTimeClockParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    clock: `${getPart("hour")}:${getPart("minute")}`,
    meridiem: getPart("dayPeriod").toLowerCase(),
  };
}

function formatDateTimeWeekday(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    timeZone,
  }).format(date);
}

function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-stone/36 py-20 dark:bg-bark md:py-24"
    >
      <div className="section-shell">
        <SectionHeading eyebrow="Testimonials" />
        <div className="testimonial-chat">
          {testimonials.map((testimonial, index) => (
            <FadeUp
              key={`${testimonial.name}-${index}`}
              delay={index * 0.06}
              className="testimonial-message"
            >
              <article className="whatsapp-bubble text-bark dark:text-linen">
                  <p className="whatsapp-sender">~ {testimonial.name}</p>
                  <p className="whitespace-pre-line text-[0.98rem] leading-7">
                    {testimonial.quote}
                  </p>
                  {testimonial.date ? (
                    <div className="mt-2 flex items-center justify-end text-[0.68rem] text-bark/48 dark:text-stone/55">
                      <span>{testimonial.date}</span>
                    </div>
                  ) : null}
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certificates() {
  const [preview, setPreview] = useState<CertificatePreview | null>(null);

  const showPreview = (certificate: Certificate, x: number, y: number) => {
    setPreview({
      certificate,
      ...getPreviewPlacement(certificate, x, y),
    });
  };

  return (
    <section
      id="certificates"
      className="bg-stone/24 py-20 dark:bg-white/[0.03] md:py-24"
    >
      <div className="section-shell">
        <SectionHeading eyebrow="My Certifications" />
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

      {preview ? <CertificatePreviewPopover preview={preview} /> : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      >
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
  onPreviewEnd,
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
    <FadeUp delay={delay} className="h-full">
      <div
        className="group relative h-full"
        onMouseEnter={(event) =>
          onPreview(certificate, event.clientX, event.clientY)
        }
        onMouseMove={(event) =>
          onPreview(certificate, event.clientX, event.clientY)
        }
        onMouseLeave={onPreviewEnd}
        onFocusCapture={handleFocus}
        onBlurCapture={onPreviewEnd}
      >
        <a
          href={certificate.fileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${certificate.title} certificate in a new tab`}
          className={`flex h-full flex-col rounded-[24px] border bg-linen/78 p-5 shadow-innerGlow outline-none transition hover:-translate-y-1 hover:border-ember/40 hover:shadow-earthy focus-visible:-translate-y-1 focus-visible:border-ember focus-visible:ring-4 focus-visible:ring-ember/18 dark:bg-white/5 ${
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
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-forest transition group-hover:text-ember dark:text-sage">
            View certificate <ExternalLink size={14} />
          </span>
        </a>
      </div>
    </FadeUp>
  );
}

function CertificatePreviewPopover({
  preview,
}: {
  preview: CertificatePreview;
}) {
  return (
    <div
      aria-hidden="true"
      data-cert-preview="popover"
      className="pointer-events-none fixed z-50 hidden rounded-[18px] border border-walnut/14 bg-linen p-2 opacity-100 shadow-earthy transition-opacity duration-150 dark:border-white/14 dark:bg-bark md:block"
      style={{
        left: preview.left,
        top: preview.top,
        width: preview.width,
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
      <div className="section-shell">
        <SectionHeading eyebrow="Contact" />
        <FadeUp className="-mt-3">
          <p className="max-w-xl text-base leading-8 text-[color:var(--muted)]">
            Questions about classes or training? Get in touch.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://instagram.com/yinforyoga"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember"
            >
              <Instagram size={17} /> Instagram
            </a>
            <a
              href="mailto:yinforyoga@gmail.com"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-walnut/18 bg-linen/54 px-5 text-sm font-bold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:bg-stone/45 dark:border-white/10 dark:bg-white/5 dark:text-linen"
            >
              <Mail size={17} /> Email
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bark py-10 text-linen">
      <div className="section-shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl">Yin for Yoga</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-linen/62">
            Online yoga workshops and theme-based classes with simple Google
            Form registration.
          </p>
        </div>
        <a
          href={registrationFormUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-linen/80 transition hover:text-ember"
        >
          Register <MoveRight size={16} />
        </a>
      </div>
    </footer>
  );
}
