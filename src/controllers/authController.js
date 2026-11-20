const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({
      status: 'success',
      token: signToken(user._id),
      data: { user: userResponse(user) },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email or password.', 401);
    }
    res.json({
      status: 'success',
      token: signToken(user._id),
      data: { user: userResponse(user) },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  res.json({ status: 'success', data: { user: userResponse(req.user) } });
};
