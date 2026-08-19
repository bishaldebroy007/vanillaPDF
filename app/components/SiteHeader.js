"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
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
        <Link href="/" className="group" onClick={() => setMobileMenuOpen(false)}>
          <motion.h2
            className="text-3xl md:text-4xl font-black italic tracking-tighter text-white group-hover:text-accent transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            VANILLA
            <span className="text-accent group-hover:text-white transition-colors">PDF</span>
            <motion.span
              className="text-xs align-top ml-2 bg-accent text-white px-1 not-italic tracking-normal inline-block"
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              バニラ
            </motion.span>
          </motion.h2>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest" aria-label="Main navigation">
          <Link href="/" className="nav-link">All Tools</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>

        <motion.button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/98 flex flex-col items-center justify-center gap-8 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-accent transition-colors">
              All Tools
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-accent transition-colors">
              About
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
