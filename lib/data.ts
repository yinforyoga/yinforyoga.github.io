import {
  Activity,
  BadgeCheck,
  Dumbbell,
  Flower2,
  HeartPulse,
  ShieldCheck,
  BicepsFlexed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OfferingMode = "Online";

export type OfferingStatus = "Registrations Open";

export type OfferingClassType = "Strength" | "Yoga";

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
  optional?: boolean;
};

export type OfferingSchedule = {
  startTime: OfferingLocalTime;
  endTime: OfferingLocalTime;
  timezone: OfferingTimezone;
  split: OfferingScheduleItem[];
};

export type Offering = {
  title: string;
  eyebrow: string;
  theme: string;
  schedule: OfferingSchedule;
  mode: OfferingMode;
  status: OfferingStatus;
  formUrl: string;
  icon: LucideIcon;
  description: string;
  details: string[];
  bestFor: string[];
};

export const navItems = [
  { label: "Offerings", href: "#offerings" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

export const registrationFormUrl = "https://forms.gle/...";

export const offerings: Offering[] = [
  {
    title: "Yin for Strength",
    eyebrow: "Ongoing",
    theme: "Regular strength training and yoga group classes",
    schedule: {
      startTime: { hour: 5, meridiem: "pm" },
      endTime: { hour: 6, meridiem: "pm" },
      timezone: {
        id: "Asia/Kolkata",
        label: "IST",
        utcOffsetMinutes: 330,
      },
      split: [
        {
          days: ["Mon", "Wed", "Fri"],
          classType: "Strength",
        },
        {
          days: ["Tue"],
          classType: "Yoga",
          optional: true,
        },
      ],
    },
    mode: "Online",
    status: "Registrations Open",
    formUrl: registrationFormUrl,
    icon: BicepsFlexed,
    description:
      "Train from the comfort of your home with a one-hour guided session each day. No workout planning required. Just show up and move.",
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
  },
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

export const testimonials = [
  {
    quote:
      "I stopped feeling like exercise had to be punishment. I am stronger now, but I also feel safer in my body.",
    name: "Aarohi M.",
    detail: "Personal training client",
    type: "WhatsApp note",
  },
  {
    quote:
      "The group classes feel warm and real. Nobody is performing. We show up, move, laugh, and leave steadier.",
    name: "Rhea S.",
    detail: "Online movement student",
    type: "Class message",
  },
  {
    quote:
      "PCOS made consistency feel impossible. Her approach helped me train with my body instead of fighting it.",
    name: "Maya K.",
    detail: "Coaching student",
    type: "Community note",
  },
];
