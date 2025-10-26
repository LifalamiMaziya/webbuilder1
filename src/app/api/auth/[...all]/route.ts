import { createAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const env = process.env as any;
  const auth = createAuth(env);
  return auth.handler(request);
}

export async function POST(request: NextRequest) {
  const env = process.env as any;
  const auth = createAuth(env);
  return auth.handler(request);
}
