const express  = require('express');
const router   = express.Router();

const { getProfile, updateProfile, updatePassword, deleteProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');


router.get('/me',     auth, getProfile);
router.put('/update', auth, updateProfile);
router.put('/me/password', auth, updatePassword);
router.delete('/delete', auth, deleteProfile);

module.exports = router;