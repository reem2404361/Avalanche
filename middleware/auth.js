
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // imports the user model

const auth = async (req, res,next) => {
    try{

        let token;

        if( req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {

            //splits the header value by space and takes the second part (the token itself) (the first part is 'Bearer')
            token = req.headers.authorization.split(' ')[1]; 

        }

        if(!token) 
        {
            return res.status(401).json({
                message: 'Unauthorized',
                success: false
            }); 
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifies the token using the secret key and decodes the payload to get the user ID

        req.user = await User.findById(decoded.id).select('-password'); //excluding the password field for security reasons(double defense)

        if(!req.user) // checks if the user was not found in the database
        {
            return res.status(401).json(
            {
                message: 'Unauthorized - user not found',
                success: false
            }); // sends a 401 Unauthorized response if the user is not found
        }

        next(); // if everything is fine, it calls the next middleware or route handler to proceed with the request

    }
    catch(err){
        res.status(401).json({
             message: 'Unauthorized',
              success: false  //success to make it easier for the frontend to handle the response
    });
    }

};

module.exports = { auth }; 