import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codeceipt — Ship AI code. Not AI slop.",
  description:
    "A public, independently-verifiable receipt that proves an AI-authored pull request actually did what it claimed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
