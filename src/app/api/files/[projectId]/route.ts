import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getE2BClient } from '@/lib/e2b';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

// GET /api/files/[projectId] - List all files in the project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
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
          eq(projects.id, params.projectId),
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

    if (!project[0].sandboxId) {
      return NextResponse.json(
        { error: 'Sandbox not initialized' },
        { status: 400 }
      );
    }

    const e2bClient = getE2BClient(env.E2B_API_KEY);
    const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);

    const files = await e2bClient.listFiles(sandbox, 'my-app');

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
