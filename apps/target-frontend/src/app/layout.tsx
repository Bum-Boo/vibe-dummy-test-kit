import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTS_sec Target Frontend",
  description: "Local-only target frontend shell for BTS_sec staged security lessons."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

