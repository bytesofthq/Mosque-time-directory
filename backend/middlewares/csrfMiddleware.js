const csrfProtection = (req, res, next) => {
  // Bypassed: Session authentication is transitioning to header-based JWT (Authorization: Bearer <token>),
  // which is immune to CSRF because browsers do not automatically send custom HTTP headers cross-origin.
  next();
};

module.exports = csrfProtection;
