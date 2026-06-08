const express = require('express');
const router  = express.Router();

const {
  bookAppointment,
  getConfirmationPage,
  getMyAppointments,
  getAdminDashboard,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentController');

const { auth }     = require('../middleware/auth');
const roleAuth     = require('../middleware/roleAuth');

// ── Customer routes (must be logged in) ───────────────────────────────────────
router.post('/',           auth, bookAppointment);         
router.get('/my',          auth, getMyAppointments);       
router.post('/:id/cancel', auth, cancelAppointment);       
router.post('/:id/reschedule', auth, rescheduleAppointment); 

router.get('/confirmation/:id', getConfirmationPage);

router.get('/admin/dashboard', auth, roleAuth('admin', 'superadmin'), getAdminDashboard);

module.exports = router;