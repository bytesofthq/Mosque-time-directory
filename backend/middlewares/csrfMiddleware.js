const csrfProtection = (req, res, next) => {
  // Safe methods do not require CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfHeader = req.headers['x-csrf-token'];
  const csrfCookie = req.cookies?.csrfToken;

  if (!csrfCookie || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: 'CSRF token mismatch or missing. Please refresh the page.' });
  }

  next();
};

module.exports = csrfProtection;
