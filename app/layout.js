import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
  description: "The most powerful PDF editor in the anime multiverse.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen relative`}
      >
        <div className="fixed inset-0 screentone pointer-events-none z-0 opacity-20"></div>
        <div className="fixed inset-0 speed-lines pointer-events-none z-0 opacity-10"></div>
        
        <header className="relative z-10 border-b-4 border-accent p-6 flex justify-between items-center bg-black/80 backdrop-blur-sm">
          <Link href="/" className="group">
            <h2 className="text-4xl font-black italic tracking-tighter text-white group-hover:text-accent transition-colors">
              VANILLA<span className="text-accent group-hover:text-white">PDF</span>
              <span className="text-xs align-top ml-2 bg-accent text-white px-1 not-italic tracking-normal">バニラ</span>
            </h2>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="/" className="hover:text-accent border-b-2 border-transparent hover:border-accent pb-1 transition-all">All Tools</Link>
            <Link href="/about" className="hover:text-accent border-b-2 border-transparent hover:border-accent pb-1 transition-all">About</Link>
          </nav>
        </header>

        <main className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto">
          {children}
        </main>

        <footer className="relative z-10 border-t-4 border-accent p-12 mt-20 bg-black/90 text-white flex flex-col items-center">
          <p className="text-2xl font-black italic mb-4">VANILLA<span className="text-accent">PDF</span></p>
          <p className="text-xs uppercase tracking-[0.5em] text-white/50">Made with 100% pure adrenaline</p>
          <p className="mt-8 text-[10px] text-white/20">© 2026 VanillaPDF - All rights reserved in every timeline.</p>
        </footer>
      </body>
    </html>
  );
}
