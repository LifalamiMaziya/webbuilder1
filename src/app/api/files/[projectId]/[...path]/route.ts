import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getE2BClient } from '@/lib/e2b';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

// GET /api/files/[projectId]/[...path] - Read a file
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
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

    const filePath = `my-app/${params.path.join('/')}`;
    const e2bClient = getE2BClient(env.E2B_API_KEY);
    const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);

    const content = await e2bClient.readFile(sandbox, filePath);

    return NextResponse.json({ content, path: filePath });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to read file' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// PUT /api/files/[projectId]/[...path] - Update a file
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const body = await request.json();
    const { content } = body;

    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

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

    const filePath = `my-app/${params.path.join('/')}`;
    const e2bClient = getE2BClient(env.E2B_API_KEY);
    const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);

    await e2bClient.writeFile(sandbox, filePath, content);

    return NextResponse.json({ success: true, path: filePath });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update file' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST /api/files/[projectId]/[...path] - Create a new file or directory
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  try {
    const env = process.env as any;
    const session = await requireAuth(request, env);
    const db = getDb(env);

    const body = await request.json();
    const { type, content = '' } = body;

    if (!type || (type !== 'file' && type !== 'directory')) {
      return NextResponse.json(
        { error: 'Type must be "file" or "directory"' },
        { status: 400 }
      );
    }

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

    const filePath = `my-app/${params.path.join('/')}`;
    const e2bClient = getE2BClient(env.E2B_API_KEY);
    const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);

    if (type === 'directory') {
      await e2bClient.createDirectory(sandbox, filePath);
    } else {
      await e2bClient.createFile(sandbox, filePath, content);
    }

    return NextResponse.json({ success: true, path: filePath });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create file/directory' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// DELETE /api/files/[projectId]/[...path] - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
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

    const filePath = `my-app/${params.path.join('/')}`;
    const e2bClient = getE2BClient(env.E2B_API_KEY);
    const sandbox = await e2bClient.getSandboxById(project[0].sandboxId);

    await e2bClient.deleteFile(sandbox, filePath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
