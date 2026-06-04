
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// statuscode 3shan bb3t diff codes 3ala 7asb login wala signup lel frontend
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id,
     role: user.role 
    },    // the payload (the data i actually wanna send in the token)
    process.env.JWT_SECRET,               // the secret key used to sign the token (signature)
    { 
        expiresIn: process.env.JWT_EXPIRE 
    } // the options (extra settings) (expiration time)
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: 
    {       
      id:       user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      phone:    user.phone,
      location: user.location,
    }
  }); 
};




// SIGNUP

const signup = async (req, res) => {
    try{
        const{name,email,password} = req.body;

        if (!name || !email || !password) {
           return res.status(400).json({
             success: false,
             message: 'Please provide name, email and password'
    });
}


        

        const existingUser = await User.findOne({ email });  //findOne searches for the first document that matches the query. If no document is found, it returns null.

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

        sendTokenResponse(user, 201, res);  

    }
    catch(err){
        console.error(err);

        res.status(500).json(
        { 
            success: false, 
            message: 'Server error'
        });
    }
};


//LOGIN


const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password'); // we need to select the password field manually because i made the pw hidden in the schema (select: false)

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


        sendTokenResponse(user, 200, res); 

    }
    catch(err){
        
        console.error(err);
        
        res.status(500).json(
        {   
            success: false, 
            message: 'Server error'
        });
    }
};


module.exports = {signup, login};
