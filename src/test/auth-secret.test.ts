import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@/db', () => ({ db: {} }));

const loadSecret = async () => {
  vi.resetModules();
  const { authOptions } = await import('@/lib/auth');
  return () => authOptions.secret;
};

describe('NextAuth secret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuses to run in production without NEXTAUTH_SECRET', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', '');
    const secret = await loadSecret();
    expect(secret).toThrow('NEXTAUTH_SECRET must be set in production');
  });

  it('uses the configured secret in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', 'a-real-secret');
    const secret = await loadSecret();
    expect(secret()).toBe('a-real-secret');
  });

  it('keeps a dev fallback outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXTAUTH_SECRET', '');
    const secret = await loadSecret();
    expect(secret()).toBeTruthy();
  });
});
