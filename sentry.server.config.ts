// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseIntegration } from '@supabase/sentry-js-integration';

Sentry.init({
  dsn: 'https://e583bd42c76ba86edef5271ddc65acf5@o4510709101232128.ingest.de.sentry.io/4510709101690960',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Add integrations for monitoring
  integrations: [
    // Supabase client monitoring (auth, storage, realtime)
    supabaseIntegration(SupabaseClient, Sentry, {
      tracing: true,
      breadcrumbs: true,
      errors: true,
    }),
    // PostgreSQL query monitoring (for postgres.js / Drizzle ORM)
    Sentry.postgresIntegration(),
    // Native Node fetch integration with deduplication for Supabase calls
    Sentry.nativeNodeFetchIntegration({
      ignoreOutgoingRequests: (url: string) => {
        return url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest`);
      },
    }),
  ],

  // Hook to detect and log slow database queries
  beforeSendSpan: span => {
    // Check if this is a database query span
    if (span.op === 'db.query' || span.op?.startsWith('db.')) {
      const duration =
        span.timestamp && span.start_timestamp
          ? (span.timestamp - span.start_timestamp) * 1000
          : 0;

      // Log warning for slow queries (>500ms)
      if (duration > 500) {
        Sentry.logger.warn('Slow database query detected', {
          duration_ms: duration,
          query: span.description,
          operation: span.op,
          span_id: span.span_id,
        });

        // Add tag for easy filtering in Sentry
        if (span.data) {
          span.data.slow_query = true;
        }
      }
    }

    return span;
  },
});
