import { describe, it, expect } from 'vitest';
import { signupFormSchema } from '../../types';

describe('signupFormSchema', () => {
  it('should validate complete signup data', () => {
    const validData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'I am a student',
      yearOfStudy: '3',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing bio', () => {
    const invalidData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      yearOfStudy: '3',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(issue => issue.path.includes('bio'))).toBe(
      true
    );
  });

  it('should reject missing yearOfStudy', () => {
    const invalidData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Bio',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(issue => issue.path.includes('yearOfStudy'))
    ).toBe(true);
  });

  it('should reject bio longer than 160 characters', () => {
    const longBio = 'a'.repeat(161);
    const invalidData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      bio: longBio,
      yearOfStudy: '3',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid yearOfStudy', () => {
    const invalidData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Bio',
      yearOfStudy: '6',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept minimum bio length', () => {
    const validData = {
      email: 'test@utm.md',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'a',
      yearOfStudy: '1',
      password: 'password123',
    };

    const result = signupFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
