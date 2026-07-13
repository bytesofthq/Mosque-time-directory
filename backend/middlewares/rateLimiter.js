const rateLimitStore = {};

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // 5 attempts per window

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }

  // Clear expired attempts
  rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);

  if (rateLimitStore[ip].length >= maxAttempts) {
    return res.status(429).json({
      message: 'Too many login attempts. Please try again after 15 minutes.'
    });
  }

  rateLimitStore[ip].push(now);
  next();
};

module.exports = loginRateLimiter;
