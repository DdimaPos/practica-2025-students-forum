import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const rateLimits = {
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 m'),
    prefix: 'rl:search',
  }),
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(6, '1 m'),
    prefix: 'rl:login',
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(4, '1 m'),
    prefix: 'rl:register',
  }),
  postView: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(100, '1 m'),
    prefix: 'rl:post',
  }),
  channelView: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(100, '1 m'),
    prefix: 'rl:channel',
  }),
  createChannel: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(1, '1 m'),
    prefix: 'rl:create-channel',
  }),
  createPost: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(2, '1 m'),
    prefix: 'rl:create-post',
  }),
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 m'),
    prefix: 'rl:comment',
  }),
  postVote: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(30, '1 m'),
    prefix: 'rl:postVote',
  }),
  verifyMFA: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '1 m'),
    prefix: 'rl:verifyMFA',
  }),
  mfaSettings: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(1, '1 m'),
    prefix: 'rl:mfaSettings',
  }),
  resetPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(1, '1 m'),
    prefix: 'rl:resetPassword',
  }),
  cspReport: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(60, '1 m'),
    prefix: 'rl:cspReport',
  }),
};
