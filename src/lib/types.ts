export interface Style {
  id: string;
  name: string;
  category: string;
  promptTemplate: string;
  exampleImages: string[];
  tags: string[];
  recommendedModel: "nano-banana" | "nano-banana-pro" | "openai";
  author?: string;
  authorLink?: string;
}

export interface GenerationRequest {
  prompt: string;
  model: "nano-banana" | "nano-banana-pro" | "openai";
  styleId?: string;
  referenceImageUrl?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  resolution?: "1024" | "2048" | "4096";
  seed?: number;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  styleId?: string;
  styleName?: string;
  createdAt: string;
  aspectRatio?: string;
  resolution?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: GeneratedImage[];
}

export const CATEGORIES = [
  "All",
  "Characters & Avatars",
  "Art Styles",
  "Photography",
  "3D & CGI",
  "Concept Art",
  "Product",
  "Architecture",
  "Illustration",
  "Experimental",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MODELS = [
  { id: "nano-banana", name: "Nano Banana", description: "Fast & efficient", badge: null },
  { id: "nano-banana-pro", name: "Nano Banana Pro", description: "Best 4K quality", badge: "PRO" },
  { id: "openai", name: "OpenAI Image", description: "Reasoning-heavy prompts", badge: "NEW" },
] as const;

export const ASPECT_RATIOS = [
  { id: "1:1", name: "Square", width: 1024, height: 1024 },
  { id: "16:9", name: "Landscape", width: 1024, height: 576 },
  { id: "9:16", name: "Portrait", width: 576, height: 1024 },
  { id: "4:3", name: "Standard", width: 1024, height: 768 },
  { id: "3:4", name: "Tall", width: 768, height: 1024 },
] as const;

export const RESOLUTIONS = [
  { id: "1024", name: "1K", description: "1024px" },
  { id: "2048", name: "2K", description: "2048px" },
  { id: "4096", name: "4K", description: "4096px", proBadge: true },
] as const;
