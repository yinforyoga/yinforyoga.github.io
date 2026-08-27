import {
  Activity,
  BadgeCheck,
  Dumbbell,
  Flower2,
  HeartPulse,
  RectangleHorizontal,
  ShieldCheck,
  StretchHorizontal,
  BicepsFlexed,
  Sprout,
  Blocks,
  RockingChair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

/** What you practise. A `Strength` offering may still include yoga. */
export type OfferingFocus = "Strength" | "Yoga";

export function findOffering(format: OfferingFormat, focus: OfferingFocus) {
  return offerings.find(
    (offering) => offering.format === format && offering.focus === focus,
  );
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

export type OfferingScheduleItem = {
  days: OfferingWeekday[];
  classType: OfferingClassType;
  startTime: OfferingLocalTime;
  endTime: OfferingLocalTime;
  optional?: boolean;
};

export type OfferingSchedule = {
  timezone: OfferingTimezone;
  split: OfferingScheduleItem[];
};

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

export type OfferingAddOn = {
  label: string;
  classType: OfferingClassType;
  price: OfferingPrice;
  durationDiscounts: DurationDiscounts;
};

export type Offering = {
  /**
   * The offering's brand name. Also its identity: anchor ids and React keys are
   * derived from it, and testimonials name it in `course`. Shown as a subtitle
   * under `headline`, so renaming one does not require renaming the other.
   */
  title: string;
  /** Plain-language name, and the line a visitor actually reads first. */
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
  description: string;
  details: string[];
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
  course: string;
  platform: "WhatsApp";
  date?: string;
  time?: string;
};

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
    title: "Yin One-to-One",
    headline: "Personal Strength Training",
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
    icon: Dumbbell,
    description: "Programmed for You • Form Corrected Live • Flexible Timing",
    details: [
      "A programme built to your goals and starting point",
      "Every session watched and corrected in real time",
      "Progression adjusted as you get stronger",
      "Timings arranged around your week",
    ],
    bestFor: [
      "Anyone returning from injury or working around a limitation",
      "People with a specific goal and a deadline",
      "Shift workers and frequent travellers who can't hold a fixed slot",
      "Anyone who wants undivided attention on their form",
    ],
    equipment: [
      { label: "Dumbbells", icon: Dumbbell },
      { label: "Resistance Band", icon: StretchHorizontal },
      { label: "(Yoga) Mat", icon: RectangleHorizontal },
    ],
  },
  {
    title: "Yin One-to-One Yoga",
    headline: "Personal Yoga",
    eyebrow: "On request",
    format: "Personal",
    focus: "Yoga",
    schedule: null,
    price: null,
    durationDiscounts: noDurationDiscounts,
    mode: "Online",
    status: "Registrations Open",
    formUrl: null,
    icon: Flower2,
    description: "Paced to You • Adjusted Live • Flexible Timing",
    details: [
      "Asana, pranayama and meditation at your pace",
      "Postures adjusted for your body, not the room's average",
      "Practice built around what you want to work on",
      "Timings arranged around your week",
    ],
    bestFor: [
      "Complete beginners who want to learn the basics properly",
      "Anyone working around stiffness, injury or a health condition",
      "Practitioners wanting to go deeper on specific postures",
      "Anyone who finds group pacing too fast or too slow",
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
    headline: "Group Strength Training Classes",
    eyebrow: "Ongoing",
    format: "Group",
    focus: "Strength",
    schedule: {
      timezone: {
        id: "Asia/Kolkata",
        label: "IST",
        utcOffsetMinutes: 330,
      },
      split: [
        {
          days: ["Mon", "Wed", "Fri"],
          classType: "Strength",
          startTime: { hour: 6, meridiem: "pm" },
          endTime: { hour: 7, meridiem: "pm" },
        },
        {
          days: ["Thu"],
          classType: "Yoga",
          startTime: { hour: 6, meridiem: "pm" },
          endTime: { hour: 7, meridiem: "pm" },
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
    icon: BicepsFlexed,
    description:
      "Home Workout • Strength Training • Guided",
    details: [
      "Fat loss",
      "Lean muscle gain",
      "Structured strength training",
      "A supportive, active community",
    ],
    bestFor: [
      "Busy professionals who struggle to make time for the gym",
      "People who want guided workouts without planning every session",
      "Frequent travelers",
      "Anyone who finds gym spaces intimidating",
    ],
    equipment: [
      { label: "Dumbbells", icon: Dumbbell },
      { label: "Resistance Band", icon: StretchHorizontal },
      { label: "(Yoga) Mat", icon: RectangleHorizontal },
    ],
  },
  {
    title: "Yin for Yoga",
    headline: "Group Yoga Classes",
    eyebrow: "Ongoing",
    format: "Group",
    focus: "Yoga",
    schedule: {
      timezone: {
        id: "Asia/Kolkata",
        label: "IST",
        utcOffsetMinutes: 330,
      },
      split: [
        {
          days: ["Tue", "Thu"],
          classType: "Yoga",
          startTime: { hour: 6, meridiem: "pm" },
          endTime: { hour: 7, meridiem: "pm" },
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
    icon: Sprout,
    description:
      "Asana • Pranayama • Meditation",
    details: [
      "Mobility",
      "Mindfulness",
      "Flexibility",
    ],
    bestFor: [
      "Anyone who wants to practise Yoga regularly",
      "Beginner and intermediate Yoga practitioners",
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
    name: "Arpita M.",
    location: "India",
    course: "Yin for Strength",
    platform: "WhatsApp",
    time: "3:44 PM",
    date: "1 July 2026",
  },
  {
    quote:
      "I have been taking online yoga classes with Shreya for the past two months, and it has been a truly transformative experience. My flexibility has improved significantly, and I feel much more at ease in my body. The pranayama sessions have also helped me manage stress better, bringing a sense of calm and clarity to my daily routine. Shreya is incredibly knowledgeable, patient, and encouraging. She guides each session with great attention to detail, ensuring that every posture is done correctly and safely. Her instructions are clear, making it easy to follow along, even in an online setting. What I love most is her holistic approach—each class is a perfect blend of asanas, breathing exercises, and relaxation techniques. I have also noticed an improvement in my posture, energy levels, and overall well-being. I highly recommend Shreya’s classes to anyone looking to improve their physical health, reduce stress, and cultivate mindfulness.",
    name: "Pramod M.",
    location: "USA",
    course: "Personal Yoga Class",
    platform: "WhatsApp",
    date: "20 Feb 2025",
    time: "9:49 AM"
  },
  {
    quote:
      "This was my first ever yoga journey. As someone who’s always been not so consistent and always wanted to show up. This yoga class made me more consistent and brought that discipline back. From not able to hold plank for 5secs to 15-20sec as of now I’m able to see progress in myself when it comes to strength and flexibility and all thanks to you🤗 after classes the mood lift which I feel is something I needed 💪🏻 also the self realisation that happens along is the journey felt so good. Overall it was such beautiful experience I had and wish to continue with Yin for Yoga and Strength ❤️",
    name: "Nikhita K.",
    location: "India",
    course: "Yin for Strength",
    platform: "WhatsApp",
    time: "3:55 PM",
    date: "1 July 2026"
  },
  {
    quote:
      "I’ve had an amazing experience learning yoga with Shreya! She is incredibly patient and takes the time to explain each pose in detail, ensuring we understand not just how to do it but also why it matters. What I truly appreciate is how she carefully observes and corrects our postures, helping us improve with small but impactful adjustments. Her attention to tiny details—like breathing techniques and subtle muscle engagements—makes a huge difference in refining the asanas. Every session feels both calming and rewarding, and I can see real progress in my practice. Highly recommend her to anyone looking for a dedicated and knowledgeable yoga teacher!",
    name: "Ankita N.",
    location: "USA",
    course: "Personal Yoga Class",
    platform: "WhatsApp",
    date: "25 Feb 2025",
    time: "5:15 AM",
  },
  {
    quote:
      "Hi Shreya, thank you very much for the yoga classes. You have been very patient and teach us the yoga techniques. I have started yoga 3months ago but now i feel i have better balance and flexible. I feel really good after yoga classes. You teach Asanas, pranayama and meditation with details background of each and very small thing . As i take online classes, the clarity of video and your voice is really good. Thank you very correcting all my mistakes and i want to continue the classes. Once again, thank you for the beautiful classes❤️☺️🧘",
    name: "Jyothi B.",
    location: "Germany",
    course: "Group Yoga Class",
    platform: "WhatsApp",
    date: "17 Feb 2025",
    time: "3:00 AM",
  },
];
