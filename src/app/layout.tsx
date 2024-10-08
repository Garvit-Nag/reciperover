import type { Metadata } from "next";
import "./globals.css";  // No need to import Inter if not using it

export const metadata: Metadata = {
  title: "Recipe Rover",
  description: "Cooked!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}