/**
 * Security Sanitization Utilities
 * Protects against XSS attacks by stripping dangerous HTML/scripts
 */

/**
 * Strips HTML tags to prevent XSS attacks
 * Use for all user-generated text content
 */
export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove event handlers that might slip through
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove null bytes
    .split(String.fromCharCode(0)).join('')
    .trim();
}

/**
 * Validates UUID format to prevent injection via malformed IDs
 */
export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidPattern.test(uuid.trim());
}

/**
 * Sanitizes search queries - escapes SQL LIKE wildcards
 */
export function sanitizeSearch(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[%_\\]/g, '\\$&')
    .replace(/['";`]/g, '')
    .slice(0, 200);
}

/**
 * Simple in-memory rate limiter
 * Tracks requests per IP/user and blocks if limit exceeded
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });

    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;

  return { allowed: true, remaining: maxRequests - record.count };
}
