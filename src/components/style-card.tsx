"use client";

import { Style } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Zap, Brain } from "lucide-react";

interface StyleCardProps {
  style: Style;
  index?: number;
}

const modelIcons = {
  "nano-banana": Zap,
  "nano-banana-pro": Sparkles,
  openai: Brain,
};

const modelColors = {
  "nano-banana": "text-[#BFFF00]",
  "nano-banana-pro": "text-[#D4FF00]",
  openai: "text-blue-400",
};

export function StyleCard({ style, index = 0 }: StyleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ModelIcon = modelIcons[style.recommendedModel];

  return (
    <Link
      href={`/generate?style=${style.id}`}
      className={cn(
        "group relative block rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 card-glow",
        "transform transition-all duration-300 hover:scale-[1.02] hover:border-[#BFFF00]/50"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Skeleton loader */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Fallback for broken images */}
        {imageError ? (
          <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
            <div className="text-center p-4">
              <Sparkles className="w-12 h-12 text-[#BFFF00] mx-auto mb-2" />
              <span className="text-sm text-white/50">{style.name}</span>
            </div>
          </div>
        ) : (
          <Image
            src={style.exampleImages[0]}
            alt={style.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              imageLoaded ? "opacity-100" : "opacity-0",
              "group-hover:scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Model Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              "bg-black/60 backdrop-blur-sm border border-white/10",
              modelColors[style.recommendedModel]
            )}
          >
            <ModelIcon className="w-3 h-3" />
            <span>
              {style.recommendedModel === "nano-banana-pro"
                ? "PRO"
                : style.recommendedModel === "openai"
                ? "GPT"
                : "FAST"}
            </span>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category Tag */}
          <div className="mb-2">
            <span className="text-xs text-[#BFFF00] font-medium uppercase tracking-wider">
              {style.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#BFFF00] transition-colors">
            {style.name}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {style.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Hover CTA */}
          <div className="mt-3 overflow-hidden">
            <div className="transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#BFFF00]">
                Generate with this style
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
