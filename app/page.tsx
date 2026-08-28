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
  whatsappUrl,
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

// Every destination behind this button is off-site — a registration form or a
// WhatsApp conversation — so it always opens in its own tab and leaves the
// visitor's place on the page intact.
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
// grows or shrinks with whatever its schedule happens to need — a two-line
// schedule next to a one-line one leaves the shorter card's front face visibly
// short.
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
// Strength/Yoga labels cannot tell you on their own. It is spelled as its own
// answer rather than left to multi-select: two chips that happen to both be
// pressable never look like a third choice, so nobody found it.
// ─────────────────────────────────────────────────────────────────────────────

/** An answer to the focus question — one axis value, or the pair of them. */
type GuideFocus = OfferingFocus | "Both";

const focusOptions: { id: GuideFocus; label: string }[] = [
  { id: "Strength", label: "Strength training" },
  { id: "Yoga", label: "Yoga" },
  { id: "Both", label: "Strength training + Yoga" },
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
function resolveMatches(format: OfferingFormat, focus: GuideFocus) {
  const inFormat = offerings.filter((offering) => offering.format === format);
  if (focus !== "Both") {
    return inFormat.filter((offering) => offering.focus === focus);
  }

  const coversBoth = inFormat.filter(
    (offering) => describeStrengthWithYoga(offering) !== null,
  );
  return coversBoth.length ? coversBoth : inFormat;
}

function OfferingGuide() {
  const [format, setFormat] = useState<OfferingFormat | null>(null);
  const [focus, setFocus] = useState<GuideFocus | null>(null);

  const matches = format && focus ? resolveMatches(format, focus) : [];

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
                <GuideFocusPicker
                  name={option.id}
                  value={focus}
                  onSelect={setFocus}
                />
              </GuideFormatOption>
            ))}
          </div>
        </fieldset>

        {/* Held open — this region always says something. Collapse is here for
            the height, which changes whenever the answer changes or a second
            button appears beside the first. */}
        <Collapse>
          <div
            key={`${format ?? "none"}-${focus ?? "none"}`}
            className="guide-swap pt-5"
          >
            <GuideResult format={format} focus={focus} matches={matches} />
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
  name,
  value,
  onSelect,
}: {
  name: string;
  value: GuideFocus | null;
  onSelect: (focus: GuideFocus) => void;
}) {
  // The legend is for screen readers only: on screen these chips sit directly
  // under the option they belong to, and a second visible heading was the thing
  // making the panel feel cramped.
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">What would you like to practise?</legend>
      {focusOptions.map((option) => {
        const checked = value === option.id;

        return (
          <label
            key={option.id}
            className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-bold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest/15 ${checked
              ? "border-transparent bg-forest text-linen dark:bg-linen dark:text-forest"
              : "border-forest/20 text-bark hover:border-forest/40 dark:border-white/20 dark:text-linen"
              }`}
          >
            {/* Both format panels stay mounted, so the group is named per
                format — one shared name would put two checked radios in the
                same group. */}
            <input
              type="radio"
              name={`offering-focus-${name}`}
              className="sr-only"
              checked={checked}
              onChange={() => onSelect(option.id)}
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
  focus,
  matches,
}: {
  format: OfferingFormat | null;
  focus: GuideFocus | null;
  matches: Offering[];
}) {
  const note = (text: string) => (
    <p className="border-t border-forest/10 pt-4 text-sm leading-6 text-[color:var(--muted)] dark:border-white/10">
      {text}
    </p>
  );

  if (!format) {
    return note(
      "Everything on offer is listed below. Answer the above questions to get recommendations.",
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
            {focus === "Both" ? describeStrengthWithYoga(matches[0]) : null}.
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

type OfferingDrawerTab = "pricing" | "details";

// No schedule tab: the card face already prints the same days and times, and a
// tab that only restyles what is visible three inches above it costs a click to
// learn nothing.
//
// "What you get" and "Who it's for" share one tab rather than holding two. They
// are read together — what the class is only means something next to who it is
// meant for — and splitting them made a visitor open both, one at a time, to
// answer the single question "is this me?". Side by side under their own
// headings they answer it in one look.
//
// The labels are verb phrases rather than nouns. "Pricing" and "Details" name
// a topic, which reads as a caption on the card; "See pricing" names an action,
// which is the only thing that tells a visitor the chip is theirs to press.
const offeringDrawerTabs: { id: OfferingDrawerTab; label: string }[] = [
  { id: "pricing", label: "See pricing" },
  { id: "details", label: "What's included" },
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
      {/* The card is one bordered box holding two surfaces: a front face
          carrying only the offering's identity, and below it a recessed footer
          and drawer. Everything a customer has to read rather than recognise
          lives in the drawer, one tab at a time.

          Exactly one element owns the border, radius and shadow — the article —
          and clips the rest with `overflow-hidden`. The face used to be a
          second rounded, bordered box stacked on top, which doubled the rim at
          the top corners and left a wedge of the shell exposed where the face's
          bottom corners curved away. */}
      {/* Both themes raise the face above the footer by making it the lighter
          of the two surfaces, so the footer reads as the recessed layer it is.
          Dark mode gets there with a white wash rather than its own colour:
          `--panel-strong` is translucent, so painting it on both layers would
          composite the face *darker* than the drawer behind it and inverting
          the depth. The wash is what the warm `sand` tint can't do here — that
          tint reads as grime against the dark palette rather than as depth. */}
      {/* The chooser links straight here, and `scroll-mt` keeps the sticky
          navbar off the card's own heading when it does. */}
      <article
        id={slugify(offering.title)}
        className="w-full scroll-mt-28 overflow-hidden rounded-[28px] border border-walnut/10 bg-sand/70 shadow-earthy backdrop-blur dark:border-white/10 dark:bg-[color:var(--panel-strong)] dark:backdrop-blur-none"
      >
        <div
          ref={faceRef}
          className="flex flex-col bg-[color:var(--panel-strong)] p-5 dark:bg-white/[0.045] sm:p-6"
        >
          {/* The icon sits beside the title at every width rather than above it
              on small screens: centring it cost a whole row of height on the
              viewport that can least afford one, and bought nothing a
              left-aligned card doesn't already read as. */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* The icon hangs from the top of the title block rather than
                  centring on it: headlines wrap at one width and not another,
                  and centring slid the icon down a half-line on whichever card
                  happened to wrap, so two cards side by side never agreed on
                  where their icons sat. Top-aligning fixes it to the card's
                  padding edge instead — the same height on every card, at every
                  width, however many lines the title takes. The nudge is
                  optical: the circle would otherwise read as sitting high
                  against the serif's cap line, which starts below its line
                  box. */}
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone/50 text-forest dark:bg-white/10 dark:text-linen">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                {/* Plain language leads; the brand name follows as a subtitle.
                    "Group Strength Training Classes" tells a stranger what they
                    would be buying, which "Yin for Strength" only does once you
                    already know. */}
                <h2 className="font-serif text-2xl font-medium leading-[1.15] text-bark dark:text-linen sm:text-3xl sm:leading-tight">
                  {offering.headline}
                </h2>
                <p className="mt-1.5 text-sm font-bold text-[color:var(--muted)]">
                  {offering.title}
                </p>
              </div>
            </div>
            {/* An offering quoted per person has no form to submit — its first
                step is a conversation, so the CTA opens that conversation on
                WhatsApp with the offering already named, rather than dropping
                someone at the contact section to work out what to ask for. */}
            <RegisterButton
              href={
                offering.formUrl ??
                whatsappUrl(
                  `Hi! I'd like to know more about ${offering.headline}.`,
                )
              }
              label={offering.formUrl ? "Register" : "Get in touch"}
              className="w-full shrink-0 sm:w-auto"
            />
          </div>

          <p className="mt-4 text-sm leading-6 text-[color:var(--muted)] sm:mt-5 sm:leading-7">
            {offering.description}
          </p>

          {/* When the classes run is the one fact a visitor has to check
              against their own week before anything else matters, so it sits on
              the face. Price stays one tab below, where a figure can be shown
              with the commitment lengths it depends on instead of flattened to
              a single number here.

              An offering with no timetable shows nothing here: personal
              sessions are arranged with the trainer, and a row saying so is an
              answer to a question the card never raised. */}
          {offering.schedule ? (
            <OfferingSchedulePanel
              schedule={offering.schedule}
              offeringFocus={offering.focus}
            />
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
              <OfferingDetailsInfo offering={offering} />
            ) : null}
          </div>
        </Collapse>
      </article>
    </FadeUp>
  );
}

function OfferingSchedulePanel({
  schedule,
  offeringFocus,
}: {
  schedule: OfferingSchedule;
  offeringFocus: OfferingFocus;
}) {
  return (
    // No box and no "When" label. A bordered panel had to be filled, and the
    // slack the height equalisation hands a short card was filling it with
    // nothing — a one-line timetable sat at the top of an otherwise empty
    // frame. Unboxed the slack is just card, and `mt-auto` spends it *above*
    // the timetable rather than below it, so the days land just over the tab
    // strip on every card instead of leaving a short one with a trailing
    // void — cards side by side then agree on where their timetable sits.
    // There is no divider rule either: the gap `mt-auto` opens is a wider,
    // quieter separator than a hairline, and the card had enough lines across
    // it already.
    //
    // The label went with the frame: it sat flush to the gutter while the
    // pills beside it carry their own padding, so it always read as hanging further left
    // than the row it introduced, and days-plus-time needs no announcing.
    <div className="mt-auto pt-5 sm:pt-6">
      <ScheduleSummary
        schedule={schedule}
        offeringFocus={offeringFocus}
      />
    </div>
  );
}

// One row per class, ordered by what actually disqualifies a visitor: the time
// first, then what is practised, then the days. The hour is the hard gate — a
// person who is not free at 7pm is out whichever days it lands on — so it
// leads the row and carries the weight, where it used to trail the pills as
// the quietest thing in them.
//
// The days stay pills rather than becoming prose. A week is a set of days: three
// chips are counted at a glance where "Mon, Wed, Fri" has to be read, which is
// what makes cadence — three times a week against two — legible across two
// cards. They are just no longer the loudest thing in the row.
function ScheduleSummary({
  schedule,
  offeringFocus,
}: {
  schedule: OfferingSchedule;
  offeringFocus: OfferingFocus;
}) {
  const displayTimeZone = useDisplayTimeZone(schedule);

  return (
    // Three shared columns from `sm` up, each row's children placed straight
    // into them by `display: contents`. Times differ between rows, and two of
    // them can only be compared if they stack — a plain flex row would park
    // each one wherever the preceding cell happened to end.
    //
    // Below `sm` the columns are dropped and each row wraps on its own: a
    // card at phone width has no room for time, class and three pills on one
    // line, and wrapping under the time beats squeezing all three.
    //
    // No rules between the rows — the gap is a wider, quieter separator than a
    // hairline, and the card has enough lines across it already.
    <ul className="grid gap-2.5 sm:grid-cols-[auto_auto_1fr] sm:items-center sm:gap-x-4 sm:gap-y-3">
      {schedule.split.map((item) => (
        <li
          key={`${item.days.join("-")}-${item.classType}`}
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents"
        >
          <p className="text-sm leading-5 text-bark dark:text-linen sm:text-base sm:leading-6">
            <FormattedItemTime
              item={item}
              schedule={schedule}
              timeZone={displayTimeZone}
            />
          </p>
          {/* A single row practising the card's own focus says nothing the
              headline above it hasn't: "Yoga", under "Group Yoga Classes". The
              label is printed where it discriminates — a card holding more than
              one class, or a row practising something other than what the card
              is named for, like the optional yoga on a strength card. */}
          {schedule.split.length > 1 || item.classType !== offeringFocus ? (
            <p className="text-[0.8rem] leading-5 text-[color:var(--muted)] sm:text-sm sm:leading-6">
              {item.classType}
              {item.optional ? (
                <span className="font-serif italic"> (optional)</span>
              ) : null}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1">
            {getScheduleItemDays(item, schedule, displayTimeZone).map((day) => (
              <DayPill key={day} day={day} muted={item.optional} />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

// An optional class is a day the visitor may skip, so its pill is outlined
// rather than filled — the difference is visible before the "(optional)" beside
// it is read.
function DayPill({ day, muted = false }: { day: string; muted?: boolean }) {
  return (
    <span
      className={`inline-flex min-w-[2.6rem] justify-center rounded-full px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] sm:min-w-[3rem] sm:px-2.5 sm:py-1 sm:text-[0.68rem] sm:tracking-[0.1em] ${muted
        ? "border border-dashed border-forest/30 text-forest/75 dark:border-linen/25 dark:text-linen/70"
        : "border border-forest/12 bg-forest/[0.07] text-forest dark:border-linen/12 dark:bg-linen/[0.08] dark:text-linen"
        }`}
    >
      {day}
    </span>
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
  // A recessed band of chips rather than a strip of captions. The tabs used to
  // be borderless text set in 10px letterspaced caps, which a visitor who
  // doesn't already know the card is expandable reads as a footnote — the whole
  // drawer was one guess away from never being opened. A bordered pill with a
  // fill, a hover lift and a pointer cursor is the plainest thing on the web
  // that says "press me", so the chips say it the ordinary way.
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-t border-walnut/10 bg-forest/[0.03] px-5 py-3.5 dark:border-white/10 dark:bg-black/20 sm:px-6"
      role="group"
      aria-label={label}
    >
      {tabs.map(({ id, label: tabLabel }) => (
        <button
          key={id}
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={openTab === id}
          aria-controls={panelId}
          // The focus ring is inset: the card clips its overflow, so a ring
          // drawn outside a chip would be sliced off at the card's edge.
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[0.8rem] font-bold transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/40 dark:focus-visible:ring-white/40 ${openTab === id
            ? "border-ember/60 bg-ember/10 text-ember dark:border-ember/70 dark:bg-ember/15"
            : "border-forest/25 bg-forest/[0.04] text-bark hover:border-forest/45 hover:bg-forest/10 dark:border-white/20 dark:bg-white/[0.06] dark:text-linen dark:hover:border-white/40 dark:hover:bg-white/[0.12]"
            }`}
        >
          {tabLabel}
          {/* The chevron says "this opens" before it is pressed, and rotating
              it says which chip is the one already open. */}
          <ChevronDown
            aria-hidden="true"
            size={14}
            strokeWidth={3}
            className={`shrink-0 transition-transform duration-200 ${openTab === id ? "rotate-180" : ""
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

function OfferingDetailsInfo({ offering }: { offering: Offering }) {
  return (
    // Two columns where there is room, stacked where there is not. The columns
    // are independent lists rather than one list flowing across both, so a
    // heading always sits directly above the items it names.
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-6">
      <OfferingListInfo heading="What you get" items={offering.details} />
      <OfferingListInfo heading="Who it's for" items={offering.bestFor} />
    </div>
  );
}

function OfferingListInfo({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-walnut/68 dark:text-stone">
        {heading}
      </p>
      <ul className="mt-2.5 grid gap-2">
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

  // "6 - 7 pm", not "6:00 pm - 7:00 pm". A round hour has nothing to say with
  // its minutes, and a range that starts and ends in the same half of the day
  // only needs to say which half once — which is also what lets the whole line
  // sit beside its day pills on a phone instead of wrapping under them.
  const sharedMeridiem = start.meridiem === end.meridiem;

  return (
    <>
      <FormattedClock
        clock={trimWholeHour(start.clock)}
        meridiem={sharedMeridiem ? null : start.meridiem}
      />{" "}
      - <FormattedClock clock={trimWholeHour(end.clock)} meridiem={end.meridiem} />
    </>
  );
}

/** "6:00" -> "6". Anything with real minutes on it is left alone. */
function trimWholeHour(clock: string) {
  return clock.endsWith(":00") ? clock.slice(0, -3) : clock;
}

function FormattedClock({
  clock,
  meridiem,
}: {
  clock: string;
  meridiem: string | null;
}) {
  return (
    <>
      <strong className="font-bold">{clock}</strong>
      {meridiem ? ` ${meridiem}` : ""}
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
              href={whatsappUrl()}
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
