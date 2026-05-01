import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { body, validationResult } from 'express-validator';
import passport from 'passport';

function getAllowedFrontends() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getSafeFrontend(frontendParam) {
  const allowed = getAllowedFrontends();
  if (!frontendParam) return allowed[0] || 'http://localhost:3000';
  const decoded = decodeURIComponent(frontendParam);
  return allowed.includes(decoded) ? decoded : (allowed[0] || 'http://localhost:3000');
}

/**
 * POST /api/auth/register - Create new user account.
 */
export const register = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array().map((e) => e.msg).join('. ') });
      }
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        role: 'user',
      });
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /api/auth/login - Login with email/password.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user?.password) return res.status(401).json({ message: 'Invalid email or password' });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout - Clear auth cookie.
 */
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ message: 'Logged out' });
};

/**
 * GET /api/auth/me - Current user (protected).
 */
export const getMe = (req, res) => res.json(req.user);

/**
 * GET /api/auth/google - Initiate Google OAuth.
 */
export const googleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Google login is not configured' });
  }
  if (!passport._strategy('google')) {
    return res.status(503).json({ message: 'Google strategy is not initialized' });
  }
  const frontend = getSafeFrontend(req.query.frontend);
  const state = Buffer.from(JSON.stringify({ frontend }), 'utf8').toString('base64url');
  passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
};

/**
 * GET /api/auth/google/callback - Google OAuth callback; redirects to frontend with token.
 */
export const googleCallback = (req, res, next) => {
  let frontend = getAllowedFrontends()[0] || 'http://localhost:3000';
  if (req.query.state) {
    try {
      const parsed = JSON.parse(Buffer.from(String(req.query.state), 'base64url').toString('utf8'));
      frontend = getSafeFrontend(parsed.frontend);
    } catch (_) {}
  }
  passport.authenticate('google', (err, user) => {
    if (err) return res.redirect(`${frontend}/login?error=${encodeURIComponent(err.message)}`);
    if (!user) return res.redirect(`${frontend}/login?error=Google+login+failed`);
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${frontend}/auth/callback?token=${token}`);
  })(req, res, next);
};
