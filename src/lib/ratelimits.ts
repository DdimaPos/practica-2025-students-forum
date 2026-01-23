import { Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const environment = process.env.NODE_ENV;

const createNoOpRateLimiter = () => ({
  limit: async () => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
    pending: Promise.resolve({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
  }),
});
const redis =
  environment === 'development' || environment === 'test'
    ? null
    : Redis.fromEnv();

const createRateLimit = (tokens: number, window: Duration, prefix: string) => {
  if (environment === 'development' || environment === 'test') {
    return createNoOpRateLimiter();
  }

  return new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.fixedWindow(tokens, window),
    prefix: prefix,
  });
};

export const rateLimits = {
  search: createRateLimit(10, '1 m', 'rl:search'),
  login: createRateLimit(6, '1 m', 'rl:login'),
  register: createRateLimit(4, '1 m', 'rl:register'),
  postView: createRateLimit(100, '1 m', 'rl:post'),
  channelView: createRateLimit(100, '1 m', 'rl:channel'),
  createChannel: createRateLimit(1, '1 m', 'rl:create-channel'),
  createPost: createRateLimit(2, '1 m', 'rl:create-post'),
  comment: createRateLimit(10, '1 m', 'rl:comment'),
  postVote: createRateLimit(30, '1 m', 'rl:postVote'),
  verifyMFA: createRateLimit(5, '1 m', 'rl:verifyMFA'),
  mfaSettings: createRateLimit(1, '1 m', 'rl:mfaSettings'),
  resetPassword: createRateLimit(1, '1 m', 'rl:resetPassword'),
  cspReport: createRateLimit(60, '1 m', 'rl:cspReport'),
};
