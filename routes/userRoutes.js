const express  = require('express');
const router   = express.Router();
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/me',     auth, getProfile);
router.put('/update', auth, updateProfile);
router.get('/',       auth, roleAuth('admin', 'superadmin'), getAllUsers);

module.exports = router;