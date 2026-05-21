import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yin for Yoga | Yoga, Strength & Movement Coaching",
  description:
    "Grounded yoga, strength training, mobility, prehab, rehab-informed coaching, PCOS-aware movement, and sustainable fitness rooted in real transformation.",
  keywords: [
    "yoga instructor",
    "strength training",
    "mobility coaching",
    "prehab",
    "rehab",
    "yoga workshops",
    "mindful movement"
  ],
  openGraph: {
    title: "Yin for Yoga | Mindful Movement Coaching",
    description:
    "Grounded strength, intelligent movement, emotional safety, and authentic transformation.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
