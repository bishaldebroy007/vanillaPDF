"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { tools } from "@/lib/tools";

const cardVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  }),
};

const heroVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -3 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.7, type: "spring", stiffness: 80 },
  },
};

// Pre-computed particle data to avoid Math.random during render
const PARTICLES = [
  { id: 0, left: "8%", delay: 0.2, duration: 4.5, size: 3, yEnd: -150, xEnd: 12 },
  { id: 1, left: "15%", delay: 1.8, duration: 5.2, size: 4, yEnd: -170, xEnd: -18 },
  { id: 2, left: "25%", delay: 3.1, duration: 3.8, size: 2, yEnd: -130, xEnd: 25 },
  { id: 3, left: "35%", delay: 0.7, duration: 6.1, size: 5, yEnd: -190, xEnd: -8 },
  { id: 4, left: "42%", delay: 2.4, duration: 4.0, size: 3, yEnd: -145, xEnd: 20 },
  { id: 5, left: "55%", delay: 4.0, duration: 5.5, size: 4, yEnd: -160, xEnd: -22 },
  { id: 6, left: "63%", delay: 1.2, duration: 3.5, size: 2, yEnd: -135, xEnd: 15 },
  { id: 7, left: "72%", delay: 3.6, duration: 6.0, size: 5, yEnd: -180, xEnd: -12 },
  { id: 8, left: "80%", delay: 0.5, duration: 4.8, size: 3, yEnd: -155, xEnd: 28 },
  { id: 9, left: "88%", delay: 2.9, duration: 5.0, size: 4, yEnd: -165, xEnd: -20 },
  { id: 10, left: "48%", delay: 4.5, duration: 3.2, size: 2, yEnd: -125, xEnd: 10 },
  { id: 11, left: "95%", delay: 1.5, duration: 4.3, size: 3, yEnd: -140, xEnd: -15 },
];

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/40"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, p.yEnd],
            x: [0, p.xEnd],
            opacity: [0, 0.7, 0],
            scale: [1, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function ToolCard({ tool, index }) {
  const Icon = tool.icon;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link href={`/tools/${tool.id}`} aria-label={`Open ${tool.name}`}>
        <motion.div
          className="manga-card group p-8 flex flex-col items-center text-center h-full cursor-pointer overflow-hidden"
          whileHover={{
            y: -6,
            x: -2,
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="absolute top-5 right-5 text-8xl font-black text-black/5 select-none pointer-events-none"
            whileHover={{ scale: 1.1, opacity: 0.12 }}
            animate={{
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {tool.kanji}
          </motion.div>

          <motion.div
            className={`p-4 mb-6 rounded-full border-4 border-black ${tool.color} text-white`}
            whileHover={{
              scale: 1.15,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.4 },
            }}
          >
            <Icon className="w-8 h-8" />
          </motion.div>

          <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter group-hover:text-accent transition-colors">
            {tool.name}
          </h3>

          <p className="text-sm font-medium leading-relaxed text-zinc-600 mb-8">
            {tool.description}
          </p>

          <motion.div
            className="mt-auto flex items-center gap-2 font-bold text-accent uppercase tracking-wider text-xs"
            whileHover={{ x: 8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Access Tool <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const whySectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: whySectionRef,
    offset: ["start end", "end start"],
  });
  const whyX = useTransform(scrollYProgress, [0, 1], [60, -20]);
  const whyOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-16 relative"
      >
        <Particles />
        <motion.h1
          className="manga-title"
          animate={{
            textShadow: [
              "8px 8px 0px #000",
              "10px 10px 0px #000",
              "8px 8px 0px #000",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          UNLEASH THE <span className="text-white">POWER</span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-3xl font-bold uppercase tracking-widest text-white/80 max-w-2xl mx-auto border-y-2 border-accent py-2 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Ultimate PDF Manipulation{" "}
          <span className="text-accent italic text-glow">Extreme Edition</span>
        </motion.p>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl px-4" id="tools-grid">
        {tools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {/* Why VanillaPDF Section */}
      <motion.div
        ref={whySectionRef}
        style={{ opacity: whyOpacity }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 p-12 border-4 border-accent relative w-full bg-zinc-950 screentone-red overflow-hidden"
      >
        <motion.div
          className="absolute top-0 right-0 p-4 text-accent/20 font-black text-9xl -z-10 select-none"
          style={{ x: whyX }}
        >
          最強
        </motion.div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="max-w-xl">
            <motion.h2
              className="text-5xl font-black italic uppercase text-white mb-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              Why <span className="text-accent text-glow">VanillaPDF?</span>
            </motion.h2>
            <ul className="space-y-4 font-bold text-lg">
              {[
                { num: "01", text: "Lightning fast processing with local execution. No server wait." },
                { num: "02", text: "Your files never leave your browser. Total privacy." },
                { num: "03", text: "The only PDF editor that gives you main character energy." },
              ].map((item, i) => (
                <motion.li
                  key={item.num}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, type: "spring" }}
                >
                  <motion.span
                    className="bg-accent text-white p-1 mt-1 text-xs"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                  >
                    {item.num}
                  </motion.span>
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Link href="/tools" className="manga-button text-2xl text-center">
              Get Started Now!
            </Link>
            <p className="text-center text-xs uppercase tracking-widest text-white/40">
              No registration required
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
