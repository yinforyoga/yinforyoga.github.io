import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
