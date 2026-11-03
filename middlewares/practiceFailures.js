const parseSetting = (value, minimum) => {
  const number = Number(value);
  return value && Number.isInteger(number) && number >= minimum ? number : null;
};

// Off unless a container sets these, so courses can practise handling failures.
export const practiceFailures = () => {
  const ratePerMinute = parseSetting(process.env.RATE_LIMIT_PER_MINUTE, 1);
  const failEvery = parseSetting(process.env.FAIL_EVERY_N_REQUESTS, 2);

  let windowStart = 0;
  let requestsInWindow = 0;
  let requestsSinceFailure = 0;

  return (req, res, next) => {
    if (ratePerMinute) {
      const now = Date.now();
      if (now - windowStart >= 60_000) {
        windowStart = now;
        requestsInWindow = 0;
      }
      requestsInWindow += 1;
      if (requestsInWindow > ratePerMinute) {
        const retryAfter = Math.ceil((windowStart + 60_000 - now) / 1000);
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Too many requests" });
      }
    }

    if (failEvery) {
      requestsSinceFailure += 1;
      if (requestsSinceFailure >= failEvery) {
        requestsSinceFailure = 0;
        return res.status(503).json({ error: "Service temporarily unavailable" });
      }
    }

    next();
  };
};
