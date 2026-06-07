/**
 * roleAuth.js
 * Usage: roleAuth('admin')  or  roleAuth('admin', 'superadmin')
 */
const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should never happen if auth middleware runs first, but guard anyway
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      const error = new Error('You are not authorized to access this resource');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = roleAuth;