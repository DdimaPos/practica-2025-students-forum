import { vi } from 'vitest';

export function createRedirectMock() {
  return vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  });
}
