"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="manga-title">THE <span className="text-white">LEGEND</span></h1>
        
        <div className="manga-card p-8 md:p-12 mb-12">
          <p className="text-xl font-bold italic mb-6 border-b-4 border-accent pb-4 uppercase">
            VanillaPDF was forged in the fires of late-night coding sessions and a steady diet of ramen and 90s anime.
          </p>
          <div className="space-y-6 text-zinc-600 font-medium">
            <p>
              Born from the frustration of bloated, slow, and privacy-invading PDF editors, 
              VanillaPDF aims to be the fastest, most aesthetically pleasing tool in your arsenal.
            </p>
            <p>
              Every operation is performed locally in your browser. No files are ever uploaded. 
              No data is ever stored. Your privacy is our absolute priority.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-4 border-black bg-white text-black p-6">
            <h3 className="font-black italic uppercase text-2xl mb-4 border-b-2 border-black">The Mission</h3>
            <p className="font-bold text-sm">To provide a high-performance, privacy-first PDF experience with an unmatched aesthetic.</p>
          </div>
          <div className="border-4 border-black bg-accent text-white p-6 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-2xl mb-4 border-b-2 border-white">The Vision</h3>
            <p className="font-bold text-sm italic">"Become the number one PDF hero in the multiverse."</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
