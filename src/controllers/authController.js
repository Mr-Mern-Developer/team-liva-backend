const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

/**
 * POST /api/auth/register
 * Open only until the first account exists; after that it needs an admin token.
 * That keeps initial setup easy without leaving the endpoint public forever.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }

  const existingCount = await User.countDocuments();
  if (existingCount > 0) {
    const header = req.headers.authorization || '';
    let isAdmin = false;
    if (header.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(header.slice(7).trim(), process.env.JWT_SECRET);
        isAdmin = payload.role === 'admin';
      } catch {
        isAdmin = false;
      }
    }
    if (!isAdmin) {
      throw ApiError.forbidden('Registration is closed. Ask an admin to create your account.');
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    // The very first account always becomes the admin.
    role: existingCount === 0 ? 'admin' : role === 'admin' ? 'admin' : 'ops',
  });

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Logged in',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** GET /api/auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

module.exports = { register, login, me };
