"use client";

import { useState, useEffect } from "react";
import { GeneratedImage } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  FolderOpen,
  ImageIcon,
  Download,
  Trash2,
  RotateCcw,
  Clock,
  Sparkles,
  Plus,
  MoreVertical,
  Grid,
  List,
} from "lucide-react";

export default function GalleryPage() {
  const [generations, setGenerations] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load from localStorage for now
    const stored = localStorage.getItem("dlm-generations");
    if (stored) {
      setGenerations(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    const updated = generations.filter((g) => g.id !== id);
    setGenerations(updated);
    localStorage.setItem("dlm-generations", JSON.stringify(updated));
    selectedImages.delete(id);
    setSelectedImages(new Set(selectedImages));
  };

  const handleRegenerate = (image: GeneratedImage) => {
    const params = new URLSearchParams();
    if (image.styleId) params.set("style", image.styleId);
    window.location.href = `/generate?${params.toString()}`;
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-[var(--muted)]">
              {generations.length} generation
              {generations.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link href="/generate" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Generation
            </Link>
          </div>
        </div>

        {/* Gallery Content */}
        {generations.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            )}
          >
            {generations.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  "group bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden card-glow transition-all",
                  selectedImages.has(image.id) && "ring-2 ring-[var(--accent)]",
                  viewMode === "list" && "flex items-stretch"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div
                  className={cn(
                    "relative overflow-hidden",
                    viewMode === "grid" ? "aspect-square" : "w-40 shrink-0"
                  )}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.prompt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelect(image.id)}
                    className={cn(
                      "absolute top-3 left-3 w-6 h-6 rounded-full border-2 transition-all",
                      selectedImages.has(image.id)
                        ? "bg-[var(--accent)] border-[var(--accent)]"
                        : "border-white/50 bg-black/30 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {selectedImages.has(image.id) && (
                      <svg
                        className="w-full h-full text-white p-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Quick Actions (Grid Mode) */}
                  {viewMode === "grid" && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRegenerate(image)}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={cn("p-4", viewMode === "list" && "flex-1")}>
                  {/* Style Name */}
                  {image.styleName && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-sm font-medium text-[var(--accent)]">
                        {image.styleName}
                      </span>
                    </div>
                  )}

                  {/* Prompt */}
                  <p
                    className={cn(
                      "text-sm text-white mb-3",
                      viewMode === "grid" ? "line-clamp-2" : "line-clamp-1"
                    )}
                  >
                    {image.prompt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(image.createdAt)}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/10">
                      {image.model}
                    </span>
                  </div>

                  {/* List Mode Actions */}
                  {viewMode === "list" && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                      <button
                        onClick={() => handleRegenerate(image)}
                        className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                      </button>
                      <button className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-red-400 transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--card-bg)] border border-[var(--border)] mb-6">
              <FolderOpen className="w-10 h-10 text-[var(--muted)]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              No generations yet
            </h2>
            <p className="text-[var(--muted)] max-w-md mx-auto mb-8">
              Start creating amazing AI-generated images. Your creations will
              be saved here for easy access.
            </p>
            <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your First Image
            </Link>
          </div>
        )}

        {/* Selection Actions */}
        {selectedImages.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--card-bg)] border border-[var(--border)] shadow-2xl">
            <span className="text-sm text-white">
              {selectedImages.size} selected
            </span>
            <div className="w-px h-6 bg-[var(--border)]" />
            <button className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => {
                const toDelete = Array.from(selectedImages);
                const updated = generations.filter(
                  (g) => !toDelete.includes(g.id)
                );
                setGenerations(updated);
                localStorage.setItem("dlm-generations", JSON.stringify(updated));
                setSelectedImages(new Set());
              }}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => setSelectedImages(new Set())}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-4 h-4 text-[var(--muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
