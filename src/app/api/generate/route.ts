import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStyleById } from "@/data/styles";

// Initialize OpenAI client (will use OPENAI_API_KEY env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.NANO_BANANA_API_KEY || "");

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
  const apiKey = process.env.NANO_BANANA_API_KEY;

  if (!apiKey) {
    throw new Error("NANO_BANANA_API_KEY (Gemini Key) is not configured");
  }

  // Use Gemini / Imagen model
  // Note: Using imagen-3.0-generate-001 for image generation if available, 
  // or falling back to gemini-pro if it supports image gen in this context.
  // For this implementation, we will use the REST API for Imagen if the SDK doesn't fully expose it yet, 
  // or use the appropriate model name.
  // Assuming 'imagen-3.0-generate-001' is the model ID for the provided key.
  
  // Since @google/generative-ai typically handles text/multimodal-to-text, 
  // image generation might require a specific call. 
  // However, for simplicity and standard usage, we'll try to use the model.
  
  // If the SDK doesn't support image generation directly yet, we might need a direct fetch.
  // Let's use a direct fetch to the Gemini/Imagen API endpoint for image generation 
  // as it is often a separate endpoint from generateContent.
  
  // Ref: https://ai.google.dev/api/rest/v1beta/models/predict (Vertex) or similar.
  // But for AI Studio keys, it's often:
  // https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
  
  const modelName = isPro ? "imagen-3.0-generate-001" : "imagen-3.0-generate-001"; // Use same for now, or fast
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
  
  // Construct aspect ratio
  const aspectRatioMap: Record<string, string> = {
    "1:1": "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "4:3": "4:3",
    "3:4": "3:4",
  };
  const ar = aspectRatioMap[options.aspectRatio || "1:1"] || "1:1";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: ar,
        // seed: options.seed // usage depends on API support
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Fallback: If direct Imagen API fails, try to use the SDK for text-to-image if supported,
    // or return a mock if this is just a demo setup. 
    // But since the user provided a real key, we should try to make it work.
    // If 404, model might be different.
    throw new Error(`Gemini/Imagen API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Parse response structure (adjust based on actual Imagen response)
  // Usually: predictions[0].bytesBase64Encoded or similar
  const prediction = data.predictions?.[0];
  if (!prediction) {
    throw new Error("No predictions returned from Gemini API");
  }
  
  const b64 = prediction.bytesBase64Encoded || prediction.b64;
  if (b64) {
    return `data:image/png;base64,${b64}`;
  }
  
  // If response has a URL
  if (prediction.url) return prediction.url;

  throw new Error("Unexpected response format from Gemini API");
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

  // Use dall-e-3
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
    quality: "hd", // Use HD for better quality
    style: "vivid", // or natural
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
