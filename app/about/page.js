"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Eye } from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <h1 className="manga-title">
            THE <span className="text-white">LEGEND</span>
          </h1>
        </motion.div>

        <motion.div variants={fadeUp} className="manga-card p-8 md:p-12 mb-12">
          <p className="text-xl font-bold italic mb-6 border-b-4 border-accent pb-4 uppercase">
            VanillaPDF was forged in the fires of late-night coding sessions and
            a steady diet of ramen and 90s anime.
          </p>
          <div className="space-y-6 text-zinc-600 font-medium">
            <p>
              Born from the frustration of bloated, slow, and privacy-invading
              PDF editors, VanillaPDF aims to be the fastest, most aesthetically
              pleasing tool in your arsenal.
            </p>
            <p>
              Every operation is performed locally in your browser. No files are
              ever uploaded. No data is ever stored. Your privacy is our absolute
              priority.
            </p>
          </div>
        </motion.div>

        {/* Feature cards with icons */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "All processing happens locally. No server roundtrips, no waiting.",
              color: "text-yellow-400",
            },
            {
              icon: Shield,
              title: "100% Private",
              desc: "Files never leave your browser. Zero data collection.",
              color: "text-green-400",
            },
            {
              icon: Eye,
              title: "Manga Aesthetic",
              desc: "The only PDF tool with main character energy.",
              color: "text-accent",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { type: "spring" } }}
              className="manga-panel bg-zinc-950 p-6 flex flex-col items-center text-center"
            >
              <motion.div
                className={`${item.color} mb-4`}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ duration: 0.4 }}
              >
                <item.icon className="w-10 h-10" />
              </motion.div>
              <h3 className="font-black italic uppercase text-lg mb-2 text-white">
                {item.title}
              </h3>
              <p className="text-sm text-white/60 font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className="border-4 border-black bg-white text-black p-6 transition-shadow hover:shadow-[8px_8px_0px_0px_rgba(255,0,0,1)]"
          >
            <h3 className="font-black italic uppercase text-2xl mb-4 border-b-2 border-black">
              The Mission
            </h3>
            <p className="font-bold text-sm">
              To provide a high-performance, privacy-first PDF experience with
              an unmatched aesthetic.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className="border-4 border-black bg-accent text-white p-6 shadow-[6px_6px_0px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_0px_#000]"
          >
            <h3 className="font-black italic uppercase text-2xl mb-4 border-b-2 border-white">
              The Vision
            </h3>
            <p className="font-bold text-sm italic">
              &quot;Become the number one PDF hero in the multiverse.&quot;
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
