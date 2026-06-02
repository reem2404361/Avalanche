const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(`You are not authorized to access this page`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = roleAuth;

// This middleware checks if the logged in user has permission to access a specific route.