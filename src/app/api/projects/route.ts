import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getE2BClient } from '@/lib/e2b';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/projects - List all projects for the current user
export async function GET(request: NextRequest) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(projects.updatedAt);

    return NextResponse.json({ projects: userProjects });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project in database
    const projectId = uuidv4();
    const now = new Date();

    await db.insert(projects).values({
      id: projectId,
      userId: session.user.id,
      name,
      description: description || null,
      sandboxId: null,
      status: 'creating',
      createdAt: now,
      updatedAt: now,
    });

    // Create E2B sandbox in background
    try {
      const e2bClient = getE2BClient(env.E2B_API_KEY);
      const sandbox = await e2bClient.createNextJsSandbox();

      // Start dev server
      const { url } = await e2bClient.startDevServer(sandbox);

      // Update project with sandbox ID
      await db
        .update(projects)
        .set({
          sandboxId: sandbox.id,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      return NextResponse.json({
        project: project[0],
        url,
      });
    } catch (e2bError: any) {
      // Update project status to error
      await db
        .update(projects)
        .set({
          status: 'error',
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      return NextResponse.json(
        { error: 'Failed to create sandbox: ' + e2bError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
