const AppError = require('../utils/AppError');

const notFound = (req, res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// Central error handler: converts known errors into clean JSON responses
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  else if (err.code === 11000) error = new AppError('Email is already registered.', 409);
  else if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token.', 401);
  else if (err.name === 'TokenExpiredError') error = new AppError('Token expired. Please log in again.', 401);
  else if (err.type === 'entity.parse.failed') error = new AppError('Malformed JSON body.', 400);

  const statusCode = error.statusCode || 500;
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') console.error(err);

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: error.isOperational ? error.message : 'Something went wrong on the server.',
  });
};

module.exports = { notFound, errorHandler };
