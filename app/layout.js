"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>VanillaPDF | Manga Edition</title>
        <meta
          name="description"
          content="The most powerful PDF editor in the anime multiverse."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen relative`}
      >
        <div className="fixed inset-0 screentone pointer-events-none z-0 opacity-20"></div>
        <div className="fixed inset-0 speed-lines pointer-events-none z-0 opacity-10"></div>

        {/* Floating kanji background decorations */}
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <span
            className="absolute top-[15%] left-[8%] text-[12rem] font-black text-white/2 kanji-float"
            style={{ animationDelay: "0s" }}
          >
            戦
          </span>
          <span
            className="absolute top-[45%] right-[5%] text-[10rem] font-black text-white/2 kanji-float"
            style={{ animationDelay: "2s" }}
          >
            力
          </span>
          <span
            className="absolute bottom-[20%] left-[60%] text-[14rem] font-black text-white/2 kanji-float"
            style={{ animationDelay: "4s" }}
          >
            魂
          </span>
          <span
            className="absolute top-[70%] left-[20%] text-[8rem] font-black text-accent/2 kanji-float"
            style={{ animationDelay: "6s" }}
          >
            炎
          </span>
        </div>

        <motion.header
          className={`sticky top-0 z-50 border-b-4 border-accent p-4 md:p-6 flex justify-between items-center transition-all duration-300 ${
            scrolled
              ? "bg-black/95 backdrop-blur-md shadow-[0_4px_20px_rgba(255,0,0,0.15)]"
              : "bg-black/80 backdrop-blur-sm"
          }`}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Link
            href="/"
            className="group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-black italic tracking-tighter text-white group-hover:text-accent transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              VANILLA
              <span className="text-accent group-hover:text-white transition-colors">
                PDF
              </span>
              <motion.span
                className="text-xs align-top ml-2 bg-accent text-white px-1 not-italic tracking-normal inline-block"
                animate={{ rotate: [0, -2, 2, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                バニラ
              </motion.span>
            </motion.h2>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="/" className="nav-link">
              All Tools
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <motion.button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </motion.header>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/98 flex flex-col items-center justify-center gap-8 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 processing-lines opacity-20 pointer-events-none" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-accent transition-colors"
                >
                  All Tools
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-accent transition-colors"
                >
                  About
                </Link>
              </motion.div>
              <motion.p
                className="absolute bottom-12 text-xs uppercase tracking-[0.5em] text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                VanillaPDF バニラ
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto">
          {children}
        </main>

        <footer className="relative z-10 border-t-4 border-accent p-12 mt-20 bg-black/90 text-white flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 screentone-red opacity-30 pointer-events-none" />
          <motion.p
            className="text-2xl font-black italic mb-4 relative z-10"
            whileHover={{ scale: 1.05 }}
          >
            VANILLA<span className="text-accent text-glow">PDF</span>
          </motion.p>
          <p className="text-xs uppercase tracking-[0.5em] text-white/50 relative z-10">
            Made with 100% pure adrenaline
          </p>
          <p className="mt-8 text-[12px] text-white/70 relative z-10">
            &copy; 2026 VanillaPDF - All rights reserved in every timeline.
          </p>
          <p className="mt-4 text-[10px] text-white/70 relative z-10">
            This is a fan-made project and is not affiliated with any official
            manga or anime properties.
          </p>
        </footer>
      </body>
    </html>
  );
}
