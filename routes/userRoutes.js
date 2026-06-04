const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile
} = require('../controllers/userController');

const { auth } = require('../middleware/auth');


router.use(auth);// All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/profile', deleteProfile);

module.exports = router;