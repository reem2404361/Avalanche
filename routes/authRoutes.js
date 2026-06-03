
const express = require('express');
const router = express.Router();


const {
     signup, 
     login ,
     getProfile } = require('../controllers/authController');

const { auth } = require('../middleware/auth'); 


//Public Routes

router.post('/signup', signup); 
router.post('/login', login); 

//Protected Routes
router.get('/profile', auth, getProfile); // route for getting the user's profile information that only logged-in users can access (protected route) - the auth middleware is used to protect this route

module.exports = router; 