import { describe, it, expect } from 'vitest';

describe('OAuth userType detection', () => {
  const getUserType = (email: string) => {
    const emailDomain = email.split('@')[1];

    return /\.(utm\.md)$/i.test(emailDomain) ? 'verified' : 'student';
  };

  it('should set userType to verified for subdomain utm.md emails', () => {
    expect(getUserType('test@cs.utm.md')).toBe('verified');
    expect(getUserType('student@info.utm.md')).toBe('verified');
  });

  it('should set userType to student for direct utm.md emails', () => {
    expect(getUserType('student@utm.md')).toBe('student');
    expect(getUserType('prof@utm.md')).toBe('student');
  });

  it('should set userType to student for non-utm.md emails', () => {
    expect(getUserType('user@gmail.com')).toBe('student');
    expect(getUserType('student@other.edu')).toBe('student');
  });

  it('should handle case insensitive domain matching', () => {
    expect(getUserType('user@CS.UTM.MD')).toBe('verified');
    expect(getUserType('user@cs.Utm.Md')).toBe('verified');
  });
});

describe('OAuth profile picture extraction', () => {
  const extractProfilePicture = (userMetadata: Record<string, unknown>) => {
    return (
      userMetadata?.avatar_url ||
      userMetadata?.picture ||
      userMetadata?.photoURL ||
      null
    );
  };

  it('should extract profile picture from various metadata fields', () => {
    expect(extractProfilePicture({ avatar_url: 'url1' })).toBe('url1');
    expect(extractProfilePicture({ picture: 'url2' })).toBe('url2');
    expect(extractProfilePicture({ photoURL: 'url3' })).toBe('url3');
  });

  it('should return null when no picture available', () => {
    expect(extractProfilePicture({})).toBe(null);
    expect(extractProfilePicture({ name: 'John' })).toBe(null);
  });

  it('should prioritize avatar_url over others', () => {
    const metadata = {
      avatar_url: 'avatar',
      picture: 'pic',
      photoURL: 'photo',
    };
    expect(extractProfilePicture(metadata)).toBe('avatar');
  });
});
