
const jwt      = require('jsonwebtoken'); 
const mongoose = require('mongoose');
const User     = require('../models/User');



//cookies are automatically sent after creation
function parseCookies(req) {
  const list   = {}; 
  const header = req.headers.cookie;  

  if (!header) 
    return list; //lw mafeesh cookie returns empty 

  //bt2sm el cookie le tokens (key ) w el values
  header.split(';').forEach(cookie => {
    const parts = cookie.split('='); //splits cookie
    const key   = parts.shift().trim(); //takes the first element 
    list[key]   = decodeURIComponent(parts.join('=').trim());
  });
  return list;
}

const auth = async (req, res, next) => {
  try {
    let token;

 //checks the auth header (frontend manually adds)
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    //lw mafesh auth header bshof el cookies
    if (!token) {
      token = parseCookies(req).token;
    }

    //accept handles responses 
    if (!token) {
        //lw howa API
      if (req.headers.accept?.includes('application/json')) {
        return res.status(401).json(
            { success: false, message: 'Not authorized, no token' }
        );
      }
      //lw la2 yb2a page route
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);// verifies the token using the secret key and decodes the payload to get the user ID

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ 
            success: false, message: 'User not found'
         });
      }
      return res.redirect('/login');
    }

    next();
  } 
  catch (err) {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(401).json({
         success: false, 
         message: 'Invalid or expired token' 
        });
    }
    return res.redirect('/login');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      token = parseCookies(req).token;
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) { /* ignores (no token) */ }
  next();
};

module.exports = { auth, optionalAuth };