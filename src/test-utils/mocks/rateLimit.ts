export const rateLimitSuccess = {
  success: true,
  limit: 10,
  remaining: 9,
  reset: 5,
  pending: Promise.resolve({
    success: true,
    limit: 10,
    remaining: 9,
    reset: 5,
  }),
};
