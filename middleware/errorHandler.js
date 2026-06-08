const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId (happens when someone passes an invalid MongoDB ID in the URL)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'This email is already registered, please login instead';
  }

  // Mongoose validation error (happens when data doesn't match the model rules)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // JWT invalid token (happens when the token is fake or corrupted)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // JWT expired token (happens when the token is older than 7 days)
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please log in again';
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;