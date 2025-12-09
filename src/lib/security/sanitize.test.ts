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

    it('should remove event handlers', () => {
      expect(sanitize('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitize('onerror=malicious()')).toBe('malicious()');
    });

    it('should remove javascript: URLs', () => {
      expect(sanitize('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove data: URLs', () => {
      // data: is stripped, and script tags are also stripped
      expect(sanitize('data:text/html,<script>alert(1)</script>')).toBe(
        'text/html,'
      );
    });

    it('should remove vbscript: URLs', () => {
      expect(sanitize('vbscript:msgbox(1)')).toBe('msgbox(1)');
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

    it('should encode special characters in output', () => {
      // '< b >' is treated as an HTML tag and stripped, leaving 'a  c'
      // Use characters that won't be parsed as tags
      expect(sanitize('5 < 10')).toBe('5 &lt; 10');
      expect(sanitize('10 > 5')).toBe('10 &gt; 5');
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

    it('should trim whitespace', () => {
      expect(sanitize('  hello  ')).toBe('hello');
    });

    it('should preserve normal text', () => {
      const result = sanitize('Hello, World!');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
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
