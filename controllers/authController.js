const jwt  = require('jsonwebtoken');

// ── Mock users store (used when MongoDB is not connected) ─────────────────────
const mockUsers = [];
let mockIdCounter = 1;

function isDbConnected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch (_) { return false; }
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
<<<<<<< HEAD
    { id: user._id || user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
=======
    { id: user._id,
     role: user.role 
    },    // the payload (the data i actually wanna send in the token)
    process.env.JWT_SECRET,               // the secret key used to sign the token (signature)
    { 
        expiresIn: process.env.JWT_EXPIRE 
    } // the options (extra settings) (expiration time)
>>>>>>> 7fcf333a6ff27a5e5eb200099ba45b45b2ca79d2
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:       user._id || user.id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      phone:    user.phone    || '',
      location: user.location || '',
    }
  });
};

// ── SIGNUP ────────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (isDbConnected()) {
      const User = require('../models/User');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }
      const user = await User.create({ name, email, password });
      return sendTokenResponse(user, 201, res);
    }

    // ── No-DB mock mode ──
    const exists = mockUsers.find(u => u.email === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const bcrypt = require('bcrypt');
    const hashedPw = await bcrypt.hash(password, 10);

    const newUser = {
      _id:      `mockuser${mockIdCounter++}`,
      name,
      email:    email.toLowerCase(),
      password: hashedPw,
      role:     'customer',
    };
    mockUsers.push(newUser);

    return sendTokenResponse(newUser, 201, res);

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (isDbConnected()) {
      const User = require('../models/User');
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
      return sendTokenResponse(user, 200, res);
    }

    // ── No-DB mock mode ──
    const bcrypt = require('bcrypt');
    const user = mockUsers.find(u => u.email === email.toLowerCase());

    // Allow a hardcoded admin for testing
    if (email === 'admin@avalanche.eg' && password === 'Admin1234') {
      const adminUser = { _id: 'adminmock001', name: 'Admin', email: 'admin@avalanche.eg', role: 'admin' };
      return sendTokenResponse(adminUser, 200, res);
    }

    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    return sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

<<<<<<< HEAD
const getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { signup, login, getProfile };
=======

module.exports = {signup, login};
>>>>>>> 7fcf333a6ff27a5e5eb200099ba45b45b2ca79d2
