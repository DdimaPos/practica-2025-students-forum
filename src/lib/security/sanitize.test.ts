import { describe, it, expect } from 'vitest';
import { sanitize, isValidUuid, sanitizeSearch } from './sanitize';

describe('sanitize', () => {
  describe('XSS prevention', () => {
    it('should strip script tags', () => {
      expect(sanitize('<script>alert(1)</script>')).toBe('');
      expect(sanitize('hello<script>alert(1)</script>world')).toBe(
        'helloworld'
      );
    });

    it('should strip HTML tags', () => {
      expect(sanitize('<div>hello</div>')).toBe('hello');
      expect(sanitize('<img src="x" onerror="alert(1)">')).toBe('');
    });

    it('should handle text with event handler patterns', () => {
      const result1 = sanitize('onclick=alert(1)');
      expect(result1).toBe('onclick=alert(1)');

      const result2 = sanitize('<div onclick="alert(1)">test</div>');
      expect(result2).not.toContain('onclick');
    });

    it('should handle text with URL patterns', () => {
      expect(sanitize('javascript:alert(1)')).toBe('javascript:alert(1)');
      expect(sanitize('data:text/html,<script>alert(1)</script>')).toBe(
        'data:text/html,'
      );
      expect(sanitize('vbscript:msgbox(1)')).toBe('vbscript:msgbox(1)');

      const dangerous = '<a href="javascript:alert(1)">click</a>';
      expect(sanitize(dangerous)).not.toContain('javascript:');
    });

    it('should handle single-encoded HTML entities', () => {
      const encoded = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitize(encoded);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should handle double-encoded HTML entities', () => {
      const doubleEncoded =
        '&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;';
      const result = sanitize(doubleEncoded);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should preserve text with special characters', () => {
      // DOMPurify encodes < and >
      expect(sanitize('5 < 10')).toBe('5 &lt; 10');
      expect(sanitize('10 > 5')).toBe('10 > 5');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitize(null as unknown as string)).toBe('');
      expect(sanitize(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for non-string types', () => {
      expect(sanitize(123 as unknown as string)).toBe('');
      expect(sanitize({} as unknown as string)).toBe('');
    });

    it('should preserve whitespace in text', () => {
      expect(sanitize('  hello  ')).toBe('  hello  ');
    });

    it('should preserve normal text', () => {
      const result = sanitize('Hello, World!');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('real XSS attacks', () => {
    it('should block XSS in img tags', () => {
      const xss = '<img src=x onerror="alert(1)">';
      expect(sanitize(xss)).not.toContain('onerror');
      expect(sanitize(xss)).not.toContain('alert');
    });

    it('should block XSS in script tags', () => {
      const xss = '<script>alert(document.cookie)</script>';
      expect(sanitize(xss)).not.toContain('alert');
      expect(sanitize(xss)).not.toContain('<script>');
    });

    it('should block XSS in event handlers', () => {
      const xss = '<div onload="alert(1)">test</div>';
      expect(sanitize(xss)).not.toContain('onload');
    });

    it('should block javascript: URLs', () => {
      const xss = '<a href="javascript:alert(1)">click</a>';
      expect(sanitize(xss)).not.toContain('javascript:');
    });

    it('should block data: URLs with scripts', () => {
      const xss =
        '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
      expect(sanitize(xss)).not.toContain('<script>');
    });
  });
});

describe('isValidUuid', () => {
  it('should return true for valid UUIDs', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('should return false for invalid UUIDs', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(isValidUuid(null as unknown as string)).toBe(false);
    expect(isValidUuid(undefined as unknown as string)).toBe(false);
  });

  it('should handle UUIDs with whitespace', () => {
    expect(isValidUuid('  550e8400-e29b-41d4-a716-446655440000  ')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    expect(isValidUuid('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
  });
});

describe('sanitizeSearch', () => {
  it('should escape SQL LIKE wildcards', () => {
    expect(sanitizeSearch('100%')).toBe('100\\%');
    expect(sanitizeSearch('test_value')).toBe('test\\_value');
    expect(sanitizeSearch('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should remove dangerous characters', () => {
    expect(sanitizeSearch("test'injection")).toBe('testinjection');
    expect(sanitizeSearch('test"injection')).toBe('testinjection');
    expect(sanitizeSearch('test;injection')).toBe('testinjection');
    expect(sanitizeSearch('test`injection')).toBe('testinjection');
  });

  it('should limit length to 200 characters', () => {
    const longString = 'a'.repeat(300);
    expect(sanitizeSearch(longString).length).toBe(200);
  });

  it('should trim whitespace', () => {
    expect(sanitizeSearch('  hello world  ')).toBe('hello world');
  });

  it('should return empty string for null/undefined', () => {
    expect(sanitizeSearch(null as unknown as string)).toBe('');
    expect(sanitizeSearch(undefined as unknown as string)).toBe('');
  });
});
