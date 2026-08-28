"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  DollarSign,
  Euro,
  IndianRupee,
  JapaneseYen,
  PoundSterling,
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
  type OfferingPrice,
  type OfferingSchedule,
  type OfferingScheduleItem,
  type OfferingTimeSlot,
  type OfferingWeekday,
  offerings,
  offeringFormatLabels,
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
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-[28px] bg-forest px-4 text-sm font-bold text-linen shadow-soft transition hover:-translate-y-0.5 hover:bg-ember sm:h-11 sm:px-5 ${className}`}
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
    // The fixed navbar is 82px tall and this section is the one the nav links
    // to, so the old 80px of top padding put the eyebrow underneath it — the
    // label arrived pinned to the navbar with nothing above it. The padding now
    // clears the navbar first and leaves room after.
    <section id="offerings" className="relative pb-9 pt-28 md:pb-12 md:pt-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,rgba(204,197,185,0.42),rgba(255,252,242,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(25,17,11,0))]" />
      <div className="section-shell">
        {/* `SectionHeading`'s own bottom margin is tuned for sections that
            open on a paragraph. Here the next thing is a card edge, which needs
            more clearance than a line of text, and most of all on a phone where
            the eyebrow and the card are the same width. Padding rather than a
            margin: a margin here would just collapse into the heading's own. */}
        <div className="pb-3 sm:pb-0">
          <SectionHeading eyebrow="Offerings" />
        </div>

        {/* `items-start` so an open drawer grows only its own card — with the
            default stretch, opening one card would resize its row neighbour.

            `auto-fit` rather than a breakpoint: the tracks go two-up at the
            same width the old flex row did (2 x 32rem + the gap), but a lone
            card fills the container instead of stopping at a max width and
            leaving a gutter beside it. `min()` keeps the 32rem floor from
            overflowing a phone. */}
        <div
          ref={rowRef}
          className="grid items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(32rem,100%),1fr))]"
        >
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
      className="min-w-0"
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
      {/* `scroll-mt` keeps the fixed navbar off the card's own heading for
          anyone arriving on a link straight to this card. */}
      <article
        id={slugify(offering.title)}
        className="w-full scroll-mt-28 overflow-hidden rounded-[28px] border border-walnut/10 bg-sand/70 shadow-earthy backdrop-blur dark:border-white/10 dark:bg-[color:var(--panel-strong)] dark:backdrop-blur-none"
      >
        <div
          ref={faceRef}
          className="flex flex-col bg-[color:var(--panel-strong)] p-4 dark:bg-white/[0.045] sm:p-6"
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
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone/50 text-forest dark:bg-white/10 dark:text-linen sm:h-11 sm:w-11">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                {/* Three lines, in the order a stranger needs them: whose it is,
                    what it is, and how it is run. The headline used to carry all
                    three at once — "Group Strength Training Classes" — which
                    made every card's title a different length and buried the one
                    word that distinguishes it. Now the practice stands alone in
                    the serif, the format is the quiet line under it, and the
                    brand name goes above in small caps, where it identifies
                    without competing. */}
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-[color:var(--muted)] sm:text-[0.68rem]">
                  {offering.title}
                </p>
                <h2 className="mt-1 font-serif text-xl font-medium leading-[1.15] text-bark dark:text-linen sm:text-2xl sm:leading-tight">
                  {offering.headline}
                </h2>
                {/* Cormorant's italic, not Newsreader's. The subtitle sits
                    directly under a Cormorant headline, and a second serif at
                    that distance read as a near-miss rather than a pairing —
                    close enough in colour to look like the same face set
                    wrongly. Newsreader keeps the card's data, where its sturdier
                    strokes are the point; here, the headline's own italic is
                    what belongs. */}
                <p className="font-serif text-base italic leading-6 text-[color:var(--muted)] sm:text-lg">
                  {offeringFormatLabels[offering.format]}
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

          <p className="mt-3 text-[0.8rem] leading-5 text-[color:var(--muted)] sm:mt-4 sm:text-sm sm:leading-6">
            {offering.description}
          </p>

          {/* When the classes run is the one fact a visitor has to check
              against their own week before anything else matters, so it sits on
              the face.

              An offering with no timetable shows nothing here: personal
              sessions are arranged with the trainer, and a row saying so is an
              answer to a question the card never raised. */}
          {offering.schedule ? (
            <OfferingSchedulePanel schedule={offering.schedule} />
          ) : null}

        </div>

        {/* Price was a tab below, on the reasoning that a figure means little
            without the commitment lengths it depends on — but a visitor
            deciding between four offerings is deciding partly on cost, and a
            card that makes them click to find out is a card that gets skipped.
            So it comes out of the drawer, though not onto the face: it belongs
            with the strip and the drawer, in the recessed part of the card a
            visitor acts on rather than reads. The face carries the one number
            they are choosing on; the tab still carries the plan-by-plan
            breakdown that number came from. */}
        <OfferingPriceBand offering={offering} />

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

// The card's money line: a currency medallion, a small-caps label, and the
// figure in the serif — the schedule block's shape, one size up, because price
// is the other half of the same decision.
//
// It runs full-bleed to the card's edges on a tinted ground, so it reads as a
// band across the foot of the face rather than as one more line of the face's
// prose. Sitting directly above the tab strip, it also gives "See pricing" an
// obvious subject: the strip below it opens the plans behind the number.
function OfferingPriceBand({ offering }: { offering: Offering }) {
  const region = useRegion();
  const resolve = (inr: number) =>
    resolvePrice(inr, { tier: getTier(region), region });
  const price = getFacePrice(offering, resolve);

  return (
    // No tint of its own. The card is two surfaces, not four: a raised face,
    // and everything under it recessed into the shell. A third value here made
    // the band read as its own floor — and going *lighter* than the face while
    // the strip beneath it went darker, the eye travelled up, then down, then
    // up again inside forty pixels. Sharing the shell, the band, the tab strip
    // and the drawer are one block, which is what they are.
    <div className="flex items-center gap-3 px-4 pb-2.5 pt-3 sm:gap-3.5 sm:px-6 sm:pb-3 sm:pt-4">
      {/* The currency is drawn, not typeset. Set in a text face the ₹ came out
          of whichever fallback happened to own the glyph — a different weight,
          a different width and a different colour from the two icons above it,
          which is what made it look pasted on. As a lucide glyph it is the same
          stroke as the calendar and the clock, and the three medallions finally
          read as one set. A currency with no icon falls back to its symbol in
          the sans, which at least matches the labels. */}
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest/10 bg-forest/[0.06] text-sm font-bold text-forest/75 dark:border-linen/12 dark:bg-linen/[0.07] dark:text-linen/70 sm:h-10 sm:w-10"
      >
        {price.CurrencyIcon ? (
          <price.CurrencyIcon size={15} strokeWidth={1.8} />
        ) : (
          price.symbol
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[0.64rem] font-bold uppercase leading-5 tracking-[0.1em] text-[color:var(--muted)] sm:text-[0.68rem]">
          {price.label}
        </p>
        <p className="font-editorial text-xl font-medium leading-7 text-bark dark:text-linen sm:text-2xl sm:leading-8">
          {price.amount}
          {price.unit ? (
            <span className="font-sans text-sm font-normal text-[color:var(--muted)]">
              {" "}
              {price.unit}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

/**
 * The one figure a card face shows, and the words around it.
 *
 * "Starting at" means the lowest monthly rate actually obtainable, which is the
 * longest commitment's — quoting the month-to-month price under that phrase
 * would be a lie in the other direction. The note is what keeps it honest: it
 * names the plan that earns the figure, and the month-to-month price beside it,
 * so nobody arrives at the pricing tab to find the number has moved.
 */
function getFacePrice(
  offering: Offering,
  resolve: (inr: number) => Money,
) {
  const { currency } = resolve(offering.price ?? 0);
  const symbol = getCurrencySymbol(currency);
  const CurrencyIcon = currencyIcons[currency] ?? null;

  // Not "free" and not "unknown": a deliberate "ask me", said in the same place
  // every other card says a number.
  if (offering.price === null) {
    return {
      symbol,
      CurrencyIcon,
      label: "Price",
      amount: "On request",
      unit: null as string | null,
    };
  }

  const monthly = resolve(offering.price);
  const cheapest = planDurations
    .map((duration) => ({
      duration,
      perMonth: resolve(
        getDiscountedTotal(
          offering.price as number,
          duration,
          offering.durationDiscounts[duration],
        ) / duration,
      ),
    }))
    .reduce((best, plan) => (plan.perMonth.amount < best.perMonth.amount ? plan : best));

  // An offering whose longer plans cost the same per month has no "starting
  // at" to offer, and saying so would promise a discount that is not there.
  if (cheapest.perMonth.amount >= monthly.amount) {
    return {
      symbol,
      CurrencyIcon,
      label: "Price",
      amount: formatAmount(monthly),
      unit: "/ month",
    };
  }

  return {
    symbol,
    CurrencyIcon,
    label: "Starting at",
    amount: formatAmount(cheapest.perMonth),
    unit: "/ month",
  };
}

/**
 * The figure without its currency mark — "2,000", not "₹2,000".
 *
 * The medallion beside it is already the currency, said once and drawn to match
 * the icons above it; repeating it against the numerals put two rupee marks a
 * centimetre apart, the second one crowding the digits it was set tight
 * against. The note underneath keeps its symbols: that line quotes a second
 * figure away from the medallion, where the mark still does work.
 */
function formatAmount({ amount }: Money) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount,
  );
}

/** The drawn form of a currency, where lucide has one. */
const currencyIcons: Record<string, LucideIcon | undefined> = {
  INR: IndianRupee,
  USD: DollarSign,
  CAD: DollarSign,
  AUD: DollarSign,
  NZD: DollarSign,
  SGD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  JPY: JapaneseYen,
};

/** "₹", "$" — the symbol the visitor's prices are actually printed with. */
function getCurrencySymbol(currency: string) {
  return (
    new Intl.NumberFormat("en-IN", { style: "currency", currency })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

function OfferingSchedulePanel({ schedule }: { schedule: OfferingSchedule }) {
  return (
    // No box and no "When" label. A bordered panel had to be filled, and the
    // slack the height equalisation hands a short card was filling it with
    // nothing — a one-line timetable sat at the top of an otherwise empty
    // frame. Unboxed the slack is just card, and `mt-auto` spends it *above*
    // the timetable rather than below it, so the days land just over the tab
    // strip on every card instead of leaving a short one with a trailing
    // void — cards side by side then agree on where their timetable sits.
    //
    // The label went with the frame: it sat flush to the gutter while the
    // pills beside it carry their own padding, so it always read as hanging further left
    // than the row it introduced, and days-plus-time needs no announcing.
    <div className="mt-auto pt-4 sm:pt-5">
      <ScheduleSummary schedule={schedule} />
    </div>
  );
}

// Two fields side by side — the classes and the hours they run in — each an
// icon, a small-caps label and its value set in the serif. It is the shape the
// rest of the site already uses for a fact worth reading slowly, and it suits a
// timetable: a label naming what the value is, and the value large enough to be
// taken in at a glance rather than parsed.
//
// The days are prose now, not pills. Set as "Mon · Wed · Fri" in the serif they
// sit level with the hours beside them and read as one calm line; as chips they
// were the loudest thing on the card, and a card the visitor has not yet chosen
// does not need its weekdays shouting. Cadence survives the change — three
// names separated by dots are still counted before they are read.
function ScheduleSummary({ schedule }: { schedule: OfferingSchedule }) {
  const displayTimeZone = useDisplayTimeZone(schedule);
  // Alternative hours for the same class share a line rather than repeating the
  // class and its days once per slot. A row splits only where the days would
  // actually differ, which in a visitor's own zone they can: an evening slot
  // and a morning one need not land on the same weekday once converted.
  const rows = schedule.split.flatMap((item) =>
    groupSlotsByDays(item, schedule, displayTimeZone),
  );
  // Where every class runs at the same set of hours — the usual case, and the
  // whole of this site's timetable today — the hours are a fact about the card,
  // not about each row: one timetable, offered in two batches. That is what
  // earns them a field of their own. `null` puts the times back beside the days
  // they belong to, which is where they belong the day two classes disagree.
  const sharedBatches = getSharedBatches(schedule, displayTimeZone);

  return (
    // The two fields stack rather than sitting side by side. Side by side is
    // the shape the reference uses, and it wants a card the full width of the
    // page; these cards run two to a row, and at that width the days broke
    // across lines to make room for the hours. A field that wraps costs more
    // than the pairing gains.
    <div className="flex flex-col gap-3">
      <ScheduleField icon={CalendarDays} label="Classes">
        {/* Two columns from `sm` up, the rows' cells placed straight into them
            by `display: contents`, so every class's days start at the same
            offset however long the class before it was named. Below `sm` the
            columns are dropped and each row wraps on its own. */}
        <ul className="grid gap-1.5 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-x-3 sm:gap-y-1">
          {rows.map(({ item, slots, days }) => (
            <li
              key={`${item.classType}-${days.join("-")}`}
              className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 sm:contents"
            >
              <span className="text-[0.8rem] leading-6 text-[color:var(--muted)] sm:text-sm">
                {item.classType}
                {item.optional ? (
                  <span className="font-editorial italic"> (optional)</span>
                ) : null}
              </span>
              <span className="font-editorial text-base leading-6 text-bark dark:text-linen sm:text-lg">
                {days.join(" · ")}
                {/* Only where the classes keep different hours; otherwise the
                    hours are one field over, said once. */}
                {sharedBatches ? null : (
                  <>
                    <ScheduleDivider />
                    <BatchTimes
                      slots={slots}
                      days={item.days}
                      schedule={schedule}
                      timeZone={displayTimeZone}
                    />
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </ScheduleField>
      {sharedBatches ? (
        <>
          {/* The word inflects, the field does not move: a card offering one
              hour says "Batch" where one offering two says "Batches". */}
          <ScheduleField
            icon={Clock3}
            label={sharedBatches.slots.length > 1 ? "Batches" : "Batch"}
          >
            <p className="font-editorial text-base leading-6 text-bark dark:text-linen sm:text-lg">
              <BatchTimes
                slots={sharedBatches.slots}
                days={sharedBatches.days}
                schedule={schedule}
                timeZone={displayTimeZone}
              />
            </p>
          </ScheduleField>
        </>
      ) : null}
    </div>
  );
}

/** An icon, a small-caps label, and whatever the label names underneath it. */
function ScheduleField({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      {/* The icon sits in a medallion rather than bare. Loose on the page it
          had no relationship to anything: a 18px outline floating to the left
          of a 11px label, aligned to neither its cap height nor its baseline,
          reading as a stray mark. A disc gives it an edge to sit in, a size to
          be measured against, and the same soft-filled circle the site already
          uses for an offering's own icon at the top of the card. */}
      <span
        aria-hidden
        className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-forest/10 bg-forest/[0.05] text-forest/70 dark:border-linen/12 dark:bg-linen/[0.06] dark:text-linen/65"
      >
        <Icon size={13} strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.64rem] font-bold uppercase leading-5 tracking-[0.1em] text-[color:var(--muted)] sm:text-[0.68rem]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/** The rule between two hours, or between a class's days and its own hours. */
function ScheduleDivider() {
  return (
    // A pipe, not a dot: a middot is a list separator and read as one, stringing
    // the hours together, where a rule between them divides — two batches
    // standing apart, one of which the visitor picks.
    <span className="px-2 font-sans text-sm font-normal text-forest/25 dark:text-linen/20">
      |
    </span>
  );
}

/** A field's hours, "7–8 am | 6–7 pm" — separated, never ranked. */
function BatchTimes({
  slots,
  days,
  schedule,
  timeZone,
}: {
  slots: OfferingTimeSlot[];
  days: OfferingWeekday[];
  schedule: OfferingSchedule;
  timeZone: string | null;
}) {
  return (
    <>
      {slots.map((slot, index) => (
        <Fragment key={formatSlotKey(slot)}>
          {index > 0 ? <ScheduleDivider /> : null}
          <FormattedSlotTime
            slot={slot}
            days={days}
            schedule={schedule}
            timeZone={timeZone}
          />
        </Fragment>
      ))}
    </>
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
      // Closed, this row is the last thing in the card, so its bottom padding
      // is the chips' clearance from the card's bottom corners — and a corner
      // is read as a pair, so that clearance has to match the horizontal inset
      // (`px-4 sm:px-6`) or the chip visibly sits nearer one edge than the
      // other. Open, the row is interior: the drawer below supplies the card's
      // bottom padding, and this reverts to the tighter gap that keeps the
      // chips reading as the header of the panel they opened.
      className={`flex flex-wrap items-center gap-2 px-4 pt-3 transition-[padding] duration-300 ease-out sm:px-6 sm:pt-3.5 ${
        openTab === null ? "pb-4 sm:pb-6" : "pb-3 sm:pb-3.5"
      }`}
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
          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[0.8rem] font-bold sm:h-9 sm:px-3.5 transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/40 dark:focus-visible:ring-white/40 ${openTab === id
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
 * The hours every class in the schedule runs at — one hour or several — or
 * `null` when the classes do not all run at the same ones, in which case an
 * hour is a fact about a class and has to be printed beside its days.
 *
 * The agreement has to hold on the visitor's clock, not on the authored one:
 * a conversion can pull one class's morning batch onto a different weekday
 * (`groupSlotsByDays` splits the row) or, across a DST boundary that falls
 * between two classes' weekdays, onto a different hour. Either breaks the claim
 * a field of its own would make, so either sends the times back to the days.
 */
function getSharedBatches(schedule: OfferingSchedule, timeZone: string | null) {
  const first = schedule.split[0];
  if (!first) return null;

  const startMinutes = (item: OfferingScheduleItem, slot: OfferingTimeSlot) =>
    getSlotStartMinutes(slot, item.days, schedule, timeZone);
  const firstClocks = new Map(
    first.slots.map((slot) => [formatSlotKey(slot), startMinutes(first, slot)]),
  );

  for (const item of schedule.split) {
    if (groupSlotsByDays(item, schedule, timeZone).length !== 1) return null;
    if (item.slots.length !== first.slots.length) return null;
    for (const slot of item.slots) {
      if (firstClocks.get(formatSlotKey(slot)) !== startMinutes(item, slot)) {
        return null;
      }
    }
  }

  return {
    slots: [...first.slots].sort(
      (a, b) => startMinutes(first, a) - startMinutes(first, b),
    ),
    days: first.days,
  };
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

function FormattedSlotTime({
  slot,
  days,
  schedule,
  timeZone,
}: {
  slot: OfferingTimeSlot;
  days: OfferingWeekday[];
  schedule: OfferingSchedule;
  timeZone: string | null;
}) {
  const anchorDay = days[0];
  const start = timeZone
    ? getDateTimeClockParts(
      getScheduleDate(slot.startTime, schedule, anchorDay),
      timeZone,
    )
    : formatScheduleClockParts(slot.startTime);
  const end = timeZone
    ? getDateTimeClockParts(
      getScheduleDate(slot.endTime, schedule, anchorDay),
      timeZone,
    )
    : formatScheduleClockParts(slot.endTime);

  // "6–7 pm", not "6:00 pm - 7:00 pm". A round hour has nothing to say with its
  // minutes, and a range that starts and ends in the same half of the day only
  // needs to say which half once — which is also what keeps the whole field on
  // one line on a phone. The dash is an en dash set tight, the typographer's
  // mark for a span; a spaced hyphen read as a subtraction.
  const sharedMeridiem = start.meridiem === end.meridiem;

  return (
    <>
      <FormattedClock
        clock={trimWholeHour(start.clock)}
        meridiem={sharedMeridiem ? null : start.meridiem}
      />
      {"\u2013"}
      <FormattedClock clock={trimWholeHour(end.clock)} meridiem={end.meridiem} />
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
  // No bold on the hour any more. It was carrying the line when the times were
  // set in the sans at body size; in the serif, at the size the field gives
  // them, they are already the loudest thing in the block, and bolding a
  // Cormorant numeral only thickens it.
  return (
    <>
      {clock}
      {meridiem ? ` ${meridiem}` : ""}
    </>
  );
}

function getConvertedSlotDays(
  days: OfferingWeekday[],
  slot: OfferingTimeSlot,
  schedule: OfferingSchedule,
  timeZone: string,
) {
  const convertedDays = days.map((day) =>
    formatDateTimeWeekday(
      getScheduleDate(slot.startTime, schedule, day),
      timeZone,
    ),
  );

  return uniqueValues(convertedDays);
}

/**
 * A class's slots, split into one row per distinct set of weekdays. Slots are
 * grouped by the days they land on rather than printed one apiece, so the
 * common case — the same class at two hours on the same days — is one line, and
 * a zone conversion that pulls a morning slot onto a different weekday is the
 * only thing that opens a second.
 */
function groupSlotsByDays(
  item: OfferingScheduleItem,
  schedule: OfferingSchedule,
  timeZone: string | null,
) {
  const rows = new Map<
    string,
    { item: OfferingScheduleItem; slots: OfferingTimeSlot[]; days: string[] }
  >();

  for (const slot of item.slots) {
    const days = getSlotDays(item.days, slot, schedule, timeZone);
    const key = days.join("-");
    const row = rows.get(key);
    if (row) row.slots.push(slot);
    else rows.set(key, { item, slots: [slot], days });
  }

  // Batches run in clock order, morning before evening, so a line is read the
  // way a day is. Sorted rather than left to the authoring order: the order
  // that matters is the one on the visitor's own clock, and a conversion can
  // reverse it — 7 am and 6 pm IST land as an evening and a morning in the US.
  for (const row of rows.values()) {
    row.slots.sort(
      (a, b) =>
        getSlotStartMinutes(a, item.days, schedule, timeZone) -
        getSlotStartMinutes(b, item.days, schedule, timeZone),
    );
  }

  return [...rows.values()];
}

/** A slot's start as minutes past midnight, on whichever clock it is printed in. */
function getSlotStartMinutes(
  slot: OfferingTimeSlot,
  days: OfferingWeekday[],
  schedule: OfferingSchedule,
  timeZone: string | null,
) {
  if (!timeZone) {
    return toHour24(slot.startTime) * 60 + (slot.startTime.minute ?? 0);
  }

  return getDateTimeMinutes(
    getScheduleDate(slot.startTime, schedule, days[0]),
    timeZone,
  );
}

function getDateTimeMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return getPart("hour") * 60 + getPart("minute");
}

/** Distinguishes two slots of the same class in a React key. */
function formatSlotKey(slot: OfferingTimeSlot) {
  const format = (time: OfferingLocalTime) =>
    `${time.hour}:${time.minute ?? 0}${time.meridiem}`;

  return `${format(slot.startTime)}-${format(slot.endTime)}`;
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

function getSlotDays(
  days: OfferingWeekday[],
  slot: OfferingTimeSlot,
  schedule: OfferingSchedule,
  timeZone: string | null,
) {
  return timeZone
    ? getConvertedSlotDays(days, slot, schedule, timeZone)
    : days;
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
