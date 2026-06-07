const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Server Error';

  if (err.name === 'CastError')         { statusCode = 404; message = 'Resource not found'; }
  if (err.code === 11000)               { statusCode = 400; message = 'This email is already registered'; }
  if (err.name === 'ValidationError')   { statusCode = 400; message = Object.values(err.errors).map(v => v.message).join(', '); }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired, please log in again'; }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;