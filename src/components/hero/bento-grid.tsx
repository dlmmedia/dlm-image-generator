"use client";

import { motion } from "framer-motion";
import { ImageIcon, Video, Wand2, Zap, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";

const items = [
  {
    title: "Create Image",
    description: "Generate stunning visuals with AI",
    icon: ImageIcon,
    className: "md:col-span-2 md:row-span-2",
    image: "/cases/10/example_maga_hat_cartoon.png",
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    title: "Create Video",
    description: "Bring static images to life",
    icon: Video,
    className: "md:col-span-1 md:row-span-1",
    image: "/cases/11/example_ps2_gta_shrek.png",
    color: "from-purple-500/20 to-indigo-500/20"
  },
  {
    title: "Edit Image",
    description: "Professional editing tools",
    icon: Wand2,
    className: "md:col-span-1 md:row-span-1",
    image: "/cases/13/example_photo_to_3d_q.png",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Upscale",
    description: "Enhance quality to 4K",
    icon: Zap,
    className: "md:col-span-1 md:row-span-1",
    color: "from-yellow-500/20 to-orange-500/20"
  },
  {
    title: "AI Stylist",
    description: "Try on any outfit instantly",
    icon: Sparkles,
    className: "md:col-span-1 md:row-span-1",
    color: "from-pink-500/20 to-rose-500/20"
  }
];

export function BentoGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`relative group overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 ${item.className}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {item.image && (
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 mix-blend-overlay">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-[#BFFF00] group-hover:text-black transition-colors duration-300">
                  <item.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
