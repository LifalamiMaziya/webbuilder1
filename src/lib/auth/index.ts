import { betterAuth } from 'better-auth';
import { D1Adapter } from '@auth/d1-adapter';
import { getDb } from '../db';

export function createAuth(env: any) {
  const db = getDb(env);

  return betterAuth({
    database: D1Adapter(env.DB),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    secret: env.AUTH_SECRET || 'your-secret-key-change-in-production',
    trustedOrigins: [
      'http://localhost:3000',
      'https://webbuilder1.pages.dev',
    ],
  });
}

export async function getSession(request: Request, env: any) {
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
}

export async function requireAuth(request: Request, env: any) {
  const session = await getSession(request, env);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
