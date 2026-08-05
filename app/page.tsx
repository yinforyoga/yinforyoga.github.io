"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "@icons-pack/react-simple-icons";
import {
  certificates,
  type DurationDiscounts,
  type Offering,
  type OfferingAddOn,
  type OfferingLocalTime,
  type OfferingPrice,
  type OfferingSchedule,
  type OfferingScheduleItem,
  type OfferingWeekday,
  offerings,
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

        {/* `items-start` so an open drawer grows only its own card — with the
            default stretch, opening one card would resize its row neighbour. */}
        <div className="flex flex-wrap items-start gap-5">
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

type OfferingDrawerTab = "pricing" | "schedule" | "details" | "bestFor";

const offeringDrawerTabs: { id: OfferingDrawerTab; label: string }[] = [
  { id: "pricing", label: "Pricing" },
  { id: "schedule", label: "Schedule" },
  { id: "details", label: "Details" },
  { id: "bestFor", label: "Best for" },
];

function OfferingCard({
  offering,
  delay,
}: {
  offering: Offering;
  delay: number;
}) {
  const Icon = offering.icon;
  const panelId = `${slugify(offering.title)}-drawer`;
  const [openTab, setOpenTab] = useState<OfferingDrawerTab | null>(null);
  // `renderedTab` lags `openTab` on the way closed: the drawer collapses to an
  // explicit height of 0, which only animates while there is still content to
  // collapse away from. Unmounting on the click drops the height instantly.
  const [renderedTab, setRenderedTab] = useState<OfferingDrawerTab | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // The drawer animates a measured pixel height rather than `grid-template-rows`
  // 0fr → 1fr, because 1fr resolves to whatever the content happens to be: the
  // resolved value never changes when one tab's content replaces another's, so
  // switching tabs would resize the card in a single frame.
  // Re-measure before paint whenever the panel's content changes, so opening a
  // tab transitions straight to the new content's height. A ResizeObserver
  // alone reports one frame late, which would animate towards the previous
  // tab's height first.
  useLayoutEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.offsetHeight);
  }, [renderedTab]);

  // Content can also resize while a tab is open — the pricing panel grows when
  // the add-on is toggled, and any panel reflows when the viewport changes.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() =>
      setContentHeight(content.offsetHeight),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const toggleTab = (id: OfferingDrawerTab) => {
    setOpenTab(openTab === id ? null : id);
    if (openTab !== id) setRenderedTab(id);
  };

  return (
    <FadeUp
      delay={delay}
      className="min-w-0 flex-[1_1_32rem] max-w-2xl"
    >
      {/* The card is two stacked layers: a solid front face carrying only the
          offering's identity, and a drawer behind it whose bottom edge peeks
          out as a tab strip. Everything a customer has to read rather than
          recognise lives in the drawer, one tab at a time. */}
      {/* Dark mode drops the two-tone split: the warm drawer tint reads as
          grime rather than depth against the dark palette, so the whole card is
          one surface. The front face goes fully transparent rather than
          matching the colour — `--panel-strong` is translucent, so painting it
          twice would composite the face darker than the drawer and leave the
          seam this is meant to remove. Its border and shadow go too; the tab
          strip's ember underline carries the state on its own. */}
      <article className="w-full rounded-[28px] border border-walnut/10 bg-sand/70 shadow-earthy dark:border-white/10 dark:bg-[color:var(--panel-strong)]">
        <div className="relative z-10 flex flex-col rounded-[28px] border border-walnut/10 bg-[color:var(--panel-strong)] p-5 shadow-soft backdrop-blur dark:border-transparent dark:bg-transparent dark:shadow-none dark:backdrop-blur-none sm:p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:flex-row sm:items-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone/50 text-forest dark:bg-white/10 dark:text-linen">
                <Icon size={20} />
              </span>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                  {offering.eyebrow}
                </p>
                <div className="mt-1 flex flex-col items-center gap-2 sm:items-start">
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

          {offering.equipment?.length ? (
            <EquipmentInfo items={offering.equipment} />
          ) : null}
        </div>

        <OfferingDrawerTabs
          label={`${offering.title} details`}
          openTab={openTab}
          panelId={panelId}
          onToggle={toggleTab}
        />

        <div
          id={panelId}
          inert={openTab === null}
          className="overflow-hidden transition-[height] duration-300 ease-out"
          style={{ height: openTab ? contentHeight : 0 }}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "height" &&
              openTab === null
            ) {
              setRenderedTab(null);
            }
          }}
        >
          <div ref={contentRef} className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
            {renderedTab === "pricing" ? (
              <PricingInfo
                price={offering.price}
                durationDiscounts={offering.durationDiscounts}
                addOn={offering.addOn}
              />
            ) : null}
            {renderedTab === "schedule" ? (
              <ScheduleInfo schedule={offering.schedule} />
            ) : null}
            {renderedTab === "details" ? (
              <OfferingListInfo items={offering.details} />
            ) : null}
            {renderedTab === "bestFor" ? (
              <OfferingListInfo items={offering.bestFor} />
            ) : null}
          </div>
        </div>
      </article>
    </FadeUp>
  );
}

function OfferingDrawerTabs({
  label,
  openTab,
  panelId,
  onToggle,
}: {
  label: string;
  openTab: OfferingDrawerTab | null;
  panelId: string;
  onToggle: (id: OfferingDrawerTab) => void;
}) {
  const underlineRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Whether the underline was already visible last render. Sliding only reads
  // as motion between two open tabs; arriving from the closed state has no
  // meaningful origin to travel from, so it is placed without animating.
  const wasOpenRef = useRef(false);

  useLayoutEffect(() => {
    const moveUnderline = (animate: boolean) => {
      const underline = underlineRef.current;
      const index = offeringDrawerTabs.findIndex((tab) => tab.id === openTab);
      const button = buttonRefs.current[index];
      // No open tab: leave the underline parked where it is and let it fade,
      // so closing a drawer doesn't send it sliding off somewhere arbitrary.
      if (!underline || !button) return;

      if (!animate) underline.style.transition = "none";
      underline.style.transform = `translate3d(${button.offsetLeft + button.offsetWidth / 2 - underline.offsetWidth / 2
        }px, 0, 0)`;
      if (!animate) {
        void underline.offsetWidth;
        underline.style.transition = "";
      }
    };

    moveUnderline(wasOpenRef.current);
    wasOpenRef.current = openTab !== null;

    const handleResize = () => moveUnderline(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [openTab]);

  return (
    <div className="relative flex" role="group" aria-label={label}>
      <span
        ref={underlineRef}
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-3 left-0 h-0.5 w-5 rounded-full bg-ember transition-[transform,opacity] duration-200 ease-out will-change-transform ${openTab ? "opacity-100" : "opacity-0"
          }`}
      />
      {offeringDrawerTabs.map(({ id, label: tabLabel }, index) => (
        <button
          key={id}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={openTab === id}
          aria-controls={panelId}
          className={`flex-1 rounded-b-2xl px-1 pb-5 pt-3.5 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-forest/10 sm:text-[0.68rem] sm:tracking-[0.16em] ${openTab === id
            ? "text-ember"
            : "text-walnut/68 hover:text-bark dark:text-stone dark:hover:text-linen"
            }`}
        >
          {tabLabel}
        </button>
      ))}
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatTotal(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Total price for `duration` months at a monthly rate of `amount`, discounted
// per a duration-discount table. Mirrors the 1-month passthrough + rounded
// discount behavior the pricing card has always used, factored out so the
// base price and an optional add-on's price can be computed and then summed.
function getDiscountedTotal(
  amount: number,
  duration: 1 | 2 | 3,
  discount: number,
) {
  if (duration === 1) return amount;
  return Math.round(amount * duration * (1 - discount));
}

// A price as a min/max pair, so fixed and range pricing share one code path
// instead of the panel branching on `price.type` at every step.
type PriceRange = { min: number; max: number; currency: string };

function getRegionalRange(price: OfferingPrice, region: string): PriceRange {
  if (price.type === "fixed") {
    const regional = price.regions[region] ?? price.regions.IN;
    return {
      min: regional.amount,
      max: regional.amount,
      currency: regional.currency,
    };
  }

  const regional = price.regions[region] ?? price.regions.IN;
  return { min: regional.min, max: regional.max, currency: regional.currency };
}

function formatRange({ min, max, currency }: PriceRange) {
  return min === max
    ? formatTotal(min, currency)
    : `${formatTotal(min, currency)} – ${formatTotal(max, currency)}`;
}

const planDurations: (1 | 2 | 3)[] = [1, 2, 3];

type PricingPlan = {
  duration: 1 | 2 | 3;
  total: string;
  extrapolated?: string;
  // Absent at 1 month, where the per-month rate is just the total restated.
  perMonth?: string;
  savedPercent: number;
};

function PricingInfo({
  price,
  durationDiscounts,
  addOn,
}: {
  price: OfferingPrice;
  durationDiscounts: DurationDiscounts;
  addOn?: OfferingAddOn;
}) {
  const [region, setRegion] = useState("IN");
  const [includeAddOn, setIncludeAddOn] = useState(false);

  useEffect(() => {
    const locale = new Intl.Locale(navigator.language);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRegion(getRegionFromTimeZone(timeZone) ?? locale.region ?? "IN");
  }, []);

  const base = getRegionalRange(price, region);
  const addOnPrice = addOn ? getRegionalRange(addOn.price, region) : undefined;
  const withAddOn = Boolean(addOn && addOnPrice && includeAddOn);

  const plans: PricingPlan[] = planDurations.map((duration) => {
    const discount = durationDiscounts[duration];
    const addOnDiscount = addOn?.durationDiscounts[duration] ?? 0;
    const sum = (pick: "min" | "max") =>
      getDiscountedTotal(base[pick], duration, discount) +
      (withAddOn && addOnPrice
        ? getDiscountedTotal(addOnPrice[pick], duration, addOnDiscount)
        : 0);
    const undiscounted = (pick: "min" | "max") =>
      base[pick] * duration +
      (withAddOn && addOnPrice ? addOnPrice[pick] * duration : 0);

    const actual = { min: sum("min"), max: sum("max"), currency: base.currency };
    const full = {
      min: undiscounted("min"),
      max: undiscounted("max"),
      currency: base.currency,
    };
    const isDiscounted = actual.min < full.min;

    return {
      duration,
      total: formatRange(actual),
      extrapolated: isDiscounted ? formatRange(full) : undefined,
      perMonth:
        duration === 1
          ? undefined
          : formatRange({
            min: actual.min / duration,
            max: actual.max / duration,
            currency: base.currency,
          }),
      savedPercent: isDiscounted
        ? Math.round((1 - actual.min / full.min) * 100)
        : 0,
    };
  });

  // Whichever commitment actually saves the most, rather than assuming it is
  // always the longest — the discount table is per-offering editable data.
  const bestPercent = Math.max(...plans.map((plan) => plan.savedPercent));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {plans.map((plan) => (
          <PricingPlanCard
            key={plan.duration}
            plan={plan}
            isBest={plan.savedPercent > 0 && plan.savedPercent === bestPercent}
          />
        ))}
      </div>
      {addOn && addOnPrice ? (
        <AddOnToggle
          label={addOn.label}
          priceLabel={formatRange(addOnPrice)}
          checked={includeAddOn}
          onChange={setIncludeAddOn}
        />
      ) : null}
    </div>
  );
}

function PricingPlanCard({
  plan,
  isBest,
}: {
  plan: PricingPlan;
  isBest: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3.5 text-center transition-colors sm:px-3 ${isBest
        ? "border-ember/35 bg-ember/[0.06] dark:border-ember/40"
        : "border-forest/12 bg-[color:var(--panel)] dark:border-white/10 dark:bg-white/[0.04]"
        }`}
    >
      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-walnut/68 dark:text-stone">
        {plan.duration} {plan.duration === 1 ? "month" : "months"}
      </p>
      {/* The line box is reserved whether or not this plan is discounted, so
          all three cards keep their baselines aligned and the row never jumps
          as the add-on is toggled. `price-strike` itself only goes on real
          text — its strike is an absolutely positioned pseudo-element, which
          on an empty span would draw a stray dash. */}
      <span className="block h-4 font-sans text-[0.7rem] font-medium leading-4 text-[color:var(--muted)]">
        {plan.extrapolated ? (
          <span className="price-strike">{plan.extrapolated}</span>
        ) : null}
      </span>
      <p className="font-sans text-base font-semibold leading-tight text-bark dark:text-linen sm:text-lg">
        {plan.total}
      </p>
      {plan.perMonth ? (
        <p className="font-serif text-[0.72rem] italic leading-tight text-[color:var(--muted)]">
          {plan.perMonth}/mo
        </p>
      ) : null}
      {plan.savedPercent > 0 ? (
        <span
          className={`mt-0.5 rounded-full px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.1em] ${isBest
            ? "bg-ember text-linen"
            : "bg-forest/10 text-forest dark:bg-linen/10 dark:text-linen"
            }`}
        >
          Save {plan.savedPercent}%
        </span>
      ) : null}
    </div>
  );
}

function AddOnToggle({
  label,
  priceLabel,
  checked,
  onChange,
}: {
  label: string;
  priceLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${checked
        ? "border-forest/30 bg-forest/[0.07] dark:border-linen/25 dark:bg-linen/[0.08]"
        : "border-forest/12 bg-[color:var(--panel)] hover:border-forest/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
        }`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-bark dark:text-linen">
          Add {label}
        </span>
        <span className="block text-xs text-[color:var(--muted)]">
          {priceLabel}/mo, billed with the plan
        </span>
      </span>
      {/* A switch rather than the old floating price tag: the add-on changes
          all three totals at once, so it reads as a setting for the whole
          panel instead of an annotation on one number. */}
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-forest/20 ${checked ? "bg-forest dark:bg-linen" : "bg-walnut/25 dark:bg-white/20"
          }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-linen shadow-sm transition-transform duration-200 ease-out dark:bg-bark ${checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
            }`}
        />
      </span>
    </label>
  );
}

function getRegionFromTimeZone(timeZone: string) {
  const timeZoneRegions: Record<string, string> = {
    "Asia/Kolkata": "IN",
    "Asia/Calcutta": "IN",
    "Asia/Dubai": "AE",
    "Asia/Singapore": "SG",
    "Asia/Tokyo": "JP",
    "Europe/London": "GB",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Brisbane": "AU",
    "Pacific/Auckland": "NZ",
  };

  return timeZoneRegions[timeZone];
}

function EquipmentInfo({
  items,
}: {
  items: { label: string; icon: LucideIcon }[];
}) {
  // Unlabelled on purpose: the icons read as "kit you'll need" at a glance,
  // and each one names itself on hover/focus rather than spending a row of the
  // front face on a heading.
  return (
    <ul
      aria-label="Equipment"
      className="mt-6 flex flex-wrap justify-center gap-3 sm:ml-auto sm:mr-0 sm:justify-end"
    >
      {items.map(({ label, icon: Icon }) => (
        <li key={label} className="group relative">
          <span
            tabIndex={0}
            aria-label={label}
            className="grid h-11 w-11 cursor-help place-items-center rounded-full border border-forest/10 bg-stone/40 text-forest outline-none transition duration-200 hover:-translate-y-0.5 hover:border-ember/30 hover:bg-[color:var(--panel-strong)] hover:text-ember hover:shadow-soft focus-visible:-translate-y-0.5 focus-visible:border-ember/40 focus-visible:text-ember focus-visible:ring-4 focus-visible:ring-forest/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-linen dark:hover:border-ember/40 dark:hover:text-ember dark:focus-visible:text-ember"
          >
            <Icon aria-hidden="true" size={19} strokeWidth={2} />
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%+0.65rem)] left-1/2 z-20 w-max max-w-48 -translate-x-1/2 translate-y-1 rounded-xl bg-forest px-3 py-2 text-center text-xs font-bold leading-5 text-linen opacity-0 shadow-earthy transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:bg-linen dark:text-forest"
          >
            {label}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-forest dark:bg-linen" />
          </span>
        </li>
      ))}
    </ul>
  );
}

// The drawer tab supplies the heading, so the list carries no title of its own.
function OfferingListInfo({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-6">
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
    <ul className="mx-auto flex max-w-md flex-wrap justify-center gap-3 text-sm">
        {schedule.split.map((item) => (
          <li
            key={`${item.days.join("-")}-${item.classType}`}
            className="grid flex-1 basis-0 content-start justify-items-center gap-3 rounded-xl bg-[color:var(--panel-strong)] p-3.5 text-center dark:bg-white/[0.06]"
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
            <p className="whitespace-nowrap font-serif text-sm font-medium text-bark dark:text-linen">
              <FormattedItemTime
                item={item}
                schedule={schedule}
                timeZone={displayTimeZone}
              />
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {getScheduleItemDays(item, schedule, displayTimeZone).map(
                (day) => (
                  <span
                    key={day}
                    className="min-w-10 rounded-full border border-forest/10 bg-stone/50 px-2.5 py-1.5 text-center text-[0.68rem] font-extrabold leading-none text-forest dark:border-white/10 dark:bg-white/10 dark:text-linen"
                  >
                    {day}
                  </span>
                ),
              )}
            </div>
          </li>
        ))}
    </ul>
  );
}

function FormattedItemTime({
  item,
  schedule,
  timeZone,
}: {
  item: OfferingScheduleItem;
  schedule: OfferingSchedule;
  timeZone: string | null;
}) {
  const anchorDay = item.days[0];
  const start = timeZone
    ? getDateTimeClockParts(
      getScheduleDate(item.startTime, schedule, anchorDay),
      timeZone,
    )
    : formatScheduleClockParts(item.startTime);
  const end = timeZone
    ? getDateTimeClockParts(
      getScheduleDate(item.endTime, schedule, anchorDay),
      timeZone,
    )
    : formatScheduleClockParts(item.endTime);

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
      getScheduleDate(item.startTime, schedule, day),
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
  // Light mode banks sections with a stone tint. Dark mode deliberately has no
  // section background at all: any flat tint, however subtle, meets its
  // neighbour at a hard horizontal edge. The body's own gradient is left to run
  // the full height of the page uninterrupted instead.
  return (
    <section
      id="testimonials"
      className="bg-stone/36 py-20 md:py-24"
    >
      <div className="section-shell">
        <SectionHeading eyebrow="Testimonials" />
        <div className="testimonial-wrap">
          {testimonials.map((testimonial, index) => (
            <FadeUp
              key={`${testimonial.name}-${index}`}
              delay={index * 0.06}
              className="testimonial-frame-wrap"
            >
              <article className="testimonial-frame text-bark dark:text-linen">
                <div className="testimonial-details">
                  <span>
                    <BookOpen aria-hidden="true" size={14} />
                    {testimonial.course}
                  </span>
                  <span>
                    <MapPin aria-hidden="true" size={14} />
                    {testimonial.location ?? "Location not provided"}
                  </span>
                  <span>
                    <CalendarDays aria-hidden="true" size={14} />
                    {testimonial.date ?? "Date not provided"}
                  </span>
                </div>
                <div className="whatsapp-bubble">
                  <p className="whatsapp-sender">~ {testimonial.name}</p>
                  <p className="whitespace-pre-line text-[0.98rem] leading-7">
                    {testimonial.quote}
                  </p>
                  {testimonial.time ? (
                    <p className="mt-2 text-right text-[0.68rem] text-bark/48 dark:text-stone/55">
                      {testimonial.time}
                    </p>
                  ) : null}
                </div>
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
      className="bg-stone/24 py-20 md:py-24"
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
          className={`flex h-full flex-col rounded-[24px] border bg-linen/78 p-5 shadow-innerGlow outline-none transition hover:-translate-y-1 hover:border-ember/40 hover:shadow-earthy focus-visible:-translate-y-1 focus-visible:border-ember focus-visible:ring-4 focus-visible:ring-ember/18 dark:bg-white/5 ${isPreviewed
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
              <SiInstagram size={17} /> Instagram
            </a>
            <a
              href="https://wa.me/918951766013"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#1EBE5A]"
            >
              <SiWhatsapp size={17} /> WhatsApp
            </a>
            <a
              href="mailto:yinforyoga@gmail.com"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-walnut/18 bg-linen/54 px-5 text-sm font-bold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:border-ember hover:text-ember dark:border-white/10 dark:bg-white/5 dark:text-linen dark"
            >
              <Mail size={17} /> Email
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
