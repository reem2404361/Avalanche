const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id || user.id, role: user.role, email: user.email, name: user.name }, // the payload (the data i actually wanna send in the token)
    process.env.JWT_SECRET, // the secret key used to sign the token (signature)
    { expiresIn: process.env.JWT_EXPIRE } // the options (extra settings) (expiration time)
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:       user._id ,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      phone:    user.phone    || '',
      location: user.location || '',
    }
  });
};


const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
         success: false, 
         message: 'Please provide name, email and password' 
        });
    }


    // checks if a user with the same email already exists in the database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
           success: false,
            message: 'An account with this email already exists'
           });
      }
      const user = await User.create({ 
        name, 
        email,
        password
       });

      return sendTokenResponse(user, 201, res); // 201 = something was created
    

  
  }     catch(err){
        console.error(err);

        res.status(500).json(
        { 
            success: false, 
            message: 'Server error'
        });
    }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials' //no hints for security
            });
        }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

      return sendTokenResponse(user, 200, res); // 200 = success
    }

   catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, message: 'Server error' 
    });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { signup, login, getProfile };