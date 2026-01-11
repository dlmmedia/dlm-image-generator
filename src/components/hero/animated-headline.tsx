"use client";

import { motion } from "framer-motion";

const letterVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      damping: 10,
      stiffness: 50
    }
  }
} as const;

const wordVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span 
      className={`inline-block overflow-hidden ${className}`}
      variants={wordVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={letterVariants}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function AnimatedHeadline() {
  return (
    <div className="relative z-10 text-center py-24 md:py-32 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 backdrop-blur-md mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-[#BFFF00] animate-pulse" />
        <span>100+ Creative AI Styles</span>
      </motion.div>

      <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8">
        <div className="block">
          <SplitText text="EXPLORE" className="text-white" />
        </div>
        <div className="block">
          <motion.span 
            className="text-[#BFFF00] mr-4 inline-block"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1, delay: 0.5 }}
          >
            &
          </motion.span>
          <SplitText text="CREATE" className="text-[#BFFF00]" delay={0.5} />
        </div>
      </h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 font-light"
      >
        Discover unique AI art styles. From Ghibli animation to cyberpunk, find your perfect aesthetic.
      </motion.p>
    </div>
  );
}
