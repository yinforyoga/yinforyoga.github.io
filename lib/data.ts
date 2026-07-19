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

export type Testimonial = {
  quote: string;
  name: string;
  initials: string;
  detail: string;
  platform: "WhatsApp";
  date?: string;
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
    theme: "Regular strength training (and yoga) group classes",
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

export const testimonials: Testimonial[] = [
  {
    quote:
      "I would like to share my experience with you so far firstly the class timings are very feasible even before this i was your student i equally enjoyed both yoga and strength training for some one like me who doesnt feel like going to gym this was the best for me i also got learn the right form which earlier i would end up doing wrong and had terrible cramps for next 2 days and also my quality of sleep improved even since i started working out with you i feel rarely bloated over all it was all worth it ❤️🫶🏻and if u cld plan 5 classes a week or 4 for upcoming batch it would be great 🤗",
    name: "Arpita Mohite",
    initials: "AM",
    detail: "Yoga & strength student",
    platform: "WhatsApp",
  },
  {
    quote:
      "This was my first ever yoga journey. As someone who’s always been not so consistent and always wanted to show up. This yoga class made me more consistent and brought that discipline back. From not able to hold plank for 5secs to 15-20sec as of now I’m able to see progress in myself when it comes to strength and flexibility and all thanks to you🤗 after classes the mood lift which I feel is something I needed 💪🏻 also the self realisation that happens along is the journey felt so good. Overall it was such beautiful experience I had and wish to continue with Yin for Yoga and Strength ❤️",
    name: "Name withheld",
    initials: "YF",
    detail: "Yoga & strength student",
    platform: "WhatsApp",
  },
  {
    quote:
      "I’ve had an amazing experience learning yoga with Shreya! She is incredibly patient and takes the time to explain each pose in detail, ensuring we understand not just how to do it but also why it matters. What I truly appreciate is how she carefully observes and corrects our postures, helping us improve with small but impactful adjustments. Her attention to tiny details—like breathing techniques and subtle muscle engagements—makes a huge difference in refining the asanas. Every session feels both calming and rewarding, and I can see real progress in my practice. Highly recommend her to anyone looking for a dedicated and knowledgeable yoga teacher!",
    name: "Ankita Narayan",
    initials: "AN",
    detail: "Yoga student",
    platform: "WhatsApp",
    date: "25 Feb 2025",
  },
  {
    quote:
      "Hi Shreya, thank you very much for the yoga classes. You have been very patient and teach us the yoga techniques. I have started yoga 3months ago but now i feel i have better balance and flexible. I feel really good after yoga classes. You teach Asanas, pranayama and meditation with details background of each and very small thing . As i take online classes, the clarity of video and your voice is really good. Thank you very correcting all my mistakes and i want to continue the classes. Once again, thank you for the beautiful classes❤️☺️🧘",
    name: "Jyothi",
    initials: "J",
    detail: "Online yoga student",
    platform: "WhatsApp",
    date: "17 Feb 2025",
  },
];
