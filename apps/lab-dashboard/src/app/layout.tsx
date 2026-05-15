import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTS_sec Staircase Lab",
  description: "Local-only educational security lab and BTS_sec benchmark harness."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="safety-banner" role="note">
          Local-only lab: scan known stage folders only. Do not scan external targets or deploy vulnerable stages.
        </div>
        {children}
      </body>
    </html>
  );
}
