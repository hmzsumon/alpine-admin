/* ────────── imports ────────── */
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Alpine • Restaurant Admin",
  description: "Alpine Restaurant operations, menu and kitchen management",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
