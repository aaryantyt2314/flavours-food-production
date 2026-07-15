import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEnvReport } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const env = getEnvReport();
  const checks = {
    env: env.ok,
    database: false,
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Health check database error:', error);
  }

  const ok = checks.env && checks.database;

  return NextResponse.json(
    {
      ok,
      checks,
      env: {
        missingRequired: env.missingRequired,
        invalid: env.invalid,
        warnings: env.warnings,
      },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
