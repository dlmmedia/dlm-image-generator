import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { getStyleById } from "@/data/styles";

// Initialize OpenAI client (will use OPENAI_API_KEY env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Nano Banana API configuration
const NANO_BANANA_API_URL = "https://api.nanobanana.com/v1/generate";
const NANO_BANANA_PRO_API_URL = "https://api.nanobanana.com/v1/generate-pro";

interface GenerateRequest {
  prompt: string;
  model: "nano-banana" | "nano-banana-pro" | "openai";
  styleId?: string;
  referenceImageUrl?: string;
  aspectRatio?: string;
  resolution?: string;
  seed?: number;
}

async function generateWithNanoBanana(
  prompt: string,
  isPro: boolean,
  options: {
    referenceImageUrl?: string;
    aspectRatio?: string;
    resolution?: string;
    seed?: number;
  }
): Promise<string> {
  const apiUrl = isPro ? NANO_BANANA_PRO_API_URL : NANO_BANANA_API_URL;
  const apiKey = process.env.NANO_BANANA_API_KEY;

  if (!apiKey) {
    throw new Error("NANO_BANANA_API_KEY is not configured");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      reference_image: options.referenceImageUrl,
      aspect_ratio: options.aspectRatio || "1:1",
      resolution: options.resolution || "1024",
      seed: options.seed,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Nano Banana API error: ${error}`);
  }

  const data = await response.json();
  return data.image_url || data.url || data.output;
}

async function generateWithOpenAI(
  prompt: string,
  options: {
    referenceImageUrl?: string;
    aspectRatio?: string;
    resolution?: string;
  }
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Map aspect ratio to OpenAI size format
  const sizeMap: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
    "1:1": "1024x1024",
    "16:9": "1792x1024",
    "9:16": "1024x1792",
    "4:3": "1024x1024",
    "3:4": "1024x1792",
  };

  const size = sizeMap[options.aspectRatio || "1:1"] || "1024x1024";

  // Use gpt-image-1 (latest OpenAI image model)
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size,
    quality: "high",
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in OpenAI response");
  }

  return imageUrl;
}

async function saveToBlob(imageUrl: string, prompt: string): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    // If no blob token, return the original URL
    return imageUrl;
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `generations/${timestamp}-${Math.random().toString(36).substring(7)}.png`;

    // Upload to Vercel Blob
    const { url } = await put(filename, imageBlob, {
      access: "public",
      token: blobToken,
    });

    return url;
  } catch (error) {
    console.error("Error saving to Blob:", error);
    // Return original URL if blob storage fails
    return imageUrl;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, model, styleId, referenceImageUrl, aspectRatio, resolution, seed } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Get style info if provided
    const style = styleId ? getStyleById(styleId) : null;

    let imageUrl: string;

    try {
      switch (model) {
        case "nano-banana":
          imageUrl = await generateWithNanoBanana(prompt, false, {
            referenceImageUrl,
            aspectRatio,
            resolution,
            seed,
          });
          break;

        case "nano-banana-pro":
          imageUrl = await generateWithNanoBanana(prompt, true, {
            referenceImageUrl,
            aspectRatio,
            resolution,
            seed,
          });
          break;

        case "openai":
          imageUrl = await generateWithOpenAI(prompt, {
            referenceImageUrl,
            aspectRatio,
            resolution,
          });
          break;

        default:
          return NextResponse.json({ error: "Invalid model specified" }, { status: 400 });
      }
    } catch (apiError) {
      console.error("API Error:", apiError);
      
      // For demo purposes, return the style's example image if available
      if (style && style.exampleImages.length > 0) {
        return NextResponse.json({
          imageUrl: style.exampleImages[0],
          isDemo: true,
          message: "API keys not configured. Showing example image.",
          generationId: `demo-${Date.now()}`,
        });
      }

      return NextResponse.json(
        { 
          error: "Generation failed. Please ensure API keys are configured.",
          details: apiError instanceof Error ? apiError.message : "Unknown error"
        },
        { status: 500 }
      );
    }

    // Save to Vercel Blob for persistence
    const savedUrl = await saveToBlob(imageUrl, prompt);

    return NextResponse.json({
      imageUrl: savedUrl,
      generationId: `gen-${Date.now()}`,
      model,
      styleId,
      styleName: style?.name,
      prompt,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
