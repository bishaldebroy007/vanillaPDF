"use client";

import { motion } from "framer-motion";
import {
  Combine,
  Scissors,
  Image as ImageIcon,
  Zap,
  FileText,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one master document.",
    icon: <Combine className="w-8 h-8" />,
    color: "bg-red-500",
    kanji: "結合",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split your PDF into separate files.",
    icon: <Scissors className="w-8 h-8" />,
    color: "bg-zinc-800",
    kanji: "分割",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert each page of your PDF into high-quality images.",
    icon: <ImageIcon className="w-8 h-8" />,
    color: "bg-red-700",
    kanji: "画像",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce the file size of your PDF without losing quality.",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-zinc-900",
    kanji: "圧縮",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center mb-16"
      >
        <h1 className="manga-title">
          UNLEASH THE <span className="text-white">POWER</span>
        </h1>
        <p className="text-xl md:text-3xl font-bold uppercase tracking-widest text-white/80 max-w-2xl mx-auto border-y-2 border-accent py-2 bg-black/40 backdrop-blur-sm">
          Ultimate PDF Manipulation{" "}
          <span className="text-accent italic">Very First Edition!</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl px-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/tools/${tool.id}`}>
              <div className="manga-card group p-8 flex flex-col items-center text-center h-full cursor-pointer overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] text-8xl font-black text-black/5 select-none pointer-events-none group-hover:text-accent/10 transition-colors">
                  {tool.kanji}
                </div>

                <div
                  className={`p-4 mb-6 rounded-full border-4 border-black ${tool.color} text-white group-hover:scale-110 transition-transform`}
                >
                  {tool.icon}
                </div>

                <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter group-hover:text-accent transition-colors">
                  {tool.name}
                </h3>

                <p className="text-sm font-medium leading-relaxed text-zinc-600 mb-8">
                  {tool.description}
                </p>

                <div className="mt-auto flex items-center gap-2 font-bold text-accent group-hover:translate-x-2 transition-transform uppercase tracking-wider text-xs">
                  Access Tool <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-32 p-12 border-4 border-accent relative w-full bg-zinc-950 screentone-red overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 text-accent/20 font-black text-9xl -z-10 select-none">
          最強
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black italic uppercase text-white mb-6">
              Why <span className="text-accent">VanillaPDF?</span>
            </h2>
            <ul className="space-y-4 font-bold text-lg">
              <li className="flex gap-4 items-start">
                <span className="bg-accent text-white p-1 mt-1 text-xs">
                  01
                </span>
                <span>
                  Lightning fast processing with local execution. No server
                  wait.
                </span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-accent text-white p-1 mt-1 text-xs">
                  02
                </span>
                <span>Your files never leave your browser. Total privacy.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="bg-accent text-white p-1 mt-1 text-xs">
                  03
                </span>
                <span>
                  The only PDF editor that gives you main character energy.
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <button className="manga-button text-2xl">Get Started Now!</button>
            <p className="text-center text-xs uppercase tracking-widest text-white/40">
              No registration required
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
