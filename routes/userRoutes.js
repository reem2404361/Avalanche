<<<<<<< HEAD
const express  = require('express');
const router   = express.Router();
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/me',     auth, getProfile);
router.put('/update', auth, updateProfile);
router.get('/',       auth, roleAuth('admin', 'superadmin'), getAllUsers);
=======
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
>>>>>>> 7fcf333a6ff27a5e5eb200099ba45b45b2ca79d2

module.exports = router;