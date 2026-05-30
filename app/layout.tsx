import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Codeceipt — Ship AI code. Not AI slop.",
  description:
    "A public, independently-verifiable receipt that proves an AI-authored pull request actually did what it claimed — checked by execution, not self-report.",
  openGraph: {
    title: "Codeceipt — Ship AI code. Not AI slop.",
    description:
      "Verify AI pull requests by execution and hand your client a receipt they can re-run themselves.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
