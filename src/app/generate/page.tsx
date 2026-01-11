"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getStyleById, styles } from "@/data/styles";
import { MODELS, ASPECT_RATIOS, RESOLUTIONS, Style } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Wand2,
  Upload,
  X,
  Sparkles,
  Zap,
  Brain,
  ChevronDown,
  Download,
  RotateCcw,
  Save,
  Loader2,
  ImageIcon,
  Info,
} from "lucide-react";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleId = searchParams.get("style");

  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("nano-banana-pro");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [selectedResolution, setSelectedResolution] = useState("1024");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);

  useEffect(() => {
    if (styleId) {
      const style = getStyleById(styleId);
      if (style) {
        setSelectedStyle(style);
        setPrompt(style.promptTemplate);
        setSelectedModel(style.recommendedModel);
      }
    }
  }, [styleId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          styleId: selectedStyle?.id,
          referenceImageUrl: referenceImage,
          aspectRatio: selectedAspectRatio,
          resolution: selectedResolution,
        }),
      });

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else if (data.error) {
        console.error("Generation error:", data.error);
        // For demo purposes, show a placeholder
        setGeneratedImage(selectedStyle?.exampleImages[0] || null);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      // For demo purposes, show the style's example image
      if (selectedStyle) {
        setGeneratedImage(selectedStyle.exampleImages[0]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    setPrompt(style.promptTemplate);
    setSelectedModel(style.recommendedModel);
    setShowStylePicker(false);
    router.push(`/generate?style=${style.id}`, { scroll: false });
  };

  const modelIcons = {
    "nano-banana": Zap,
    "nano-banana-pro": Sparkles,
    openai: Brain,
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="gradient-text">Generate</span> Image
              </h1>
              <p className="text-[var(--muted)]">
                Create stunning AI-generated images with your chosen style
              </p>
            </div>

            {/* Selected Style */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--muted)]">
                  Selected Style
                </label>
                <button
                  onClick={() => setShowStylePicker(!showStylePicker)}
                  className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  Change style
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      showStylePicker && "rotate-180"
                    )}
                  />
                </button>
              </div>

              {selectedStyle ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={selectedStyle.exampleImages[0]}
                      alt={selectedStyle.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {selectedStyle.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] truncate">
                      {selectedStyle.category}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStyle(null);
                      setPrompt("");
                      router.push("/generate", { scroll: false });
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--muted)]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowStylePicker(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Choose a style</span>
                </button>
              )}

              {/* Style Picker Dropdown */}
              {showStylePicker && (
                <div className="mt-4 max-h-64 overflow-y-auto rounded-xl bg-[var(--card-hover)] border border-[var(--border)]">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleSelect(style)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left",
                        selectedStyle?.id === style.id && "bg-white/10"
                      )}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={style.exampleImages[0]}
                          alt={style.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {style.name}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">
                          {style.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-4">
              <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={4}
                className="w-full p-3 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none transition-all"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                {prompt.length} characters
              </p>
            </div>

            {/* Reference Image Upload */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-4">
              <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                Reference Image (Optional)
              </label>
              {referenceImage ? (
                <div className="relative">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <Image
                      src={referenceImage}
                      alt="Reference"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-[var(--muted)] mb-2" />
                  <span className="text-sm text-[var(--muted)]">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-[var(--muted)] mt-1">
                    PNG, JPG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Model Selection */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-4">
              <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                Model
              </label>
              <div className="grid grid-cols-1 gap-2">
                {MODELS.map((model) => {
                  const Icon =
                    modelIcons[model.id as keyof typeof modelIcons];
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        selectedModel === model.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-[var(--border)] hover:border-[var(--accent)]/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          selectedModel === model.id
                            ? "text-[var(--accent)]"
                            : "text-[var(--muted)]"
                        )}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {model.name}
                          </span>
                          {model.badge && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Controls */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-4">
              <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                Advanced Settings
              </label>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <span className="text-xs text-[var(--muted)] block mb-2">
                  Aspect Ratio
                </span>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setSelectedAspectRatio(ratio.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        selectedAspectRatio === ratio.id
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--card-hover)] text-[var(--muted)] hover:text-white"
                      )}
                    >
                      {ratio.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <span className="text-xs text-[var(--muted)] block mb-2">
                  Resolution
                </span>
                <div className="flex flex-wrap gap-2">
                  {RESOLUTIONS.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setSelectedResolution(res.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                        selectedResolution === res.id
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--card-hover)] text-[var(--muted)] hover:text-white"
                      )}
                    >
                      {res.name}
                      {res.proBadge && (
                        <span className="text-xs opacity-60">PRO</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                "w-full btn-primary text-lg py-4 flex items-center justify-center gap-2",
                (!prompt.trim() || isGenerating) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden">
              {/* Preview Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-medium text-white">Preview</span>
                {generatedImage && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <RotateCcw className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Download className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Save className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Area */}
              <div className="relative aspect-square">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-hover)]">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mx-auto mb-4" />
                      <p className="text-[var(--muted)]">
                        Creating your masterpiece...
                      </p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-hover)]">
                    <div className="text-center p-8">
                      <ImageIcon className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                      <p className="text-[var(--muted)] mb-2">
                        Your generated image will appear here
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Select a style and enter a prompt to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Generation Info */}
              {generatedImage && (
                <div className="p-4 border-t border-[var(--border)]">
                  <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">
                        {selectedStyle?.name || "Custom Generation"}
                      </p>
                      <p className="line-clamp-2">{prompt}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
