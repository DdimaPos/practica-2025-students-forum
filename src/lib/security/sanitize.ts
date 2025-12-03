/**
 * Encodes HTML special characters to prevent XSS
 */
function encodeHtmlEntities(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Decodes HTML entities that attackers might use to bypass filters
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x2f;/gi, '/')
    .replace(/&#47;/gi, '/')
    .replace(/&#x3c;/gi, '<')
    .replace(/&#60;/gi, '<')
    .replace(/&#x3e;/gi, '>')
    .replace(/&#62;/gi, '>');
}

/**
 * Strips HTML tags and encodes special characters to prevent XSS attacks
 * Use for all user-generated text content
 */
export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const cleaned = input
    // decode HTML entities to catch encoded attacks
    .replace(/&[#\w]+;/gi, (match) => decodeHtmlEntities(match))
    // script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // all other HTML tags
    .replace(/<[^>]*>/g, '')
    // event handlers that might slip through
    .replace(/on\w+\s*=/gi, '')
    // javascript: URLs (including encoded variants)
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // null bytes
    .split(String.fromCharCode(0)).join('')
    .trim();

  // remaining special characters to prevent any residual XSS
  return encodeHtmlEntities(cleaned);
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
