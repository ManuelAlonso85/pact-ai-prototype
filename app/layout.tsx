import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const publicUrl = "https://manuelalonso85.github.io/pact-ai-prototype/";

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: "PACT AI — Interactive Product Prototype",
  description: "A safe, synthetic walkthrough of an SMS-first accountability pact.",
  icons: { icon: `${publicUrl}favicon.svg`, shortcut: `${publicUrl}favicon.svg` },
  openGraph: {
    title: "PACT AI",
    description: "An interactive accountability prototype",
    type: "website",
    url: publicUrl,
    images: [{ url: `${publicUrl}og.png`, width: 1536, height: 1024, alt: "PACT AI interactive accountability prototype" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PACT AI",
    description: "An interactive accountability prototype",
    images: [`${publicUrl}og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
