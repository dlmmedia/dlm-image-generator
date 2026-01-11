"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, MotionValue, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { BentoGrid } from "./bento-grid";

// Deterministic pseudo-random based on seed (index) to avoid hydration mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const images = [
  { src: "/cases/1/example_proposal_scene_q_realistic.png", alt: "3D Chibi Proposal" },
  { src: "/cases/5/ghibli-style-mona-lisa.png", alt: "Ghibli Style" },
  { src: "/cases/4/example_q_chinese_wedding.png", alt: "Cyberpunk Neon" },
  { src: "/cases/2/example_polaroid_breakout.png", alt: "Minimalist Line Art" },
  { src: "/cases/7/example_personalized_room.png", alt: "Oil Painting" },
  { src: "/cases/8/example_lego_collectible.png", alt: "Pixel Art" },
];

function GalleryCard({ 
  img, 
  index, 
  scrollYProgress, 
  total 
}: { 
  img: { src: string; alt: string }; 
  index: number; 
  scrollYProgress: MotionValue<number>; 
  total: number;
}) {
  // Mouse tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Use a stiff spring for instant yet smooth responsiveness
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 800,
    damping: 35,
    mass: 0.5
  });

  // Grid calculations
  const col = index % 3;
  const row = Math.floor(index / 3);
  
  // Phase 1: Scattered (0 -> 0.4)
  const offset = (index - total / 2) * 80;
  const startY = offset * 4;
  const startX = offset * 8;
  
  // Grid positions relative to center:
  // Compact grid spacing to fit in viewport
  const gridX = (col - 1) * 260; // Reduced from 320
  const gridY = (row - 0.5) * 320; // Reduced from 400

  const yPos = useTransform(
    smoothProgress,
    [0, 0.5, 0.8], // Relaxed range (0 -> 0.5) for proper movement time
    [startY, 0, gridY]
  );
  
  const xPos = useTransform(
    smoothProgress, 
    [0, 0.5, 0.8], // Relaxed range
    [startX, offset, gridX]
  );
  
  const scale = useTransform(
    smoothProgress,
    [0, 0.5, 0.8, 1], // Relaxed range
    [0.6, 1.1, 0.85, 0.8] 
  );

  const opacity = useTransform(
     smoothProgress,
     [0, 0.05, 0.8, 1], // Immediate fade in
     [0.4, 1, 1, 0]
  );

  // Use deterministic rotation values based on index
  const rotationValues = useMemo(() => {
    const startRotation = seededRandom(index + 1) * 40 - 20;
    const endRotation = seededRandom(index + 100) * 10 - 5;
    return [startRotation, endRotation] as const;
  }, [index]);

  const rotate = useTransform(
    smoothProgress,
    [0, 0.5, 0.8], // Relaxed range to allow rotation to be seen
    [rotationValues[0], rotationValues[1], 0]
  );

  return (
    <motion.div
      style={{
        y: yPos,
        x: xPos,
        scale,
        opacity,
        rotate,
        rotateX,
        rotateY,
        zIndex: index,
        perspective: 1000,
      }}
      className="absolute w-56 md:w-72 aspect-[3/4] rounded-2xl cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.1, zIndex: 50 }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] group transition-all duration-300 hover:shadow-[0_0_50px_rgba(191,255,0,0.2)] hover:border-[#BFFF00]/50">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 400px"
          priority={index < 3}
        />
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {img.alt}
          </p>
          <p className="text-[#BFFF00] text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
            View Style
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function StickyScrollGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "end end"], // Start when top of container is 90% into viewport (nearly visible)
    layoutEffect: false,
  });

  const bentoOpacity = useTransform(
    scrollYProgress,
    [0.8, 1], 
    [0, 1]
  );

  const bentoScale = useTransform(
    scrollYProgress,
    [0.8, 1],
    [0.95, 1] 
  );

  // Keep cards visible longer during transition but allow bento interaction
  const bentoPointerEvents = useTransform(
      scrollYProgress,
      value => value > 0.8 ? "auto" : "none"
  );

  return (
    <div ref={containerRef} className="h-[200vh] relative mb-[-100vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center perspective-1000">
        {/* Background blur/ambiance */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />
        
        {/* Gallery Cards */}
        <div className="relative w-full max-w-7xl mx-auto px-4 h-full flex items-center justify-center pointer-events-auto transform-style-3d">
          {images.map((img, index) => (
            <GalleryCard 
              key={index} 
              img={img} 
              index={index} 
              scrollYProgress={scrollYProgress}
              total={images.length}
            />
          ))}
        </div>

        {/* Bento Grid Overlay - Morphs in at the end */}
        <motion.div 
          style={{ 
            opacity: bentoOpacity, 
            scale: bentoScale,
            pointerEvents: bentoPointerEvents 
          }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto max-h-screen overflow-hidden"
        >
          <div className="scale-90 md:scale-100"> {/* Slight scale down on mobile/tablet to ensure fit */}
            <BentoGrid />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-sm flex flex-col items-center gap-2 z-20"
      >
        <span className="uppercase tracking-widest text-xs">Keep Scrolling</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#BFFF00] to-transparent animate-pulse" />
      </motion.div>
    </div>
  );
}
