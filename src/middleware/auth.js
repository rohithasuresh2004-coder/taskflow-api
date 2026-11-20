const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Verifies the Bearer token and attaches the user to req.user
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Provide a Bearer token.', 401);
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('The user for this token no longer exists.', 401);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
