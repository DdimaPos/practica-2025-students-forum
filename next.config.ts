import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.app https://*.vercel-static.com",
              "font-src 'self' https://*.vercel.app https://*.vercel-static.com data:",
              "img-src 'self' data: blob: https://*.vercel-insights.com https://*.supabase.com",
              "connect-src 'self' https://*.vercel-insights.com https://vitals.vercel-insights.com wss://*.vercel-insights.com",
              "media-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
              'report-uri /api/csp-report',
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'ambient-light-sensor=()',
              'autoplay=()',
              'battery=()',
              'camera=()',
              'display-capture=()',
              'document-domain=()',
              'encrypted-media=()',
              'fullscreen=()',
              'geolocation=()',
              'gyroscope=()',
              'magnetometer=()',
              'microphone=()',
              'midi=()',
              'payment=()',
              'picture-in-picture=()',
              'publickey-credentials-get=()',
              'screen-wake-lock=()',
              'sync-xhr=()',
              'usb=()',
              'web-share=()',
              'xr-spatial-tracking=()',
            ].join(', '),
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
