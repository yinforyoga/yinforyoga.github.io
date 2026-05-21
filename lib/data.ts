import {
  Activity,
  Dumbbell,
  Flower2,
  HeartPulse,
  Orbit,
  ShieldCheck,
  UsersRound
} from "lucide-react";

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Workshops", href: "#workshops" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" }
];

export const offerings = [
  {
    title: "Yoga Classes",
    description:
      "Breath-led yoga that builds awareness, mobility, balance, and emotional steadiness without turning practice into performance.",
    icon: Flower2,
    tone: "from-dusty_olive-900/90 via-linen/85 to-almond_cream-600/80"
  },
  {
    title: "Strength Training",
    description:
      "Progressive personal training for stronger muscles, better posture, confidence, and sustainable strength without punishment.",
    icon: Dumbbell,
    tone: "from-camel-800/75 via-almond_cream-600/80 to-linen/90"
  },
  {
    title: "Mobility Coaching",
    description:
      "Joint-friendly mobility, active flexibility, and movement control for hips, spine, shoulders, and daily ease.",
    icon: Orbit,
    tone: "from-mist/55 via-cream/80 to-linen/90"
  },
  {
    title: "Online Coaching",
    description:
      "Structured remote coaching with form feedback, weekly plans, habit support, and realistic progress tracking.",
    icon: Activity,
    tone: "from-stone/70 via-almond_cream-700/80 to-linen/90"
  },
  {
    title: "Group Classes",
    description:
      "Warm community classes that combine movement, strength, breath, and support without comparison or pressure.",
    icon: UsersRound,
    tone: "from-sage/70 via-dusty_olive-900/70 to-linen/90"
  },
  {
    title: "Prehab/Rehab-Informed Training",
    description:
      "Intelligent movement guidance for rebuilding trust in the body through stability, pacing, and gentle progression.",
    icon: ShieldCheck,
    tone: "from-ebony-900/80 via-almond_cream-700/80 to-linen/90"
  },
  {
    title: "PCOS-Aware Movement",
    description:
      "Training that respects energy, stress, recovery, strength, and consistency for people navigating PCOS.",
    icon: HeartPulse,
    tone: "from-terracotta/20 via-blush/55 to-linen/90"
  }
];

export const workshops = [
  {
    date: "June 22",
    title: "Strength Without Punishment",
    description:
      "A workshop on building strength with body trust, progressive training, and nervous-system aware pacing."
  },
  {
    date: "July 13",
    title: "Mobility for Real Life",
    description:
      "Hips, spine, shoulders, and breath practices for people who feel stiff, tired, or disconnected."
  },
  {
    date: "August 10",
    title: "PCOS-Aware Movement Lab",
    description:
      "A practical session on training consistency, recovery, stress, and strength while navigating PCOS."
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
    detail: "Online group class member",
    type: "Class screenshot"
  },
  {
    quote:
      "PCOS made consistency feel impossible. Her approach helped me train with my body instead of fighting it.",
    name: "Maya K.",
    detail: "Online coaching student",
    type: "Community message"
  }
];
