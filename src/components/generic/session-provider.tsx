'use client'

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function SentrySession() {
  useEffect(() => {
    let sessionId = sessionStorage.getItem('sessionId');

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }

    Sentry.setUser({ sessionId });
  }, []);

  return null
}
