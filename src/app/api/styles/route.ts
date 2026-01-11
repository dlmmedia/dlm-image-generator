import { NextRequest, NextResponse } from "next/server";
import { styles, getStyleById, getStylesByCategory, searchStyles } from "@/data/styles";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  try {
    // Get specific style by ID
    if (id) {
      const style = getStyleById(id);
      if (!style) {
        return NextResponse.json({ error: "Style not found" }, { status: 404 });
      }
      return NextResponse.json(style);
    }

    // Filter and search
    let result = styles;

    if (query) {
      result = searchStyles(query);
    }

    if (category && category !== "All") {
      result = result.filter((style) => style.category === category);
    }

    // Pagination
    const offsetNum = parseInt(offset || "0", 10);
    const limitNum = parseInt(limit || "100", 10);
    const paginatedResult = result.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json({
      styles: paginatedResult,
      total: result.length,
      offset: offsetNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Styles API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch styles" },
      { status: 500 }
    );
  }
}
