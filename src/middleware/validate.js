const { validationResult } = require('express-validator');

// Runs after express-validator chains; returns 400 with field-level errors
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json({
    status: 'fail',
    message: 'Validation failed',
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};
