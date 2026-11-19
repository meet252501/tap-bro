import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const dbHealth = await checkDatabaseHealth();
  const totalResponseTimeMs = Date.now() - startTime;

  const isHealthy = dbHealth.ok;

  const responsePayload = {
    status: isHealthy ? 'ok' : 'degraded',
    service: 'Tap-Bro Review AI Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'railway-postgresql',
      connected: dbHealth.ok,
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error,
    },
    responseTimeMs: totalResponseTimeMs,
    environment: process.env.NODE_ENV || 'production',
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Health-Status': isHealthy ? 'pass' : 'fail',
    },
  });
}

export async function HEAD() {
  const dbHealth = await checkDatabaseHealth();
  return new NextResponse(null, {
    status: dbHealth.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'X-Health-Status': dbHealth.ok ? 'pass' : 'fail',
    },
  });
}
