import { NextRequest, NextResponse } from "next/server";
import { Project, GeneratedImage } from "@/lib/types";
import { put, list, del } from "@vercel/blob";

// Helper to get projects from Blob storage
async function getProjects(): Promise<Map<string, Project>> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.warn("BLOB_READ_WRITE_TOKEN not configured, using in-memory storage");
    return projectsMemory;
  }

  try {
    const { blobs } = await list({ token: blobToken });
    const projectBlob = blobs.find((blob) => blob.pathname === "projects.json");

    if (!projectBlob) {
      return new Map();
    }

    const response = await fetch(projectBlob.url);
    if (!response.ok) throw new Error("Failed to fetch projects.json");
    
    const data = await response.json();
    // Convert array back to Map
    return new Map(data.map((p: Project) => [p.id, p]));
  } catch (error) {
    console.error("Error reading projects from Blob:", error);
    return new Map();
  }
}

// Helper to save projects to Blob storage
async function saveProjects(projectsMap: Map<string, Project>) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    projectsMemory = projectsMap;
    return;
  }

  try {
    const projectsArray = Array.from(projectsMap.values());
    await put("projects.json", JSON.stringify(projectsArray), {
      access: "public",
      addRandomSuffix: false, // Try to keep consistent URL if supported or just overwrite by path
      token: blobToken,
    });
  } catch (error) {
    console.error("Error saving projects to Blob:", error);
  }
}

// In-memory fallback
let projectsMemory: Map<string, Project> = new Map();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    const projects = await getProjects();

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
    const { name, item } = body as { name?: string; item?: GeneratedImage; projectId?: string };

    if (!name && !item) {
      return NextResponse.json(
        { error: "Either project name or item is required" },
        { status: 400 }
      );
    }

    const projects = await getProjects();
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
      await saveProjects(projects);
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
    await saveProjects(projects);
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

    const projects = await getProjects();
    const project = projects.get(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (itemId) {
      // Delete specific item from project
      project.items = project.items.filter((item) => item.id !== itemId);
      project.updatedAt = new Date().toISOString();
      projects.set(id, project);
      await saveProjects(projects);
      return NextResponse.json({ success: true, project });
    }

    // Delete entire project
    projects.delete(id);
    await saveProjects(projects);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
