import {
  Activity,
  BadgeCheck,
  Dumbbell,
  Flower2,
  HeartPulse,
  RectangleHorizontal,
  ShieldCheck,
  StretchHorizontal,
  User,
  Blocks,
  RockingChair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UsersThree } from "@/components/GroupIcon";

export type OfferingMode = "Online";

export type OfferingStatus = "Registrations Open";

export type OfferingClassType = "Strength" | "Yoga";

// ─────────────────────────────────────────────────────────────────────────────
// The 2x2
//
// Every offering sits at one intersection of two independent axes: who you
// practise with, and what you practise. Naming the axes in the type system
// rather than burying them in prose is what lets the guide resolve a pair of
// answers to a single offering, and lets an unfilled quadrant answer honestly
// instead of silently not existing.
// ─────────────────────────────────────────────────────────────────────────────

/** Who you practise with. */
export type OfferingFormat = "Group" | "Personal";

/**
 * How a format is said out loud. The axis is named once here rather than being
 * written into each offering's `headline`, so a card's title can be the plain
 * name of what is practised — "Strength Training" — and the format can be the
 * line beneath it, the same line on every card in the same column of the 2x2.
 */
export const offeringFormatLabels: Record<OfferingFormat, string> = {
  Group: "Group classes",
  Personal: "Personal classes",
};

/** What you practise. A `Strength` offering may still include yoga. */
export type OfferingFocus = "Strength" | "Yoga";

export function findOffering(format: OfferingFormat, focus: OfferingFocus) {
  return offerings.find(
    (offering) => offering.format === format && offering.focus === focus,
  );
}

/** A quadrant of the 2x2, used to point at an offering without naming it. */
export type OfferingRef = { format: OfferingFormat; focus: OfferingFocus };

/**
 * An offering described by what is practised in it, for readers who have not
 * met the brand names yet — "Strength Training + Yoga – Group classes" rather
 * than "Yin for Strength".
 *
 * Derived rather than written down. The "+ Yoga" in that example is not an
 * editorial flourish: it is the Thursday yoga class that offering actually
 * runs, read off its own schedule, so an offering that stops running yoga stops
 * advertising it here on the same edit. Testimonials name a quadrant and get
 * this, which is why none of them can quietly describe an offering that no
 * longer matches the card a visitor scrolls to next.
 */
/**
 * A colour per offering, so every review of the same class is tagged the same
 * way and a reader scanning the section can group them without reading a word.
 *
 * Keyed on the quadrant rather than on the title, so the colour survives a
 * rename, and holding a light-theme and a dark-theme value because these are
 * text colours: a hue dark enough to read on the page is invisible on the dark
 * one. The dark values are the same hues taken up in lightness, matching the
 * pairs the WhatsApp sender names already use.
 */
export const offeringAccents: Record<string, { light: string; dark: string }> = {
  "Group/Strength": { light: "#b03a22", dark: "#f2a58c" },
  "Group/Yoga": { light: "#173f35", dark: "#b9d0c4" },
  "Personal/Strength": { light: "#6f470b", dark: "#e3bd6a" },
  "Personal/Yoga": { light: "#31518c", dark: "#9fc0f0" },
};

export function offeringAccent({ format, focus }: OfferingRef) {
  return offeringAccents[`${format}/${focus}`] ?? offeringAccents["Group/Yoga"];
}

/** Every testimonial written about one quadrant of the 2x2, in authored order. */
export function getOfferingTestimonials({ format, focus }: OfferingRef) {
  return testimonials.filter(
    (testimonial) =>
      testimonial.course.format === format &&
      testimonial.course.focus === focus,
  );
}

export function offeringCourseLabel({ format, focus }: OfferingRef): string {
  const offering = findOffering(format, focus);
  if (!offering) return offeringFormatLabels[format];

  // Everything on the timetable that isn't the offering's own focus — the
  // classes a visitor would not guess from the headline alone.
  const alsoTaught = offering.schedule
    ? [...new Set(offering.schedule.split.map((item) => item.classType))].filter(
      (classType) => classType !== focus,
    )
    : [];

  const practised = [offering.headline, ...alsoTaught].join(" + ");
  return `${practised} – ${offeringFormatLabels[format]}`;
}

export type OfferingWeekday =
  "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type OfferingMeridiem = "am" | "pm";

export type OfferingTimezone = {
  id: "Asia/Kolkata";
  label: "IST";
  utcOffsetMinutes: 330;
};

export type OfferingHour12 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type OfferingMinute =
  0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55;

export type OfferingLocalTime = {
  hour: OfferingHour12;
  minute?: OfferingMinute;
  meridiem: OfferingMeridiem;
};

/** One hour in the week a class can be taken at. */
export type OfferingTimeSlot = {
  startTime: OfferingLocalTime;
  endTime: OfferingLocalTime;
};

/**
 * A class, and every time it is run. `slots` holds alternatives rather than
 * extra sessions: the same class on the same days, offered at more than one
 * hour so a visitor can take whichever fits their week. Each slot is printed as
 * its own line, because a slot in the evening and one in the morning need not
 * land on the same weekday once converted to the visitor's own zone.
 */
export type OfferingScheduleItem = {
  days: OfferingWeekday[];
  classType: OfferingClassType;
  slots: OfferingTimeSlot[];
  optional?: boolean;
};

export type OfferingSchedule = {
  timezone: OfferingTimezone;
  split: OfferingScheduleItem[];
  /**
   * How many people one batch takes. It lives on the schedule rather than on
   * the offering because a cap is a fact about a batch, and a batch is what a
   * schedule is — which makes it unsayable on a personal offering, where
   * `schedule` is null because sessions are booked one at a time. `slots` being
   * alternatives rather than extra sessions, this is the size of each one, not
   * a total split between them.
   */
  batchCapacity: number;
};

/**
 * Weeks in a month, for turning a weekly timetable into a monthly count. Four,
 * which is the same figure the yoga add-on's price is already authored against
 * (₹100 a class × 4 classes a month) — so a count and a price can never
 * disagree about how long a month is.
 */
const weeksPerMonth = 4;

/**
 * How many classes a month a schedule runs.
 *
 * Counted per day, never per slot: `slots` are alternatives — the same class
 * offered at more than one hour so a visitor can take whichever fits — so a
 * class that runs Mon/Wed/Fri at both 7am and 6pm is three classes a week, not
 * six. Optional classes are excluded unless asked for, because they are what
 * the add-on toggle buys rather than what the price already covers.
 */
export function getMonthlyClassCount(
  schedule: OfferingSchedule,
  { includeOptional = false }: { includeOptional?: boolean } = {},
) {
  const perWeek = schedule.split
    .filter((item) => includeOptional || !item.optional)
    .reduce((total, item) => total + item.days.length, 0);

  return perWeek * weeksPerMonth;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
//
// Every price on the site is authored exactly once, as a monthly amount in INR.
// What a given visitor sees is derived from it in two independent steps:
//
//   1. TIER  — where the visitor is decides a multiplier (`tierMultipliers`).
//   2. DISPLAY — a `PriceDisplayStrategy` decides which currency that amount is
//      finally shown in.
//
// The two are deliberately separate. Whether a US visitor sees ₹3600 or $40 is
// a presentation decision (`displayStrategy`); *how much* they pay is a pricing
// decision (`tierMultipliers`). Changing either is a one-line edit that needs
// no changes to any offering.
// ─────────────────────────────────────────────────────────────────────────────

/** A price expressed in the currency it will actually be rendered in. */
export type Money = { amount: number; currency: string };

/** A monthly price, authored in INR. The single source of truth for an amount. */
export type OfferingPrice = number;

export type PricingTier = "IN" | "INTL";

/** Visitors outside India pay a multiple of the India price. */
export const tierMultipliers: Record<PricingTier, number> = {
  IN: 1,
  INTL: 1.5,
};

export function getTier(region: string): PricingTier {
  return region === "IN" ? "IN" : "INTL";
}

export type PriceDisplayContext = { tier: PricingTier; region: string };

export type PriceDisplayStrategy = {
  id: string;
  /**
   * `inr` has already been scaled by the visitor's tier multiplier, so a
   * strategy only ever decides presentation — never how much is charged.
   */
  display(inr: number, context: PriceDisplayContext): Money;
};

/**
 * Hand-maintained display rates: how many INR one unit of the currency is
 * worth. These only decide the number printed on the page — nothing is charged
 * through them — so approximate, occasionally-refreshed values are fine, and
 * `roundForDisplay` blurs them into round numbers anyway.
 */
const displayRates: Record<string, { currency: string; inrPerUnit: number }> = {
  US: { currency: "USD", inrPerUnit: 88 },
  CA: { currency: "CAD", inrPerUnit: 64 },
  GB: { currency: "GBP", inrPerUnit: 112 },
  AU: { currency: "AUD", inrPerUnit: 57 },
  NZ: { currency: "NZD", inrPerUnit: 52 },
  AE: { currency: "AED", inrPerUnit: 24 },
  SG: { currency: "SGD", inrPerUnit: 65 },
  JP: { currency: "JPY", inrPerUnit: 0.58 },
  DE: { currency: "EUR", inrPerUnit: 96 },
  FR: { currency: "EUR", inrPerUnit: 96 },
  IT: { currency: "EUR", inrPerUnit: 96 },
  ES: { currency: "EUR", inrPerUnit: 96 },
  NL: { currency: "EUR", inrPerUnit: 96 },
  IE: { currency: "EUR", inrPerUnit: 96 },
};

/**
 * Snap a converted amount to two significant figures — 40.9 → 41, 122.7 → 120,
 * ¥6206 → ¥6200. Converted prices are approximations of an INR figure, so a
 * price that reads as approximate is more honest than a false-precision ¥6206.
 *
 * Two figures rather than one: the pricing panel shows a discounted total
 * beside its struck-through undiscounted total, and coarser rounding collapses
 * nearby pairs into the same number, which reads as a bug.
 */
function roundForDisplay(value: number) {
  if (value <= 0) return 0;
  const step = 10 ** (Math.floor(Math.log10(value)) - 1);
  return Math.round(value / step) * step;
}

/** ₹2400 in India, ₹3600 in the US — one currency, one mental model. */
export const showInRupees: PriceDisplayStrategy = {
  id: "rupees",
  display: (inr) => ({ amount: inr, currency: "INR" }),
};

/** ₹2400 in India, $40 in the US, €38 in Germany. */
export const showInLocalCurrency: PriceDisplayStrategy = {
  id: "local-currency",
  display(inr, { tier, region }) {
    // Unknown regions abroad still deserve a familiar currency, so they fall
    // back to USD rather than to rupees.
    const rate = displayRates[region] ?? (tier === "INTL" ? displayRates.US : undefined);
    if (!rate) return { amount: inr, currency: "INR" };
    return {
      amount: roundForDisplay(inr / rate.inrPerUnit),
      currency: rate.currency,
    };
  },
};

/** ₹2400 in India, $40 everywhere else — one price for the whole world abroad. */
export const showInUsdAbroad: PriceDisplayStrategy = {
  id: "usd-abroad",
  display(inr, { tier }) {
    if (tier === "IN") return { amount: inr, currency: "INR" };
    return {
      amount: roundForDisplay(inr / displayRates.US.inrPerUnit),
      currency: "USD",
    };
  },
};

/**
 * Swap this to change how every price on the site is presented.
 *
 * Rupees everywhere for now: one currency and one mental model, and no
 * hand-maintained rate can go stale in front of a visitor.
 *
 * TODO: let the visitor choose instead of deciding for them — a small control
 * near the pricing panel that switches between ₹ and their own currency (or
 * any currency in `displayRates`). The strategies below already cover the
 * cases; what's missing is holding the choice in state and threading it into
 * `resolvePrice` rather than reading this module-level constant.
 */
export const displayStrategy: PriceDisplayStrategy = showInRupees;

/** The one function the UI needs: an INR price in, rendered money out. */
export function resolvePrice(
  inr: OfferingPrice,
  context: PriceDisplayContext,
): Money {
  return displayStrategy.display(inr * tierMultipliers[context.tier], context);
}

// Multi-month packages are priced at a lower effective monthly rate than the
// 1-month price, expressed as a percentage off the extrapolated
// (1-month × N) total so it applies uniformly across regions/currencies.
// Each offering sets its own table, since the rate at which a longer
// commitment earns a discount is a per-offering pricing decision.
export type DurationDiscounts = Record<1 | 2 | 3, number>;

export const noDurationDiscounts: DurationDiscounts = {
  1: 0,
  2: 0,
  3: 0,
};

/**
 * A class an offering runs but does not require — taken or skipped per person.
 * Its presence is what lets a card say "+ optional Yoga" beside the practice it
 * is named for, so an offering that teaches two things says so on its face
 * rather than only in its timetable.
 */
export type OfferingAddOn = {
  label: string;
  classType: OfferingClassType;
  /**
   * A published monthly price, or `null` on the same terms as an offering's
   * own `price`: quoted per person rather than listed. A personal offering has
   * no price to add this to, so it has no figure to publish for it either.
   */
  price: OfferingPrice | null;
  durationDiscounts: DurationDiscounts;
};

export type Offering = {
  /**
   * The offering's brand name. Also its identity: anchor ids and React keys are
   * derived from it, and testimonials name it in `course`. Shown as a subtitle
   * under `headline`, so renaming one does not require renaming the other.
   */
  title: string;
  /**
   * Plain-language name of what is practised, and the line a visitor actually
   * reads first. It says nothing about the format — `offeringFormatLabels`
   * prints that beneath it — so two cards in the same row of the 2x2 carry the
   * same headline and are told apart by the line under it.
   */
  headline: string;
  eyebrow: string;
  /** Where this offering sits on the 2x2. */
  format: OfferingFormat;
  focus: OfferingFocus;
  /**
   * A fixed weekly timetable, or `null` when sessions are booked one at a time
   * rather than running as a batch — which is how personal training works.
   */
  schedule: OfferingSchedule | null;
  /**
   * A published monthly price, or `null` when the offering is quoted per person
   * rather than listed. A null price is not "free" and not "unknown" — it is a
   * deliberate "ask me", and every surface that shows money has to say so
   * rather than print a zero.
   */
  price: OfferingPrice | null;
  durationDiscounts: DurationDiscounts;
  addOn?: OfferingAddOn;
  mode: OfferingMode;
  status: OfferingStatus;
  /** Registration form, or `null` when the first step is a conversation. */
  formUrl: string | null;
  icon: LucideIcon;
  /** What the offering gives you. Rendered as "Features". */
  details: string[];
  /** Who it suits. Rendered as "Best for", beside `details`. */
  bestFor: string[];
  equipment?: {
    label: string;
    icon: LucideIcon;
  }[];
};

export type Testimonial = {
  quote: string;
  name: string;
  location: string | null;
  /**
   * Which offering the person took, as a quadrant rather than a name. Stored
   * this way so the chip on a testimonial is rendered from the offering itself
   * (`offeringCourseLabel`) and cannot go stale when an offering is renamed or
   * its timetable changes.
   */
  course: OfferingRef;
  /**
   * Exact substrings of `quote` to set in bold — the sentence that says what
   * actually changed for this person, which is the line a visitor is scanning
   * for and the one that gets lost in an unbroken block of chat text.
   *
   * A separate field rather than markup inside `quote`, because these are other
   * people's words: the quote stays byte-identical to what was sent, and the
   * emphasis is presentation over the top of it. A phrase that stops matching
   * simply stops being bold; nothing can silently rewrite a testimonial.
   */
  highlights?: string[];
  platform: "WhatsApp";
  date?: string;
  time?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Contact
//
// One number, authored once. Both the contact section and every "Get in touch"
// CTA on a per-person offering point here, so the day it changes it changes in
// one place.
// ─────────────────────────────────────────────────────────────────────────────
const whatsappNumber = "918951766013";

/**
 * A WhatsApp link, optionally opening with a message already typed. An offering
 * quoted per person starts with a conversation, and one that starts with the
 * offering named saves both sides a round trip.
 */
export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const navItems = [
  { label: "Offerings", href: "#offerings" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Personal offerings
//
// Listed and visible, but priced on request: `price` and `formUrl` are null
// until the real figures exist, and the UI renders that as "On request" plus a
// contact CTA rather than inventing a number. Publishing prices later is a data
// edit — fill both fields in and the pricing tab and Register button appear on
// their own.
// ─────────────────────────────────────────────────────────────────────────────
const personalOfferings: Offering[] = [
  {
    title: "Yin One-to-One Strength",
    headline: "Strength Training",
    eyebrow: "On request",
    format: "Personal",
    focus: "Strength",
    // Sessions are arranged around the client's week rather than run as a batch.
    schedule: null,
    price: null,
    durationDiscounts: noDurationDiscounts,
    mode: "Online",
    status: "Registrations Open",
    formUrl: null,
    addOn: {
      label: "Yoga",
      classType: "Yoga",
      // Quoted with the rest of the programme rather than listed, like this
      // offering's own price.
      price: null,
      durationDiscounts: noDurationDiscounts,
    },
    // One person, against the group cards' two. The medallion means the same
    // thing on every card now — how a class is run — so the four read as one
    // set rather than as two pairs answering different questions.
    icon: User,
    // The same ground the group card covers, said as one to one. What changes
    // is not the training but who it is built for: the plan, the pace and the
    // timings all follow one person instead of a batch.
    details: [
      "Your plan is built around your body, your goals and where you are starting from",
      "One to one live classes, not recordings, so your form is corrected on the spot",
      "Helps you lose fat, build muscle and stay healthy",
      "The workouts get harder at your own pace, as you get stronger",
      "We use whatever you have at home: dumbbells, resistance bands, or just your body weight",
      "The workouts keep changing, so you don't get bored",
      "Class timings are set around your week",
    ],
    bestFor: [
      "Anyone who wants a plan made for their body and their goals",
      "Anyone training around an injury or a limitation",
      "People with a specific goal and a date to hit it by",
      "Busy professionals who can only spare an hour in a day",
      "People who travel often or work shifts and cannot hold a fixed class time",
      "People who find gyms intimidating and would rather work out at home",
      "Women who feel more comfortable with a female trainer",
      "Beginners who don't know the workouts or the right form yet",
    ],
    equipment: [
      { label: "Dumbbells", icon: Dumbbell },
      { label: "Resistance Band", icon: StretchHorizontal },
      { label: "(Yoga) Mat", icon: RectangleHorizontal },
    ],
  },
  {
    title: "Yin One-to-One Yoga",
    headline: "Yoga",
    eyebrow: "On request",
    format: "Personal",
    focus: "Yoga",
    schedule: null,
    price: null,
    durationDiscounts: noDurationDiscounts,
    mode: "Online",
    status: "Registrations Open",
    formUrl: null,
    icon: User,
    details: [
      "Asana, pranayama and meditation, paced to you",
      "Postures adjusted for your body, not the room's average",
      "A practice built around what you want to work on",
      "Session times arranged around your week",
    ],
    bestFor: [
      "Complete beginners who want the basics taught properly",
      "Anyone practising around stiffness, injury or a health condition",
      "Practitioners going deeper on specific postures",
      "Anyone who finds a group's pace too fast or too slow",
    ],
    equipment: [
      { label: "Yoga Mat", icon: RectangleHorizontal },
      { label: "Yoga Blocks", icon: Blocks },
      { label: "Yoga Strap", icon: StretchHorizontal },
      { label: "(Yoga) Chair", icon: RockingChair },
    ],
  },
];

export const offerings: Offering[] = [
  {
    title: "Yin for Strength",
    headline: "Strength Training",
    eyebrow: "Ongoing",
    format: "Group",
    focus: "Strength",
    schedule: {
      timezone: {
        id: "Asia/Kolkata",
        label: "IST",
        utcOffsetMinutes: 330,
      },
      batchCapacity: 10,
      split: [
        {
          days: ["Mon", "Wed", "Fri"],
          classType: "Strength",
          slots: [
            {
              startTime: { hour: 6, meridiem: "pm" },
              endTime: { hour: 7, meridiem: "pm" },
            },
            {
              startTime: { hour: 7, meridiem: "am" },
              endTime: { hour: 8, meridiem: "am" },
            },
          ],
        },
        {
          days: ["Thu"],
          classType: "Yoga",
          slots: [
            {
              startTime: { hour: 6, meridiem: "pm" },
              endTime: { hour: 7, meridiem: "pm" },
            },
            {
              startTime: { hour: 7, meridiem: "am" },
              endTime: { hour: 8, meridiem: "am" },
            },
          ],
          optional: true,
        },
      ],
    },
    price: 2400,
    // ₹2400 → ₹2200 → ₹2000 per month as commitment length increases.
    durationDiscounts: {
      1: 0,
      2: 0.0833333,
      3: 0.1666666666,
    },
    addOn: {
      label: "Yoga",
      classType: "Yoga",
      // ₹100/class × 4 classes/month.
      price: 400,
      // Add-on classes are priced separately from the offering's mandatory
      // classes, and carry no multi-month discount — the add-on's monthly
      // rate is flat regardless of commitment length.
      durationDiscounts: noDurationDiscounts,
    },
    mode: "Online",
    status: "Registrations Open",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeLPbLT6HMXT_r6DEidr1uPZmEQ6Z_k_FJs43pFsw1H9wJ7Eg/viewform?usp=dialog",
    // Both group offerings take the same medallion. The icon says how a class is
    // run, not what is practised — the headline beside it already names the
    // practice, and a dumbbell or a sprout there was repeating it in pictures.
    icon: UsersThree,
    // Ordered by what matters most to someone deciding: what the class is,
    // then what it does for them, then how it is run.
    details: [
      "Live classes, not recordings, so your form is corrected on the spot",
      "Helps you lose fat, build muscle and stay healthy",
      "Strength training that gets harder as you get stronger",
      "We use whatever you have at home: dumbbells, resistance bands, or just your body weight",
      "The workouts keep changing, so you don't get bored",
      "An active community that keeps each other accountable by celebrating wins like hitting your daily step goal",
    ],
    bestFor: [
      "Busy professionals who can only spare an hour in a day",
      "People who don't want to work out every day of the week",
      "Anyone who wants someone to guide them and keep them accountable",
      "People who travel often",
      "People who find gyms intimidating and would rather work out at home",
      "Women who feel more comfortable with a female trainer",
      "Beginners who don't know the workouts or the right form yet",
    ],
    equipment: [
      { label: "Dumbbells", icon: Dumbbell },
      { label: "Resistance Band", icon: StretchHorizontal },
      { label: "(Yoga) Mat", icon: RectangleHorizontal },
    ],
  },
  {
    title: "Yin for Yoga",
    headline: "Yoga",
    eyebrow: "Ongoing",
    format: "Group",
    focus: "Yoga",
    schedule: {
      timezone: {
        id: "Asia/Kolkata",
        label: "IST",
        utcOffsetMinutes: 330,
      },
      batchCapacity: 10,
      split: [
        {
          days: ["Tue", "Thu"],
          classType: "Yoga",
          slots: [
            {
              startTime: { hour: 6, meridiem: "pm" },
              endTime: { hour: 7, meridiem: "pm" },
            },
          ],
        },
      ],
    },
    price: 1600,
    // ₹1600 → ₹1400 → ₹1200 per month as commitment length increases.
    durationDiscounts: {
      1: 0,
      2: 0.125,
      3: 0.25,
    },
    mode: "Online",
    status: "Registrations Open",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfQIQ2l_FsHU6S0LR4obRv1HR57vj4HJe2vqR-6pgzpAN4IvQ/viewform?usp=header",
    icon: UsersThree,
    // Ordered by what matters most to someone deciding: what the class is,
    // then what it does for them, then how it is run.
    details: [
      "Every class is different, and there is much more to it than suryanamaskar, so you never get bored",
      "We use props like a chair, a strap or a dupatta, blocks, pillows and the wall",
      "Every class ends with pranayama, and sometimes meditation",
      "Live classes, not recordings, so your postures are corrected on the spot",
    ],
    bestFor: [
      "Anyone from a complete beginner to an intermediate practitioner",
      "Busy people who want to practise yoga from home and not travel to a studio",
      "People who want to add a regular yoga practice to their routine",
      "People who want two days of yoga alongside their other fitness routine, rather than yoga every day of the week",
      "People who want to improve their posture, mobility and flexibility",
      "Gym goers who want to make yoga a part of their recovery and flexibility routine",
    ],
    equipment: [
      { label: "Yoga Mat", icon: RectangleHorizontal },
      { label: "Yoga Blocks", icon: Blocks },
      { label: "Yoga Strap", icon: StretchHorizontal },
      { label: "(Yoga) Chair", icon: RockingChair },
    ],
  },
  ...personalOfferings,
];

export const certificates = [
  {
    title: "RYT 200",
    issuer: "Samyak Yoga",
    category: "Yoga",
    fileUrl: "/certifications/RYT%20200%20-%20Samyak%20Yoga.pdf",
    previewAspectRatio: "595.28 / 841.89",
    previewImageUrl: "/certifications/previews/ryt-200-samyak-yoga.png",
    icon: Flower2,
  },
  {
    title: "Certified Personal Trainer (L5)",
    issuer: "Prehab 121",
    category: "Strength",
    fileUrl: "/certifications/Certified%20Personal%20Trainer%20(Level%205).pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl:
      "/certifications/previews/certified-personal-trainer-level-5.png",
    icon: Dumbbell,
  },
  {
    title: "Diploma in Personal Training",
    issuer: "Prehab 121",
    category: "Strength",
    fileUrl:
      "/certifications/Diploma%20in%20Personal%20Training%20Shreya%20Mugabast%20%E2%80%93%201406513.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/diploma-personal-training.png",
    icon: BadgeCheck,
  },
  {
    title: "Strength & Conditioning Specialist (L6)",
    issuer: "Prehab 121",
    category: "Strength",
    fileUrl:
      "/certifications/Strength%20%26%20Conditioning%20Training%20Specialist%20(Level%206).pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl:
      "/certifications/previews/strength-conditioning-specialist.png",
    icon: Activity,
  },
  {
    title: "Prehab & Rehab Specialist",
    issuer: "Prehab 121",
    category: "Recovery",
    fileUrl:
      "/certifications/PREHAB%20%26%20REHAB%20SPECIALIST%20Shreya%20Mugabast%20053113.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/prehab-rehab-specialist.png",
    icon: ShieldCheck,
  },
  {
    title: "Sports & Exercise Nutrition",
    issuer: "Prehab 121",
    category: "Nutrition",
    fileUrl:
      "/certifications/Sports%20%26%20Exercise%20Nutrition%20Shreya%20Mugabast%20%E2%80%93%20032931.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/sports-exercise-nutrition.png",
    icon: HeartPulse,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "I would like to share my experience with you so far firstly the class timings are very feasible even before this i was your student i equally enjoyed both yoga and strength training for some one like me who doesnt feel like going to gym this was the best for me i also got learn the right form which earlier i would end up doing wrong and had terrible cramps for next 2 days and also my quality of sleep improved ever since i started working out with you i feel rarely bloated over all it was all worth it ❤️🫶🏻and if u cld plan 5 classes a week or 4 for upcoming batch it would be great 🤗",
    highlights: [
      "the class timings are very feasible",
      "i also got learn the right form",
      "my quality of sleep improved",
      "i feel rarely bloated",
    ],
    name: "Arpita M.",
    location: "India",
    course: { format: "Group", focus: "Strength" },
    platform: "WhatsApp",
    time: "3:44 PM",
    date: "1 July 2026",
  },
  {
    quote:
      "I have been taking online yoga classes with Shreya for the past two months, and it has been a truly transformative experience. My flexibility has improved significantly, and I feel much more at ease in my body. The pranayama sessions have also helped me manage stress better, bringing a sense of calm and clarity to my daily routine. Shreya is incredibly knowledgeable, patient, and encouraging. She guides each session with great attention to detail, ensuring that every posture is done correctly and safely. Her instructions are clear, making it easy to follow along, even in an online setting. What I love most is her holistic approach—each class is a perfect blend of asanas, breathing exercises, and relaxation techniques. I have also noticed an improvement in my posture, energy levels, and overall well-being. I highly recommend Shreya’s classes to anyone looking to improve their physical health, reduce stress, and cultivate mindfulness.",
    highlights: [
      "My flexibility has improved significantly",
      "yoga classes with Shreya for the past two months",
      "it has been a truly transformative experience",
      "incredibly knowledgeable, patient, and encouraging",
      "holistic approach—each class is a perfect blend of asanas, breathing exercises, and relaxation techniques",
      "helped me manage stress better",
      "an improvement in my posture, energy levels, and overall well-being",
    ],
    name: "Pramod M.",
    location: "USA",
    course: { format: "Personal", focus: "Yoga" },
    platform: "WhatsApp",
    date: "20 Feb 2025",
    time: "9:49 AM"
  },
  {
    quote:
      "This was my first ever yoga journey. As someone who’s always been not so consistent and always wanted to show up. This yoga class made me more consistent and brought that discipline back. From not able to hold plank for 5secs to 15-20sec as of now I’m able to see progress in myself when it comes to strength and flexibility and all thanks to you🤗 after classes the mood lift which I feel is something I needed 💪🏻 also the self realisation that happens along is the journey felt so good. Overall it was such beautiful experience I had and wish to continue with Yin for Yoga and Strength ❤️",
    highlights: [
      "Overall it was such beautiful experience",
      "This yoga class made me more consistent and brought that discipline back",
      "From not able to hold plank for 5secs to 15-20sec",
      "progress in myself when it comes to strength and flexibility",
    ],
    name: "Nikhita K.",
    location: "India",
    course: { format: "Group", focus: "Strength" },
    platform: "WhatsApp",
    time: "3:55 PM",
    date: "1 July 2026"
  },
  {
    quote:
      "I’ve had an amazing experience learning yoga with Shreya! She is incredibly patient and takes the time to explain each pose in detail, ensuring we understand not just how to do it but also why it matters. What I truly appreciate is how she carefully observes and corrects our postures, helping us improve with small but impactful adjustments. Her attention to tiny details—like breathing techniques and subtle muscle engagements—makes a huge difference in refining the asanas. Every session feels both calming and rewarding, and I can see real progress in my practice. Highly recommend her to anyone looking for a dedicated and knowledgeable yoga teacher!",
    highlights: [
      "incredibly patient",
      "she carefully observes and corrects our postures",
      "I can see real progress in my practice",
      "explain each pose in detail",
      "attention to tiny details—like breathing techniques and subtle muscle engagements",
      "Every session feels both calming and rewarding",
      "dedicated and knowledgeable"
    ],
    name: "Ankita N.",
    location: "USA",
    course: { format: "Personal", focus: "Yoga" },
    platform: "WhatsApp",
    date: "25 Feb 2025",
    time: "5:15 AM",
  },
  {
    quote:
      "Hi Shreya, thank you very much for the yoga classes. You have been very patient and teach us the yoga techniques. I have started yoga 3months ago but now i feel i have better balance and flexible. I feel really good after yoga classes. You teach Asanas, pranayama and meditation with details background of each and very small thing . As i take online classes, the clarity of video and your voice is really good. Thank you very correcting all my mistakes and i want to continue the classes. Once again, thank you for the beautiful classes❤️☺️🧘",
    highlights: [
      "i feel i have better balance and flexible",
      "been very patient",
      "I feel really good after yoga classes",
      "the clarity of video and your voice is really good",
    ],
    name: "Jyothi B.",
    location: "Germany",
    course: { format: "Group", focus: "Yoga" },
    platform: "WhatsApp",
    date: "17 Feb 2025",
    time: "3:00 AM",
  },
  {
    quote:
      "As one of her OG students training w her for a year now, I’ve experienced an entire range of yoga (& emotions) under her guidance. I hate Surya Namaskars & she is by far the ONLY yoga teacher who knew enough to introduce me to a much much larger world of yoga practice. From Yin Yoga to stretching with a dupatta, she has blown my mind & made me a new person. I recommend experiencing Shreya’s version of Yoga to everyone struggling with their body & mind.",
    highlights: [
      "for a year now",
      "an entire range of yoga",
      "she is by far the ONLY yoga teacher who knew enough to introduce me to a much much larger world of yoga practice",
      "made me a new person",
      "I recommend experiencing Shreya’s version of Yoga"
    ],
    name: "Megha S.",
    location: "India",
    course: { format: "Group", focus: "Yoga" },
    platform: "WhatsApp",
    date: "29 August 2026",
    time: "5:44 PM",
  },
  {
    quote:
      "I’ve struggled w small town gyms all my life. Male trainers who had no awareness or strategy to train a female body struggling with hormones, Thyroid, PCOD, & their zillion symptoms restricting body’s potential. Shreya’s combination of weight training & yoga has changed my life. She is the ONLY trainer in 29 years that managed to make me consistent. Allowed me the space to hold a 2 minute plank, cry on the mat while meditating, & just show up in any version that I could possibly manage. With such novel variety of exercises every bloody day, I can’t wait for more people to discover this whole new definition of what a workout can be.",
    highlights: [
      "Shreya’s combination of weight training & yoga has changed my life.",
      "Allowed me the space to hold a 2 minute plank, cry on the mat while meditating",
      "novel variety of exercises",
      "whole new definition of what a workout can be."
    ],
    name: "Megha S.",
    location: "India",
    course: { format: "Personal", focus: "Strength" },
    platform: "WhatsApp",
    date: "29 August 2026",
    time: "5:56 PM",
  },
];
