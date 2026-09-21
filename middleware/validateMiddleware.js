const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

/**
 * Runs after express-validator chains. Collects any validation
 * errors and throws a single 400 ApiError with the details.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => `${e.path}: ${e.msg}`);
    throw new ApiError(400, 'Validation failed', formatted);
  }
  next();
};

module.exports = validate;
