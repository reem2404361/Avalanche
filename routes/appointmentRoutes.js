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
router.post('/',           auth, bookAppointment);         // Book appointment
router.get('/my',          auth, getMyAppointments);       // View my appointments
router.post('/:id/cancel', auth, cancelAppointment);       // Cancel appointment
router.post('/:id/reschedule', auth, rescheduleAppointment); // Reschedule

// ── Confirmation page (auth optional – the ID alone is the "receipt") ─────────
// We use auth here so req.user is available for the 404 view, but we don't
// strictly block unauthenticated users from seeing their own confirmation.
router.get('/confirmation/:id', getConfirmationPage);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/dashboard', auth, roleAuth('admin', 'superadmin'), getAdminDashboard);

module.exports = router;