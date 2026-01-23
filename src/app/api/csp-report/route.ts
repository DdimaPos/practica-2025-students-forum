import * as Sentry from '@sentry/nextjs';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = getFirstIP(request.headers.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.cspReport.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      ip_address: ip,
      endpoint: '/api/csp-report',
      limit_type: 'csp_report',
    });

    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const data = await request.json();

    // Log CSP violation as security event
    Sentry.logger.warn('CSP violation reported', {
      violation_type: 'csp',
      directive:
        data['csp-report']?.['violated-directive'] ||
        data['violated-directive'],
      blocked_uri: data['csp-report']?.['blocked-uri'] || data['blocked-uri'],
      document_uri:
        data['csp-report']?.['document-uri'] || data['document-uri'],
      endpoint: '/api/csp-report',
    });

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('CSP report processing failed', {
      error_message: error.message,
      endpoint: '/api/csp-report',
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/csp-report' },
    });

    return new Response(null, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
