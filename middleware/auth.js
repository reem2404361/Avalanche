/**
 * auth.js — JWT middleware
 * Works with OR without MongoDB.
 * When no DB is connected, it verifies the token and builds a mock req.user
 * from the JWT payload so all protected pages load without crashing.
 */

const jwt = require('jsonwebtoken');

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key   = parts.shift().trim();
    list[key]   = decodeURIComponent(parts.join('=').trim());
  });
  return list;
}

const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      const cookies = parseCookies(req);
      token = cookies.token;
    }

    if (!token) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
      }
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to load from DB if mongoose is connected, otherwise use token payload
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const User = require('../models/User');
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ success: false, message: 'User not found' });
          }
          return res.redirect('/login');
        }
      } else {
        // No DB — build mock user from JWT payload
        req.user = {
          _id:   decoded.id,
          id:    decoded.id,
          role:  decoded.role || 'customer',
          email: decoded.email || 'user@avalanche.eg',
          name:  decoded.name  || 'Avalanche User',
        };
      }
    } catch (_) {
      // Fallback: build mock user from JWT payload
      req.user = {
        _id:   decoded.id,
        id:    decoded.id,
        role:  decoded.role || 'customer',
        email: decoded.email || 'user@avalanche.eg',
        name:  decoded.name  || 'Avalanche User',
      };
    }

    next();
  } catch (err) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    return res.redirect('/login');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      const cookies = parseCookies(req);
      token = cookies.token;
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          const User = require('../models/User');
          req.user = await User.findById(decoded.id).select('-password');
        } else {
          req.user = { _id: decoded.id, id: decoded.id, role: decoded.role || 'customer', email: decoded.email || '', name: decoded.name || '' };
        }
      } catch (_) {
        req.user = { _id: decoded.id, id: decoded.id, role: decoded.role || 'customer', email: decoded.email || '', name: decoded.name || '' };
      }
    }
  } catch (_) { /* silently ignore */ }
  next();
};

module.exports = { auth, optionalAuth };