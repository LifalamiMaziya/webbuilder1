import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getE2BClient } from '@/lib/e2b';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1);

    if (!project || project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project: project[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1);

    if (!project || project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Kill the sandbox if it exists
    if (project[0].sandboxId) {
      try {
        const e2bClient = getE2BClient(env.E2B_API_KEY);
        const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);
        await e2bClient.killSandbox(sandbox);
      } catch (e2bError) {
        // Sandbox might already be dead, continue with deletion
        console.error('Failed to kill sandbox:', e2bError);
      }
    }

    // Delete project from database
    await db.delete(projects).where(eq(projects.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const body = await request.json();
    const { name, description } = body;

    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1);

    if (!project || project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    await db
      .update(projects)
      .set({
        name: name || project[0].name,
        description: description !== undefined ? description : project[0].description,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, params.id));

    const updatedProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, params.id))
      .limit(1);

    return NextResponse.json({ project: updatedProject[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
