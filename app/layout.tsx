import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yin for Yoga | Online Yoga Workshops & Classes",
  description:
    "View current Yin for Yoga online workshops and theme-based yoga classes, then register through a simple Google Form with payment details.",
  keywords: [
    "yoga instructor",
    "online yoga class",
    "mobility coaching",
    "yoga registration",
    "yoga workshops",
    "mindful movement"
  ],
  openGraph: {
    title: "Yin for Yoga | Online Yoga Workshops & Classes",
    description:
    "Current online yoga offerings with simple Google Form registration.",
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
