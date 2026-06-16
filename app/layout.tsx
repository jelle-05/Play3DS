import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import NavRail from "@/components/NavRail/NavRail";
import StatusBar from "@/components/StatusBar/StatusBar";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Play3DS",
    template: "%s — Play3DS",
  },
  description: "Track your Nintendo 3DS playthroughs fast and easy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${inter.variable}`}>
      <body>
        <StatusBar />
        <div className="app-shell">
          <NavRail />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
