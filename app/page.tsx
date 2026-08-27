"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "@icons-pack/react-simple-icons";
import {
  certificates,
  type DurationDiscounts,
  findOffering,
  getTier,
  type Money,
  type Offering,
  type OfferingAddOn,
  type OfferingLocalTime,
  type OfferingFocus,
  type OfferingFormat,
  type OfferingPrice,
  type OfferingSchedule,
  type OfferingScheduleItem,
  type OfferingWeekday,
  offerings,
  resolvePrice,
  testimonials,
} from "@/lib/data";
import { Collapse, FadeUp, MotionSection } from "@/components/MotionPrimitives";
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
  external = true,
  className = "",
}: {
  href: string;
  label?: string;
  /** In-page links (contact) must not open a new tab. */
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[28px] bg-forest px-5 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember ${className}`}
    >
      {label}
      <ArrowRight size={16} />
    </a>
  );
}

function Offerings() {
  const rowRef = useRef<HTMLDivElement>(null);
  const registerFace = useEqualFaceHeights(rowRef);

  return (
    <section
      id="offerings"
      className="relative pb-9 pt-20 md:pb-12 md:pt-24"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,rgba(204,197,185,0.42),rgba(255,252,242,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(25,17,11,0))]" />
      <div className="section-shell">
        <SectionHeading eyebrow="Offerings" />

        <OfferingGuide />

        {/* `items-start` so an open drawer grows only its own card — with the
            default stretch, opening one card would resize its row neighbour. */}
        <div ref={rowRef} className="flex flex-wrap items-start gap-5">
          {offerings.map((offering, index) => (
            <OfferingCard
              key={offering.title}
              offering={offering}
              delay={index * 0.08}
              faceRef={registerFace(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Equal face heights
//
// Two cards side by side are only comparable if their rows line up, and a face
// grows or shrinks with whatever its schedule and equipment happen to need — a
// two-line schedule next to a one-line one leaves the shorter card's front face
// visibly short.
//
// `align-items: stretch` on the row would do it, except a card is a face *and*
// a drawer: stretching the article would make one card's open drawer heighten
// its neighbour. So the faces are equalised on their own, imperatively, leaving
// the drawers to size themselves independently.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * An element's top edge relative to `container`, in layout terms. Summing
 * `offsetTop` up the `offsetParent` chain deliberately ignores transforms,
 * which move a card on screen without moving the row it belongs to.
 */
function getLayoutTop(element: HTMLElement, container: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = element;

  while (node && node !== container) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return top;
}

function useEqualFaceHeights(containerRef: RefObject<HTMLElement | null>) {
  const facesRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const faces = facesRef.current.filter(
        (face): face is HTMLDivElement => face !== null,
      );

      // Clear every face before reading any of them, so what gets measured is
      // each face's natural height rather than the answer from last time — and
      // so the row positions read below are the ones the cleared faces produce.
      faces.forEach((face) => {
        face.style.minHeight = "";
      });

      // Group by the row a face actually landed on — layout positions rather
      // than `getBoundingClientRect`, whose viewport coordinates include the
      // cards' entry animation. That animation is staggered per card, so two
      // faces on one row read as being on different rows for as long as it
      // runs, and whichever measurement landed during it would stick.
      const rows = new Map<number, HTMLDivElement[]>();
      faces.forEach((face) => {
        const top = getLayoutTop(face, container);
        const row = rows.get(top);
        if (row) row.push(face);
        else rows.set(top, [face]);
      });

      // A face alone on its row — every card, once they stack on a narrow
      // viewport — has nothing to line up with, and keeps its own height.
      rows.forEach((row) => {
        if (row.length < 2) return;
        const tallest = Math.max(...row.map((face) => face.offsetHeight));
        row.forEach((face) => {
          face.style.minHeight = `${tallest}px`;
        });
      });
    };

    measure();

    // Measuring once on mount is not enough: layout keeps settling afterwards —
    // stylesheets and webfonts both land after this effect runs and both move a
    // face's height, and until they do the cards may not even have flowed into
    // the row they will end up on. So watch the faces themselves and re-measure
    // whenever any of them actually changes size.
    //
    // Observing what we also write to is safe here because `measure` converges:
    // it clears every face, re-derives the same tallest height, and writes it
    // back, so the box ends the frame at the size the observer last reported and
    // no further callback is queued.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    facesRef.current.forEach((face) => face && observer.observe(face));

    // A viewport change reflows the row without necessarily resizing any single
    // face — two cards wrapping onto separate rows keep their heights.
    window.addEventListener("resize", measure);

    // Webfonts reflow every line of text under them, and unlike the observer
    // this fires without needing a rendered frame — which is what recovers the
    // measurement in dev, where stylesheets are injected by script and the
    // cards have not always flowed into their row by the time this effect runs.
    document.fonts?.ready.then(measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  return (index: number) => (face: HTMLDivElement | null) => {
    facesRef.current[index] = face;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The guide
//
// Two questions, which between them pin an offering to one cell of the 2x2.
// They narrow rather than gate: every offering stays rendered below whatever
// the answers are, so someone who scrolls past, arrives from search, or simply
// ignores the questions still sees everything. Hiding the cards until both were
// answered would cost two clicks before anyone saw a price.
//
// The focus question offers three answers to the axis's two, because "both" is
// not a third quadrant — Group Strength already includes a weekly yoga class,
// so "both" resolves to Strength. That is exactly the thing the bare
// Strength/Yoga labels cannot tell you on their own.
// ─────────────────────────────────────────────────────────────────────────────
const focusOptions: { id: OfferingFocus; label: string }[] = [
  { id: "Strength", label: "Strength training" },
  { id: "Yoga", label: "Yoga" },
];

const formatAnswers: { id: OfferingFormat; label: string }[] = [
  { id: "Group", label: "Group classes" },
  { id: "Personal", label: "Personal classes" },
];

/**
 * Which offerings answer a set of choices.
 *
 * Picking both disciplines is the interesting case, and it has two honest
 * answers depending on the format. Group Strength timetables a yoga class of
 * its own, so it satisfies both on its own and is the only card to show. No
 * one-to-one offering bundles the other discipline, so asking for both there
 * genuinely means both cards — which is why this returns a list rather than a
 * single offering.
 */
function resolveMatches(format: OfferingFormat, focuses: OfferingFocus[]) {
  const inFormat = offerings.filter((offering) => offering.format === format);
  if (focuses.length === 0) return [];
  if (focuses.length === 1) {
    return inFormat.filter((offering) => offering.focus === focuses[0]);
  }

  const coversBoth = inFormat.filter(
    (offering) => describeStrengthWithYoga(offering) !== null,
  );
  return coversBoth.length ? coversBoth : inFormat;
}

function OfferingGuide() {
  const [format, setFormat] = useState<OfferingFormat | null>(null);
  const [focuses, setFocuses] = useState<OfferingFocus[]>([]);

  const toggleFocus = (focus: OfferingFocus) =>
    setFocuses((current) =>
      current.includes(focus)
        ? current.filter((item) => item !== focus)
        : [...current, focus],
    );

  const matches = format ? resolveMatches(format, focuses) : [];

  return (
    <FadeUp className="mb-10">
      <div className="rounded-[28px] border border-forest/12 bg-[color:var(--panel)] p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        {/* One question on the page, and it is the heading — an intro sentence
            above it only said the same thing twice. The disciplines are not a
            second question but part of the answer to this one, so they open
            inside the option they belong to. */}
        <fieldset className="min-w-0">
          <legend className="font-serif text-xl font-medium leading-tight text-bark dark:text-linen">
            What are you looking for?
          </legend>
          <div className="mt-3.5 grid gap-2.5 sm:max-w-2xl">
            {formatAnswers.map((option) => (
              <GuideFormatOption
                key={option.id}
                option={option}
                selected={format === option.id}
                onSelect={() => setFormat(option.id)}
              >
                <GuideFocusPicker values={focuses} onToggle={toggleFocus} />
              </GuideFormatOption>
            ))}
          </div>
        </fieldset>

        {/* Held open — this region always says something. Collapse is here for
            the height, which changes whenever the answer changes or a second
            button appears beside the first. */}
        <Collapse>
          <div
            key={`${format ?? "none"}-${[...focuses].sort().join("+")}`}
            className="guide-swap pt-5"
          >
            <GuideResult format={format} focuses={focuses} matches={matches} />
          </div>
        </Collapse>
      </div>
    </FadeUp>
  );
}

function GuideFormatOption({
  option,
  selected,
  onSelect,
  children,
}: {
  option: { id: OfferingFormat; label: string };
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  // The radio row and the panel it opens are siblings, not nested: a label may
  // not contain the checkboxes, and wrapping them would make every click on a
  // discipline also re-pick the format.
  return (
    <div
      className={`rounded-2xl border transition-colors ${selected
        ? "border-ember/40 bg-ember/[0.07]"
        : "border-forest/12 bg-[color:var(--panel-strong)] hover:border-forest/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
        }`}
    >
      <label className="block cursor-pointer rounded-2xl px-4 py-3 text-sm font-bold text-bark has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest/15 dark:text-linen">
        <input
          type="radio"
          name="offering-format"
          className="sr-only"
          checked={selected}
          onChange={onSelect}
        />
        {option.label}
      </label>
      {/* Always mounted, opened by height. Unmounting on deselect dropped the
          panel in a single frame, and took the closing card's own height with
          it — which is most of what read as the layout jumping. `Collapse`
          marks the closed copy inert, so the hidden checkboxes stay out of the
          tab order. */}
      <Collapse open={selected}>
        <div className="border-t border-ember/25 px-4 pb-4 pt-3.5">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

function GuideFocusPicker({
  values,
  onToggle,
}: {
  values: OfferingFocus[];
  onToggle: (focus: OfferingFocus) => void;
}) {
  // The legend is for screen readers only: on screen these chips sit directly
  // under the option they belong to, and a second visible heading was the thing
  // making the panel feel cramped.
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">What would you like to practise?</legend>
      {focusOptions.map((option) => {
        const checked = values.includes(option.id);

        return (
          <label
            key={option.id}
            className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-bold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest/15 ${checked
              ? "border-transparent bg-forest text-linen dark:bg-linen dark:text-forest"
              : "border-forest/20 text-bark hover:border-forest/40 dark:border-white/20 dark:text-linen"
              }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => onToggle(option.id)}
            />
            {option.label}
          </label>
        );
      })}
    </fieldset>
  );
}

function GuideResult({
  format,
  focuses,
  matches,
}: {
  format: OfferingFormat | null;
  focuses: OfferingFocus[];
  matches: Offering[];
}) {
  const note = (text: string) => (
    <p className="border-t border-forest/10 pt-4 text-sm leading-6 text-[color:var(--muted)] dark:border-white/10">
      {text}
    </p>
  );

  if (!format) {
    return note(
      "Everything on offer is listed below either way — this only points you at the right one.",
    );
  }

  if (matches.length === 0) {
    return note("Now pick what you'd like to practise.");
  }

  return (
    <div className="flex flex-col items-start gap-3 border-t border-forest/10 pt-4 dark:border-white/10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="min-w-0 flex-1 text-sm leading-6 text-[color:var(--muted)]">
        {matches.length === 1 ? (
          <>
            That&rsquo;s{" "}
            <strong className="font-bold text-bark dark:text-linen">
              {matches[0].headline}
            </strong>
            {/* Read off the schedule, so the clause can never claim a weekly
                yoga class for an offering that has no timetable at all. */}
            {focuses.length > 1 ? describeStrengthWithYoga(matches[0]) : null}.
          </>
        ) : (
          <>
            Two of them fit &mdash; one-to-one sessions are booked per
            discipline, so strength and yoga run as separate blocks.
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {matches.map((match) => (
          <GuideResultLink
            key={match.title}
            href={`#${slugify(match.title)}`}
            label={matches.length === 1 ? "Take me there" : match.headline}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * "— strength 3 days a week, with a yoga class alongside", or `null` when the
 * offering does not in fact timetable both. Doubles as the test for whether one
 * offering can answer a request for both disciplines on its own, so the claim
 * and the routing can never disagree.
 */
function describeStrengthWithYoga(offering: Offering) {
  const split = offering.schedule?.split;
  if (!split) return null;

  const strengthDays = split
    .filter((item) => item.classType === "Strength")
    .reduce((total, item) => total + item.days.length, 0);
  const hasYoga = split.some((item) => item.classType === "Yoga");
  if (!strengthDays || !hasYoga) return null;

  return ` — strength ${strengthDays} ${strengthDays === 1 ? "day" : "days"
    } a week, with a yoga class alongside`;
}

function GuideResultLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[24px] bg-forest px-4 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember"
    >
      {label}
      <ArrowRight size={15} />
    </a>
  );
}

type OfferingDrawerTab = "pricing" | "details" | "bestFor";

// No schedule tab: the card face already prints the same days and times, and a
// tab that only restyles what is visible three inches above it costs a click to
// learn nothing.
const offeringDrawerTabs: { id: OfferingDrawerTab; label: string }[] = [
  { id: "pricing", label: "Pricing" },
  { id: "details", label: "Details" },
  { id: "bestFor", label: "Best for" },
];

function OfferingCard({
  offering,
  delay,
  faceRef,
}: {
  offering: Offering;
  delay: number;
  faceRef: (face: HTMLDivElement | null) => void;
}) {
  const Icon = offering.icon;
  const panelId = `${slugify(offering.title)}-drawer`;
  const [openTab, setOpenTab] = useState<OfferingDrawerTab | null>(null);
  // The tab whose panel is mounted, which is the last one opened rather than
  // the one open now. A height animation needs something to collapse away
  // from, so the outgoing panel has to survive the close it is animating —
  // emptying it on the click would leave a bare box shrinking. Nothing has to
  // retire it afterwards: `Collapse` clips it to a zero height and marks it
  // inert, so a closed drawer's content is neither visible nor reachable.
  const [shownTab, setShownTab] = useState<OfferingDrawerTab | null>(null);

  // An offering with no published price has no pricing to show, so it loses the
  // tab rather than offering one that opens onto an apology.
  const tabs = offeringDrawerTabs.filter(
    (tab) => tab.id !== "pricing" || offering.price !== null,
  );

  const toggleTab = (id: OfferingDrawerTab) => {
    setOpenTab(openTab === id ? null : id);
    if (openTab !== id) setShownTab(id);
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
      {/* Both themes raise the face above the drawer by making it the lighter
          of the two surfaces, so the tab strip reads as the recessed layer it
          is. Dark mode gets there with a white wash rather than its own colour:
          `--panel-strong` is translucent, so painting it on both layers would
          composite the face *darker* than the drawer behind it and inverting
          the depth. The wash is what the warm `sand` tint can't do here — that
          tint reads as grime against the dark palette rather than as depth. */}
      {/* The chooser links straight here, and `scroll-mt` keeps the sticky
          navbar off the card's own heading when it does. */}
      <article
        id={slugify(offering.title)}
        className="w-full scroll-mt-28 rounded-[28px] border border-walnut/10 bg-sand/70 shadow-earthy dark:border-white/10 dark:bg-[color:var(--panel-strong)]"
      >
        <div
          ref={faceRef}
          className="relative z-10 flex flex-col rounded-[28px] border border-walnut/10 bg-[color:var(--panel-strong)] p-5 shadow-soft backdrop-blur dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none dark:backdrop-blur-none sm:p-6"
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:flex-row sm:items-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone/50 text-forest dark:bg-white/10 dark:text-linen">
                <Icon size={20} />
              </span>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ember">
                  {offering.eyebrow}
                </p>
                {/* Plain language leads; the brand name follows as a subtitle.
                    "Group Strength Training Classes" tells a stranger what they
                    would be buying, which "Yin for Strength" only does once you
                    already know. */}
                <h2 className="mt-1 font-serif text-[2rem] font-medium leading-[1.05] text-bark dark:text-linen sm:text-3xl sm:leading-tight">
                  {offering.headline}
                </h2>
                <p className="mt-1.5 text-sm font-bold text-[color:var(--muted)]">
                  {offering.title}
                </p>
              </div>
            </div>
            {/* An offering quoted per person has no form to submit — its first
                step is a conversation, so the CTA says that instead of sending
                someone to a page that would ask them to pick a plan. */}
            <RegisterButton
              href={offering.formUrl ?? "#contact"}
              label={offering.formUrl ? "Register" : "Get in touch"}
              external={offering.formUrl !== null}
              className="w-full shrink-0 sm:w-auto"
            />
          </div>

          <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
            {offering.description}
          </p>

          {/* Price and schedule used to live one drawer tab apart, so no visitor
              could see both at once, let alone compare two offerings on them.
              They are the two facts a decision actually turns on, so they sit on
              the face; the tabs below still hold the full breakdown. */}
          <OfferingAtAGlance offering={offering} />

          {/* Whatever height equalisation added lands here, so the equipment
              row stays pinned to the bottom edge of every face in the row
              rather than floating at a different height on each card. The
              spacer collapses to nothing when the face isn't stretched. */}
          <div aria-hidden="true" className="grow" />

          {offering.equipment?.length ? (
            <EquipmentInfo items={offering.equipment} />
          ) : null}
        </div>

        <OfferingDrawerTabs
          label={`${offering.title} details`}
          tabs={tabs}
          openTab={openTab}
          panelId={panelId}
          onToggle={toggleTab}
        />

        {/* The padding sits on a child rather than on `Collapse` itself: the
            collapsing element is the one carrying the height, and padding
            there would hold the drawer open by its own inset when closed. */}
        <Collapse id={panelId} open={openTab !== null}>
          <div className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
            {shownTab === "pricing" && offering.price !== null ? (
              <PricingInfo
                price={offering.price}
                durationDiscounts={offering.durationDiscounts}
                addOn={offering.addOn}
              />
            ) : null}
            {shownTab === "details" ? (
              <OfferingListInfo items={offering.details} />
            ) : null}
            {shownTab === "bestFor" ? (
              <OfferingListInfo items={offering.bestFor} />
            ) : null}
          </div>
        </Collapse>
      </article>
    </FadeUp>
  );
}

function OfferingAtAGlance({ offering }: { offering: Offering }) {
  const region = useRegion();
  const startingInr = getStartingMonthlyInr(offering);
  const startingPrice =
    startingInr === null
      ? null
      : formatMoney(
        resolvePrice(startingInr, { tier: getTier(region), region }),
      );

  // An offering that publishes neither a price nor a timetable has nothing to
  // tabulate. The labelled grid below exists to hold a multi-line schedule
  // beside a figure; handed two "ask me"s it becomes a table of blanks, its
  // wide column empty under one short sentence. So say the same thing as one
  // line instead — the panel keeps the cards rhyming, the content stops
  // pretending to be data.
  if (!startingPrice && !offering.schedule) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-forest/12 bg-[color:var(--panel)] px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
        <OfferingModeBadge mode={offering.mode} />
        <p className="min-w-0 text-sm leading-6 text-[color:var(--muted)]">
          Price and timings arranged with you
        </p>
      </div>
    );
  }

  // How much, when, where — the three questions a visitor weighs one offering
  // against another on. "Where" is where the Online badge earns its place: as a
  // labelled answer among the other two, rather than as decoration under the
  // title with nothing to say what it is answering.
  return (
    <dl className="mt-5 grid gap-3 rounded-2xl border border-forest/12 bg-[color:var(--panel)] p-4 dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[auto_1fr] sm:gap-x-6">
      {/* From and Where share the narrow column because both are a single short
          value; When takes the wide one because a schedule is the only entry
          here that grows. Giving all three their own column squeezed the days
          to one word per line. */}
      <div className="grid content-start gap-3">
        <GlanceField label={startingPrice ? "From" : "Price"}>
          {startingPrice ? (
            <p className="font-sans text-lg font-semibold leading-tight text-bark dark:text-linen">
              {startingPrice}
              <span className="font-serif text-[0.8rem] font-medium italic text-[color:var(--muted)]">
                {" "}
                /mo
              </span>
            </p>
          ) : (
            <p className="font-sans text-base font-semibold leading-tight text-bark dark:text-linen">
              On request
            </p>
          )}
        </GlanceField>
        <GlanceField label="Where">
          <OfferingModeBadge mode={offering.mode} />
        </GlanceField>
      </div>
      <GlanceField label="When" divided>
        {offering.schedule ? (
          <ScheduleSummary schedule={offering.schedule} />
        ) : (
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            Booked with you, session by session
          </p>
        )}
      </GlanceField>
    </dl>
  );
}

function GlanceField({
  label,
  divided = false,
  children,
}: {
  label: string;
  divided?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-w-0 ${divided
        ? "border-t border-forest/10 pt-3 dark:border-white/10 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
        : ""
        }`}
    >
      <dt className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-walnut/68 dark:text-stone">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

// One row per class type — enough to answer "does this fit my week?" without
// opening anything.
//
// The grid lives on the list and every row is `display: contents`, so days,
// times and class types line up in shared columns down the card. Per-row grids
// would each size themselves to their own content, which is what left a
// two-line schedule looking ragged: "Mon, Wed, Fri" and "Thu" pushed their
// times to different depths. Columns replace the separator dots too.
function ScheduleSummary({ schedule }: { schedule: OfferingSchedule }) {
  const displayTimeZone = useDisplayTimeZone(schedule);

  return (
    <ul className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-3 gap-y-1 text-sm leading-6 text-[color:var(--muted)]">
      {schedule.split.map((item) => (
        <li key={`${item.days.join("-")}-${item.classType}`} className="contents">
          <span className="whitespace-nowrap font-bold text-bark dark:text-linen">
            {getScheduleItemDays(item, schedule, displayTimeZone).join(", ")}
          </span>
          <span className="whitespace-nowrap">
            <FormattedItemTime
              item={item}
              schedule={schedule}
              timeZone={displayTimeZone}
            />
          </span>
          <span>
            {item.classType}
            {item.optional ? " (optional)" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OfferingDrawerTabs({
  label,
  tabs,
  openTab,
  panelId,
  onToggle,
}: {
  label: string;
  tabs: { id: OfferingDrawerTab; label: string }[];
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
      const index = tabs.findIndex((tab) => tab.id === openTab);
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
  }, [openTab, tabs]);

  return (
    <div className="relative flex" role="group" aria-label={label}>
      <span
        ref={underlineRef}
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-3 left-0 h-0.5 w-5 rounded-full bg-ember transition-[transform,opacity] duration-200 ease-out will-change-transform ${openTab ? "opacity-100" : "opacity-0"
          }`}
      />
      {tabs.map(({ id, label: tabLabel }, index) => (
        <button
          key={id}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={openTab === id}
          aria-controls={panelId}
          className={`group flex flex-1 items-center justify-center gap-1.5 rounded-b-2xl px-1 pb-5 pt-3.5 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] outline-none transition-colors hover:bg-forest/[0.05] focus-visible:ring-4 focus-visible:ring-forest/10 dark:hover:bg-white/[0.05] sm:text-[0.68rem] sm:tracking-[0.16em] ${openTab === id
            ? "text-ember"
            : "text-walnut/68 hover:text-bark dark:text-stone dark:hover:text-linen"
            }`}
        >
          {tabLabel}
          {/* The strip read as a row of captions rather than controls. A
              chevron per tab says "this opens", and rotating it says which one
              is already open — the ember underline alone only did the latter,
              and only after you had clicked something. */}
          <ChevronDown
            aria-hidden="true"
            size={13}
            strokeWidth={3}
            className={`shrink-0 transition-transform duration-200 ${openTab === id ? "rotate-180" : "group-hover:translate-y-0.5"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// The locale is pinned rather than inherited from the visitor. `undefined`
// here means "whatever the browser is set to", and locales such as mr-IN
// default to Devanagari digits — ₹8,600 rendered as ₹८,६००. Prices are
// authored in rupees for an Indian-format audience, so en-IN gives everyone
// the same Arabic numerals and the same 2-3 digit grouping.
function formatMoney({ amount, currency }: Money) {
  return new Intl.NumberFormat("en-IN", {
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

const planDurations: (1 | 2 | 3)[] = [1, 2, 3];

type PricingPlan = {
  duration: 1 | 2 | 3;
  total: string;
  extrapolated?: string;
  // Absent at 1 month, where the per-month rate is just the total restated.
  perMonth?: string;
  savedPercent: number;
};

// Shared by the pricing panel and the card face, which now both print money:
// two components guessing the visitor's region independently could disagree,
// and a face reading "from $23/mo" above a panel priced in rupees would read as
// a bug rather than as two currencies.
function useRegion() {
  const [region, setRegion] = useState("IN");

  useEffect(() => {
    const locale = new Intl.Locale(navigator.language);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRegion(getRegionFromTimeZone(timeZone) ?? locale.region ?? "IN");
  }, []);

  return region;
}

/**
 * The lowest monthly rate an offering can be had at, across every commitment
 * length. This is the number a visitor comparing two offerings actually wants,
 * and it is deliberately the cheapest rather than the 1-month one: the card
 * says "from", and the pricing tab immediately below shows what it costs to get
 * there.
 */
function getStartingMonthlyInr(offering: Offering) {
  const { price } = offering;
  if (price === null) return null;

  return Math.min(
    ...planDurations.map(
      (duration) =>
        getDiscountedTotal(
          price,
          duration,
          offering.durationDiscounts[duration],
        ) / duration,
    ),
  );
}

function PricingInfo({
  price,
  durationDiscounts,
  addOn,
}: {
  price: OfferingPrice;
  durationDiscounts: DurationDiscounts;
  addOn?: OfferingAddOn;
}) {
  const region = useRegion();
  const [includeAddOn, setIncludeAddOn] = useState(false);

  // All arithmetic — discounts, add-ons, per-month rates — happens in the
  // authored INR, and conversion to the visitor's currency happens only at the
  // moment a number is rendered. Rounding therefore lands once, on the figure
  // actually shown, instead of compounding through every intermediate step.
  const resolve = (inr: number) =>
    resolvePrice(inr, { tier: getTier(region), region });

  const withAddOn = Boolean(addOn && includeAddOn);

  const plans: PricingPlan[] = planDurations.map((duration) => {
    const addOnInr = withAddOn && addOn ? addOn.price : 0;
    const addOnDiscount = addOn?.durationDiscounts[duration] ?? 0;

    const actual = resolve(
      getDiscountedTotal(price, duration, durationDiscounts[duration]) +
      (addOnInr ? getDiscountedTotal(addOnInr, duration, addOnDiscount) : 0),
    );
    const full = resolve((price + addOnInr) * duration);

    // The saving is read off the two converted figures rather than the INR
    // behind them, so the badge can never claim a discount the two numbers on
    // the card don't visibly show.
    const isDiscounted = actual.amount < full.amount;

    return {
      duration,
      total: formatMoney(actual),
      extrapolated: isDiscounted ? formatMoney(full) : undefined,
      perMonth:
        duration === 1
          ? undefined
          : formatMoney({ ...actual, amount: actual.amount / duration }),
      savedPercent: isDiscounted
        ? Math.round((1 - actual.amount / full.amount) * 100)
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
      {addOn ? (
        <AddOnToggle
          label={addOn.label}
          priceLabel={formatMoney(resolve(addOn.price))}
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
      <span className="h-1.5 w-1.5 rounded-full bg-live" />
      {mode}
    </span>
  );
}

/**
 * The zone a schedule should be printed in, or `null` to print it as authored.
 * Returns `null` on the server and on the first client render, so the markup
 * React hydrates against is the authored IST one either way.
 */
function useDisplayTimeZone(schedule: OfferingSchedule) {
  const [browserTimeZone, setBrowserTimeZone] = useState<string | null>(null);

  useEffect(() => {
    setBrowserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return browserTimeZone && browserTimeZone !== schedule.timezone.id
    ? browserTimeZone
    : null;
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
      className="bg-stone/36 py-9 md:py-12"
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
      className="bg-stone/24 py-9 md:py-12"
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
    <section id="contact" className="relative py-9 md:py-12">
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
