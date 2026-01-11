"use client";

import { useState, useMemo, useEffect } from "react";
import { styles, getCategories, searchStyles } from "@/data/styles";
import { StyleCard } from "@/components/style-card";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Filter, X } from "lucide-react";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mounted, setMounted] = useState(false);
  const categories = useMemo(() => getCategories(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStyles = useMemo(() => {
    let result = styles;

    if (searchQuery) {
      result = searchStyles(searchQuery);
    }

    if (selectedCategory !== "All") {
      result = result.filter((style) => style.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--accent-2)]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-sm text-[var(--muted)] mb-6">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>100+ Creative AI Styles</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">Explore</span>
            <span className="text-white"> & Create</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
            Discover hundreds of unique AI art styles. From Ghibli animation to
            cyberpunk, find your perfect aesthetic and bring it to life.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search styles, categories, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--muted)]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="sticky top-16 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-[var(--muted)] shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-white hover:bg-[var(--card-hover)] border border-[var(--border)]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-[var(--muted)]">
            <span className="text-white font-semibold">
              {filteredStyles.length}
            </span>{" "}
            styles found
            {searchQuery && (
              <span>
                {" "}
                for "<span className="text-[var(--accent)]">{searchQuery}</span>
                "
              </span>
            )}
            {selectedCategory !== "All" && (
              <span>
                {" "}
                in{" "}
                <span className="text-[var(--accent)]">{selectedCategory}</span>
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredStyles.length > 0 ? (
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
              mounted && "stagger-children"
            )}
          >
            {filteredStyles.map((style, index) => (
              <StyleCard key={style.id} style={style} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--card-bg)] border border-[var(--border)] mb-4">
              <Search className="w-8 h-8 text-[var(--muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No styles found
            </h3>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              Try adjusting your search or filter criteria to find the perfect
              style for your creation.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 btn-secondary"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
