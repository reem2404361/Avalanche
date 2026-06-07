/**
 * appointmentController.js
 *
 * Uses in-memory mock storage so the whole flow works WITHOUT a database.
 * When your teammate connects MongoDB, swap the mock array for real Mongoose calls.
 *
 * Bugs fixed vs the original:
 *  1. bookAppointment now does res.redirect() directly (not JSON) when called
 *     from a normal form POST, and returns JSON only when the request
 *     explicitly wants JSON (fetch/AJAX from the scheduler JS).
 *  2. getConfirmationPage no longer uses req.body (GET requests have no body).
 *     It now stores the booking details inside the mock appointment object so
 *     the confirmation page always has real data.
 *  3. req.user guard added – if somehow the middleware is bypassed, it fails
 *     gracefully instead of crashing.
 *  4. cancelAppointment checks ownership before cancelling.
 */

// ── In-memory store (replace with Mongoose when DB is ready) ─────────────────
const mockAppointments = [];
let   nextId = 1;

// ── Helpers ───────────────────────────────────────────────────────────────────
const VALID_SLOTS = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'];

function wantsJSON(req) {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
  );
}

// ── bookAppointment ───────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  // Guard: auth middleware should always set req.user, but just in case
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { date, timeSlot, fullName, email, phone, age, notes } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!date || !timeSlot || !fullName || !email || !phone) {
    const msg = 'All fields (date, timeSlot, fullName, email, phone) are required.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    // For plain form submit, go back with error (simple approach)
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    const msg = 'Please provide a valid email address.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  const phoneRegex = /^01[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    const msg = 'Please provide a valid Egyptian phone number (e.g. 01012345678).';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  if (age && (Number(age) < 18 || Number(age) > 100)) {
    const msg = 'Age must be between 18 and 100.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  if (!VALID_SLOTS.includes(timeSlot)) {
    const msg = 'Invalid time slot selected.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  // ── Check for double-booking (same date + same slot) ────────────────────
  const dateObj      = new Date(date);
  const alreadyBooked = mockAppointments.find(
    a => a.status !== 'cancelled' &&
         a.timeSlot === timeSlot &&
         a.date.toDateString() === dateObj.toDateString()
  );
  if (alreadyBooked) {
    const msg = 'That date and time slot is already taken. Please choose another.';
    if (wantsJSON(req)) return res.status(409).json({ success: false, message: msg });
    return res.status(409).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  // ── Create appointment ────────────────────────────────────────────────────
  const newAppointment = {
    _id: `mockid${nextId++}`,
    date: dateObj,
    timeSlot,
    fullName,
    email,
    phone,
    age:    age    ? Number(age) : null,
    notes:  notes  || '',
    status: 'confirmed',
    userId: req.user._id || req.user.id,
    userEmail: req.user.email,
    // Pre-format the date string so the confirmation page doesn't need to re-parse
    selectedDate: dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    createdAt: new Date(),
  };

  mockAppointments.push(newAppointment);

  const redirectUrl = `/appointments/confirmation/${newAppointment._id}`;

  // fetch() call → return JSON so JS can redirect
  if (wantsJSON(req)) {
    return res.status(201).json({ success: true, redirectUrl });
  }

  // Normal form POST → redirect directly
  return res.redirect(redirectUrl);
};

// ── getConfirmationPage ───────────────────────────────────────────────────────
// FIX: GET requests have no body. We stored everything we need in the appointment object.
const getConfirmationPage = async (req, res) => {
  const { id } = req.params;
  const appointment = mockAppointments.find(apt => apt._id === id);

  if (!appointment) {
    return res.status(404).render('404', {
      title:   'Avalanche | Not Found',
      message: 'Appointment not found.',
      user:    req.user || null,
    });
  }

  return res.render('confirmed', {
    title: 'Avalanche | Appointment Confirmed',
    appointmentId: id,
    bookingDetails: {
      fullName:     appointment.fullName,
      email:        appointment.email,
      phone:        appointment.phone,
      selectedDate: appointment.selectedDate,  // already formatted
      timeSlot:     appointment.timeSlot,
      status:       appointment.status,
    },
  });
};

// ── getMyAppointments ─────────────────────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  const userAppointments = mockAppointments
    .filter(apt => apt.userEmail === req.user.email)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (wantsJSON(req)) {
    return res.json({ success: true, appointments: userAppointments });
  }

  return res.render('User_Dashboard', {
    title:        'Avalanche | My Appointments',
    appointments: userAppointments,
    user:         req.user,
  });
};

// ── getAdminDashboard ─────────────────────────────────────────────────────────
const getAdminDashboard = async (req, res) => {
  // Shape data the same way the EJS template expects it
  const appointments = mockAppointments.length > 0
    ? mockAppointments.map(apt => ({
        ...apt,
        user: { name: apt.fullName, email: apt.email },
      }))
    : [
        // Seed data so the admin dashboard always has something to show
        {
          _id: 'mockid123',
          date: new Date('2026-06-15'),
          timeSlot: '09:00 - 12:00',
          status: 'confirmed',
          user: { name: 'Ahmed Ali', email: 'ahmed@test.com' },
        },
        {
          _id: 'mockid456',
          date: new Date('2026-06-16'),
          timeSlot: '12:00 - 15:00',
          status: 'pending',
          user: { name: 'Sara Mohamed', email: 'sara@test.com' },
        },
      ];

  return res.render('Admin_Dashboard', {
    title: 'Avalanche | Admin Control Core',
    appointments,
    metrics: {
      revenue:     'EGP 2,400,000',
      capacity:    '840 kWp',
      activeNodes: '10 / 10',
    },
    user: req.user || null,
  });
};

// ── cancelAppointment ─────────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const appointment = mockAppointments.find(apt => apt._id === id);

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  // Only the owner OR an admin can cancel
  const isOwner = req.user && appointment.userEmail === req.user.email;
  const isAdmin = req.user && req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  appointment.status = 'cancelled';

  if (isAdmin) return res.redirect('/appointments/admin/dashboard');
  return res.redirect('/appointments/my');
};

// ── rescheduleAppointment ─────────────────────────────────────────────────────
const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'New date and time slot are required.' });
  }
  if (!VALID_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ success: false, message: 'Invalid time slot.' });
  }

  const appointment = mockAppointments.find(apt => apt._id === id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  const dateObj = new Date(date);
  appointment.date         = dateObj;
  appointment.timeSlot     = timeSlot;
  appointment.status       = 'confirmed';
  appointment.selectedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return res.status(200).json({
    success:     true,
    message:     'Appointment rescheduled successfully.',
    redirectUrl: `/appointments/confirmation/${id}`,
  });
};

module.exports = {
  bookAppointment,
  getConfirmationPage,
  getMyAppointments,
  getAdminDashboard,
  cancelAppointment,
  rescheduleAppointment,
};