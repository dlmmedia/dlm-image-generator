"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";

// Mock data for carousel items, each with multiple morphing images
const carouselItems = [
  {
    id: 1,
    title: "Anime & Manga",
    description: "Transform photos into Ghibli or classic anime styles",
    images: [
      "/cases/5/ghibli-style-mona-lisa.png",
      "/cases/16/anime_style_badge.png",
      "/cases/1/example_proposal_scene_q_realistic.png",
    ],
    tags: ["Ghibli", "Anime", "Cel Shaded"]
  },
  {
    id: 2,
    title: "3D Characters",
    description: "Create cute 3D avatars and scenes",
    images: [
      "/cases/12/example_3d_collectible_couple_box.png",
      "/cases/13/example_photo_to_3d_q.png",
      "/cases/25/example_minimalist_3d_toilet.png",
    ],
    tags: ["3D Render", "Chibi", "Toy"]
  },
  {
    id: 3,
    title: "Artistic Styles",
    description: "Oil painting, watercolor, and sketches",
    images: [
      "/cases/7/example_personalized_room.png",
      "/cases/3/example_vintage_poster.png",
      "/cases/2/example_polaroid_breakout.png",
    ],
    tags: ["Oil Paint", "Watercolor", "Sketch"]
  },
  {
    id: 4,
    title: "Retro & Pixel",
    description: "Nostalgic 8-bit and vintage aesthetics",
    images: [
      "/cases/8/example_lego_collectible.png",
      "/cases/4/example_q_chinese_wedding.png",
      "/cases/17/retro_crt_computer_boot_screen.png",
    ],
    tags: ["Pixel Art", "Retro", "Cyberpunk"]
  },
];

function MorphingCard({ item }: { item: typeof carouselItems[0] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [item.images.length]);

  return (
    <motion.div 
      className="relative w-[300px] md:w-[350px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 group cursor-pointer shrink-0 snap-center"
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      {/* Morphing Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={item.images[currentImageIndex]}
              alt={item.title}
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex gap-2 mb-3">
          {item.tags.map((tag, i) => (
            <span 
              key={i} 
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/10 text-white/70 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#BFFF00] transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-white/60 mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-2 text-[#BFFF00] text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <Sparkles className="w-4 h-4" />
          <span>Try this style</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          key={currentImageIndex}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
          className="h-full bg-[#BFFF00]"
        />
      </div>
    </motion.div>
  );
}

export function CapabilityCarousel() {
  return (
    <div className="w-full py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Endless <span className="text-[#BFFF00]">Possibilities</span>
          </h2>
          <p className="text-white/60 max-w-lg">
            Explore diverse artistic styles and transformations powered by our advanced AI models.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          {/* Optional navigation buttons could go here */}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="flex overflow-x-auto pb-8 pt-4 px-4 md:px-8 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 mask-image-linear-gradient">
        {carouselItems.map((item) => (
          <MorphingCard key={item.id} item={item} />
        ))}
        {/* Duplicate items for infinite scroll illusion if needed, or just let it be a slider */}
        {carouselItems.map((item) => (
          <MorphingCard key={`dup-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}
