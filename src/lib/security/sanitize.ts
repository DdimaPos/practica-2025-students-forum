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
