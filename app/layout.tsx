import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { TournamentProvider } from "../context/TournamentContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wooden Spoon Watch — World Cup 2026",
  description:
    "Tracking the worst-placed team at the 2026 FIFA World Cup, by points, goal difference and disciplinary record.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="bg-ink text-paper font-body antialiased min-h-screen">
        <TournamentProvider>{children}</TournamentProvider>
      </body>
    </html>
  );
}
