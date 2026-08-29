import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

// The three families are loaded here rather than merely named in CSS. They were
// only ever declared as font stacks, so a visitor without Cormorant or Manrope
// installed — which is nearly all of them — read the site in Georgia and their
// system sans, and the card was designed against fonts most people never saw.
//
// Cormorant sets the headlines and nothing else: it is a display face, drawn
// thin and high-contrast for size, and at the size a timetable or a price is
// set it goes spindly and its figures turn wispy. Newsreader takes that work —
// a text serif with sturdy strokes and lining figures that hold at 18 to 24px —
// so the card keeps one serif voice across two jobs instead of asking one face
// to do both badly. Manrope stays the sans for labels and prose, and its even,
// geometric caps are what let a small-caps label sit under a serif figure
// without either one fighting the other.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Playfair Display", "Georgia", "serif"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  // 700 is here for the offering headlines. Cormorant tops out at 700 and even
  // there stays airy — it is drawn with hairline joins and serifs, so weight
  // thickens its stems without changing the colour of the word — which left the
  // one line naming what an offering actually is reading lighter than the
  // timetable under it.
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Yin for Yoga",
  description:
    "View current Yin for Yoga online workshops and theme-based yoga classes, then register through a simple Google Form with payment details.",
  keywords: [
    "yoga instructor",
    "online yoga classes",
    "mobility coaching",
    "yoga workshops",
    "strength training",
  ],
  openGraph: {
    title: "Yin for Yoga",
    description: "Yoga / Strength Training Classes and Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${newsreader.variable} ${manrope.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
