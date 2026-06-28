import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Dumbbell,
  Flower2,
  HeartPulse,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export const navItems = [
  { label: "Offerings", href: "#offerings" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" }
];

export const registrationFormUrl = "https://forms.gle/Xq6GKUNNpde3B5CTA";

export const offerings = [
  {
    title: "Online Yoga Workshop",
    eyebrow: "Current workshop",
    theme: "Lower Body & Hip Mobility",
    date: "31st May",
    duration: "Single online session",
    mode: "Online",
    status: "Registrations open",
    formUrl: registrationFormUrl,
    icon: CalendarDays,
    description:
      "A practical session for people who sit for long hours and feel stiffness in the hips, lower back, glutes, hamstrings, or legs.",
    details: [
      "Lower body mobility drills",
      "Hip-opening movements",
      "Glute and hamstring activation",
      "Gentle stretches and breath-led movement"
    ],
    bestFor: "Desk-job professionals, students, freelancers, and anyone who wants a lighter lower body."
  },
  {
    title: "One Month Yoga Class",
    eyebrow: "Theme-based class",
    theme: "Theme to be announced",
    date: "Starting soon",
    duration: "One month",
    mode: "Online",
    status: "Interest list open",
    formUrl: registrationFormUrl,
    icon: Sparkles,
    description:
      "A month-long online yoga class built around one focused theme, with steady practice, simple progression, and space to build consistency.",
    details: [
      "Theme-led weekly progression",
      "Accessible yoga and mobility",
      "Breathwork and recovery support",
      "Options for different starting points"
    ],
    bestFor: "Anyone who wants a structured month of practice before committing to a longer routine."
  }
];
export const certificates = [
  {
    title: "RYT 200",
    issuer: "Samyak Yoga",
    focus: "Yoga teaching foundation across asana, breath, sequencing, and embodied class facilitation.",
    category: "Yoga",
    fileUrl: "/certifications/RYT%20200%20-%20Samyak%20Yoga.pdf",
    previewAspectRatio: "595.28 / 841.89",
    previewImageUrl: "/certifications/previews/ryt-200-samyak-yoga.png",
    icon: Flower2
  },
  {
    title: "Certified Personal Trainer (L5)",
    issuer: "Prehab 121",
    focus: "Foundational personal training knowledge for coaching, progression, form, and client support.",
    category: "Strength",
    fileUrl: "/certifications/Certified%20Personal%20Trainer%20(Level%205).pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/certified-personal-trainer-level-5.png",
    icon: Dumbbell
  },
  {
    title: "Diploma in Personal Training",
    issuer: "Prehab 121",
    focus: "Structured programming, coaching systems, safe adaptation, and sustainable strength support.",
    category: "Strength",
    fileUrl: "/certifications/Diploma%20in%20Personal%20Training%20Shreya%20Mugabast%20%E2%80%93%201406513.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/diploma-personal-training.png",
    icon: BadgeCheck
  },
  {
    title: "Strength & Conditioning Specialist (L6)",
    issuer: "Prehab 121",
    focus: "Performance-informed strength and conditioning principles for progressive, sustainable training.",
    category: "Strength",
    fileUrl: "/certifications/Strength%20%26%20Conditioning%20Training%20Specialist%20(Level%206).pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/strength-conditioning-specialist.png",
    icon: Activity
  },
  {
    title: "Prehab & Rehab Specialist",
    issuer: "Prehab 121",
    focus: "Joint-friendly progressions, stability, recovery awareness, and rebuilding movement confidence.",
    category: "Recovery",
    fileUrl: "/certifications/PREHAB%20%26%20REHAB%20SPECIALIST%20Shreya%20Mugabast%20053113.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/prehab-rehab-specialist.png",
    icon: ShieldCheck
  },
  {
    title: "Sports & Exercise Nutrition",
    issuer: "Prehab 121",
    focus: "Nutrition education that supports energy, recovery, training consistency, and strength goals.",
    category: "Nutrition",
    fileUrl: "/certifications/Sports%20%26%20Exercise%20Nutrition%20Shreya%20Mugabast%20%E2%80%93%20032931.pdf",
    previewAspectRatio: "841.89 / 595.28",
    previewImageUrl: "/certifications/previews/sports-exercise-nutrition.png",
    icon: HeartPulse
  }
];

export const testimonials = [
  {
    quote:
      "I stopped feeling like exercise had to be punishment. I am stronger now, but I also feel safer in my body.",
    name: "Aarohi M.",
    detail: "Personal training client",
    type: "WhatsApp note"
  },
  {
    quote:
      "The group classes feel warm and real. Nobody is performing. We show up, move, laugh, and leave steadier.",
    name: "Rhea S.",
    detail: "Online movement student",
    type: "Class message"
  },
  {
    quote:
      "PCOS made consistency feel impossible. Her approach helped me train with my body instead of fighting it.",
    name: "Maya K.",
    detail: "Coaching student",
    type: "Community note"
  }
];
