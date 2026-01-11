import { NextRequest, NextResponse } from "next/server";
import { Project, GeneratedImage } from "@/lib/types";

// In-memory storage for demo (in production, use a database)
// This will be replaced by localStorage on the client side
const projects: Map<string, Project> = new Map();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    if (id) {
      // Get specific project
      const project = projects.get(id);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json(project);
    }

    // Get all projects
    const allProjects = Array.from(projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({
      projects: allProjects,
      total: allProjects.length,
    });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, item } = body as { name?: string; item?: GeneratedImage };

    if (!name && !item) {
      return NextResponse.json(
        { error: "Either project name or item is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (name && !item) {
      // Create new empty project
      const project: Project = {
        id: `proj-${Date.now()}`,
        name,
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      projects.set(project.id, project);
      return NextResponse.json(project);
    }

    // Add item to existing or new project
    const projectId = body.projectId || `proj-${Date.now()}`;
    let project = projects.get(projectId);

    if (!project) {
      project = {
        id: projectId,
        name: name || "Untitled Project",
        createdAt: now,
        updatedAt: now,
        items: [],
      };
    }

    if (item) {
      project.items.push(item);
      project.updatedAt = now;
    }

    projects.set(project.id, project);
    return NextResponse.json(project);
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Failed to create/update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const itemId = searchParams.get("itemId");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = projects.get(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (itemId) {
      // Delete specific item from project
      project.items = project.items.filter((item) => item.id !== itemId);
      project.updatedAt = new Date().toISOString();
      projects.set(id, project);
      return NextResponse.json({ success: true, project });
    }

    // Delete entire project
    projects.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
