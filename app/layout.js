import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VanillaPDF | Manga Edition",
  description: "Privacy-first PDF tools that run entirely in your browser. Merge, split, convert, and optimize PDFs locally.",
  openGraph: {
    title: "VanillaPDF | Manga Edition",
    description: "Privacy-first PDF tools that run entirely in your browser.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen relative`}
      >
        <div className="fixed inset-0 screentone pointer-events-none z-0 opacity-20" />
        <div className="fixed inset-0 speed-lines pointer-events-none z-0 opacity-10" />

        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
          <span className="absolute top-[15%] left-[8%] text-[12rem] font-black text-white/2 kanji-float" style={{ animationDelay: "0s" }}>戦</span>
          <span className="absolute top-[45%] right-[5%] text-[10rem] font-black text-white/2 kanji-float" style={{ animationDelay: "2s" }}>力</span>
          <span className="absolute bottom-[20%] left-[60%] text-[14rem] font-black text-white/2 kanji-float" style={{ animationDelay: "4s" }}>魂</span>
          <span className="absolute top-[70%] left-[20%] text-[8rem] font-black text-accent/2 kanji-float" style={{ animationDelay: "6s" }}>炎</span>
        </div>

        <SiteHeader />

        <main className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto">
          {children}
        </main>

        <footer className="relative z-10 border-t-4 border-accent p-12 mt-20 bg-black/90 text-white flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 screentone-red opacity-30 pointer-events-none" />
          <p className="text-2xl font-black italic mb-4 relative z-10">
            VANILLA<span className="text-accent text-glow">PDF</span>
          </p>
          <p className="text-xs uppercase tracking-[0.5em] text-white/50 relative z-10">
            Made with 100% pure adrenaline
          </p>
          <p className="mt-8 text-[12px] text-white/70 relative z-10">
            &copy; 2026 VanillaPDF - All rights reserved in every timeline.
          </p>
        </footer>
      </body>
    </html>
  );
}
