import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import NavRail from "@/components/NavRail/NavRail";
import StatusBar from "@/components/StatusBar/StatusBar";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

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
        {/* Set the theme before paint to avoid a flash of the wrong mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <SmoothScroll />
        <StatusBar />
        <div className="app-shell">
          <NavRail />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
