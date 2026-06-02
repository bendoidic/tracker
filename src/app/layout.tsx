import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Tracker",
  description: "Lightweight tracker for Miki, Ben, Alex, Isai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
