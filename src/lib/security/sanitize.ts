
function encodeHtmlEntities(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x3c;/gi, '<')
    .replace(/&#60;/gi, '<')
    .replace(/&#x3e;/gi, '>')
    .replace(/&#62;/gi, '>');
}


function fullyDecodeHtmlEntities(str: string, maxIterations: number = 10): string {
  let decoded = str;
  let prev = '';
  let iterations = 0;

  while (decoded !== prev && iterations < maxIterations) {
    prev = decoded;
    decoded = decodeHtmlEntities(decoded);
    iterations++;
  }

  return decoded;
}


export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const decoded = fullyDecodeHtmlEntities(input);

  const cleaned = decoded
    // script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // all other HTML tags
    .replace(/<[^>]*>/g, '')
    // event handlers that might slip through
    .replace(/on\w+\s*=/gi, '')
    // javascript: URLs
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // null bytes
    .split(String.fromCharCode(0)).join('')
    .trim();

  // encode special characters to prevent any residual XSS
  return encodeHtmlEntities(cleaned);
}


export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidPattern.test(uuid.trim());
}


export function sanitizeSearch(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[%_\\]/g, '\\$&')
    .replace(/['";`]/g, '')
    .slice(0, 200);
}
