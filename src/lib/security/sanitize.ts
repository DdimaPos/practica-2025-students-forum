import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Is created a window object for Node.js environment
const createDOMPurify = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return DOMPurify;
  } else {
    // And here is created Node.js environment (for tests)
    const { window } = new JSDOM('');

    return DOMPurify(window);
  }
};

const purify = createDOMPurify();

export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
