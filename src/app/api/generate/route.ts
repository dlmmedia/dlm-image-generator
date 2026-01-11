import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { getStyleById } from "@/data/styles";

// Initialize OpenAI client (will use OPENAI_API_KEY env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  prompt: string;
  model: "nano-banana" | "nano-banana-pro" | "openai";
  styleId?: string;
  referenceImageUrl?: string;
  aspectRatio?: string;
  resolution?: string;
  seed?: number;
}

// Helper function to extract base64 data from a data URL
function extractBase64FromDataUrl(dataUrl: string): { base64: string; mimeType: string } | null {
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }
  
  return {
    mimeType: matches[1],
    base64: matches[2],
  };
}

// Helper function to fetch an image URL and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`);
  }
  
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  
  return {
    base64,
    mimeType: blob.type || 'image/png',
  };
}

async function generateWithGeminiImagen(
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
    throw new Error("NANO_BANANA_API_KEY (Gemini API Key) is not configured");
  }

  // Use Imagen 4 model via Google AI Studio
  // Pro uses the full quality model, regular uses the fast model
  const modelName = isPro ? "imagen-4.0-generate-001" : "imagen-4.0-fast-generate-001";
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

  console.log(`[Imagen] Generating with model: ${modelName}, aspect ratio: ${ar}`);
  console.log(`[Imagen] Prompt: ${prompt.substring(0, 100)}...`);
  
  // Build the instance object
  interface ImagenInstance {
    prompt: string;
    referenceImages?: Array<{
      referenceImage: {
        bytesBase64Encoded: string;
      };
      referenceType: string;
    }>;
  }
  
  const instance: ImagenInstance = {
    prompt: prompt,
  };
  
  // Process reference image if provided
  if (options.referenceImageUrl) {
    console.log(`[Imagen] Processing reference image...`);
    
    try {
      let imageData: { base64: string; mimeType: string } | null = null;
      
      // Check if it's a data URL (base64 encoded)
      if (options.referenceImageUrl.startsWith('data:')) {
        imageData = extractBase64FromDataUrl(options.referenceImageUrl);
      } else {
        // Fetch the image from URL
        imageData = await fetchImageAsBase64(options.referenceImageUrl);
      }
      
      if (imageData) {
        console.log(`[Imagen] Reference image loaded, size: ${imageData.base64.length} chars`);
        
        // Add reference image to the instance
        // Using REFERENCE_TYPE_STYLE to apply the style from the reference image
        instance.referenceImages = [
          {
            referenceImage: {
              bytesBase64Encoded: imageData.base64,
            },
            referenceType: "REFERENCE_TYPE_STYLE",
          }
        ];
      }
    } catch (error) {
      console.error(`[Imagen] Failed to process reference image:`, error);
      // Continue without reference image rather than failing
    }
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        sampleCount: 1,
        aspectRatio: ar,
        personGeneration: "allow_adult",
        safetySetting: "block_low_and_above",
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Imagen] API Error: ${response.status} - ${errorText}`);
    
    // Try to parse error for better messaging
    try {
      const errorJson = JSON.parse(errorText);
      const errorMessage = errorJson.error?.message || errorText;
      throw new Error(`Imagen API error: ${errorMessage}`);
    } catch {
      throw new Error(`Imagen API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  const data = await response.json();
  console.log(`[Imagen] Response received, parsing...`);
  
  // Parse response structure for Imagen 4
  const prediction = data.predictions?.[0];
  if (!prediction) {
    console.error(`[Imagen] No predictions in response:`, JSON.stringify(data));
    throw new Error("No predictions returned from Imagen API");
  }
  
  // Imagen 4 returns base64 encoded image
  const b64 = prediction.bytesBase64Encoded;
  if (b64) {
    console.log(`[Imagen] Successfully generated image (base64 length: ${b64.length})`);
    return `data:image/png;base64,${b64}`;
  }
  
  // Check for alternative response formats
  if (prediction.image?.imageBytes) {
    return `data:image/png;base64,${prediction.image.imageBytes}`;
  }
  
  if (prediction.url) {
    return prediction.url;
  }

  console.error(`[Imagen] Unexpected response format:`, JSON.stringify(prediction));
  throw new Error("Unexpected response format from Imagen API");
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

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in OpenAI response");
  }

  return imageUrl;
}

async function saveToBlob(imageUrl: string): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    // If no blob token, return the original URL
    return imageUrl;
  }

  try {
    let imageBlob: Blob;

    // Handle base64 data URLs
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data from data URL
      const base64Data = imageUrl.split(',')[1];
      const mimeType = imageUrl.split(':')[1].split(';')[0];
      
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: mimeType });
    } else {
      // Fetch the image from URL
      const imageResponse = await fetch(imageUrl);
      imageBlob = await imageResponse.blob();
    }

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

    switch (model) {
      case "nano-banana":
        imageUrl = await generateWithGeminiImagen(prompt, false, {
          referenceImageUrl,
          aspectRatio,
          resolution,
          seed,
        });
        break;

      case "nano-banana-pro":
        imageUrl = await generateWithGeminiImagen(prompt, true, {
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

    // Save to Vercel Blob for persistence
    const savedUrl = await saveToBlob(imageUrl);

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
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: "Image generation failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
