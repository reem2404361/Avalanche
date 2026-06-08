const Appointment = require('../models/Appointment');
const Order = require('../models/Order');

const VALID_SLOTS = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'];

function wantsJSON(req) {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
  );
}

const bookAppointment = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { date, timeSlot, fullName, email, phone, address, notes } = req.body;

  if (!date || !timeSlot || !fullName || !email || !phone || !address) {
    const msg = 'All fields (date, timeSlot, fullName, email, phone, address) are required.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  if (address.length < 5) {
    const msg = 'Address must be at least 5 characters.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
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

  if (!VALID_SLOTS.includes(timeSlot)) {
    const msg = 'Invalid time slot selected.';
    if (wantsJSON(req)) return res.status(400).json({ success: false, message: msg });
    return res.status(400).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  const dateObj = new Date(date);
  
  const alreadyBooked = await Appointment.findOne({
    status: { $ne: 'cancelled' },
    timeSlot: timeSlot,
    date: {
      $gte: new Date(dateObj.setHours(0,0,0,0)),
      $lt: new Date(dateObj.setHours(23,59,59,999))
    }
  });

  if (alreadyBooked) {
    const msg = 'That date and time slot is already taken. Please choose another.';
    if (wantsJSON(req)) return res.status(409).json({ success: false, message: msg });
    return res.status(409).send(`<script>alert("${msg}"); history.back();</script>`);
  }

  let location = address.split(',')[0].trim();
  if (location.length > 50) location = location.substring(0, 50);

  const newAppointment = await Appointment.create({
    user: req.user._id || req.user.id,
    date: dateObj,
    timeSlot,
    fullName,
    email,
    phone,
    address,
    location: location,
    notes: notes || '',
    status: 'pending',
  });

  const redirectUrl = `/appointments/confirmation/${newAppointment._id}`;

  if (wantsJSON(req)) {
    return res.status(201).json({ success: true, redirectUrl });
  }

  return res.redirect(redirectUrl);
};

const getConfirmationPage = async (req, res) => {
  const { id } = req.params;
  
  try {
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).render('404', {
        title: 'Avalanche | Not Found',
        message: 'Appointment not found.',
        user: req.user || null,
      });
    }

    const selectedDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return res.render('confirmed', {
      title: 'Avalanche | Appointment Confirmed',
      appointmentId: id,
      bookingDetails: {
        fullName: appointment.fullName,
        email: appointment.email,
        phone: appointment.phone,
        address: appointment.address,
        location: appointment.location,
        selectedDate: selectedDate,
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      },
    });
  } catch (err) {
    return res.status(404).render('404', {
      title: 'Avalanche | Not Found',
      message: 'Appointment not found.',
      user: req.user || null,
    });
  }
};

const getMyAppointments = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  const userAppointments = await Appointment.find({ user: req.user._id || req.user.id })
    .sort({ createdAt: -1 });

  if (wantsJSON(req)) {
    return res.json({ success: true, appointments: userAppointments });
  }

  return res.render('User_Dashboard', {
    title: 'Avalanche | My Appointments',
    appointments: userAppointments,
    user: req.user,
  });
};

const getAdminDashboard = async (req, res) => {
  let appointments = [];
  let orders = [];
  
  try {
    appointments = await Appointment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  } catch(err) {
    appointments = [];
  }
  
  try {
    orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  } catch(err) {
    orders = [];
  }
  
  const appointmentsForDisplay = appointments.map(apt => ({
    _id: apt._id,
    date: apt.date,
    timeSlot: apt.timeSlot,
    status: apt.status,
    fullName: apt.fullName,
    email: apt.email,
    phone: apt.phone,
    address: apt.address,
    location: apt.location,
    user: { name: apt.fullName, email: apt.email }
  }));
  
  const recentActivity = [];
  
  appointments.forEach(apt => {
    recentActivity.push({
      type: apt.status === 'approved' ? 'Appointment Approved' :
            apt.status === 'cancelled' ? 'Appointment Cancelled' : 'Appointment Created',
      user: apt.fullName,
      date: apt.createdAt,
      details: `${apt.timeSlot} on ${new Date(apt.date).toLocaleDateString()}`
    });
  });
  
  orders.forEach(order => {
    recentActivity.push({
      type: order.status === 'cancelled' ? 'Order Cancelled' : 
            order.status === 'updated' ? 'Order Updated' : 'Order Created',
      user: order.user ? order.user.name : 'Unknown',
      date: order.createdAt,
      details: `Order Total: EGP ${order.totalPrice || 0}`
    });
  });
  
  recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const activeAppointments = appointmentsForDisplay.filter(apt => apt.status !== 'cancelled');
  const activeOrders = orders.filter(order => 
    order.status !== 'cancelled' && 
    order.status !== 'rejected' &&
    order.status !== 'completed'
  );
  
  return res.render('Admin_Dashboard', {
    title: 'Avalanche | Admin Control Core',
    appointments: activeAppointments,
    orders: activeOrders,
    recentActivity: recentActivity.slice(0, 15),
    ongoingOrders: activeOrders.length,
    user: req.user || null,
  });
};

const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  
  try {
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isOwner = req.user && (appointment.user.toString() === (req.user._id || req.user.id).toString());
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    if (isAdmin) return res.redirect('/appointments/admin/dashboard');
    return res.redirect('/appointments/my');
  } catch (err) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }
};

const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'New date and time slot are required.' });
  }
  if (!VALID_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ success: false, message: 'Invalid time slot.' });
  }

  try {
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const dateObj = new Date(date);
    appointment.date = dateObj;
    appointment.timeSlot = timeSlot;
    appointment.status = 'pending';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      redirectUrl: `/appointments/confirmation/${id}`,
    });
  } catch (err) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();
    return res.status(200).json({ success: true, appointment });
  } catch (err) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }
};

const getAppointmentsByUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const userAppointments = await Appointment.find({ user: req.user._id || req.user.id })
    .sort({ date: 1 });

  return res.json({ success: true, appointments: userAppointments });
};

const getAllAppointments = async (req, res) => {
  const appointments = await Appointment.find().sort({ date: 1 });
  
  const pendingFirst = [...appointments].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(a.date) - new Date(b.date);
  });

  if (wantsJSON(req)) {
    return res.json({ success: true, appointments: pendingFirst });
  }

  return res.render('Admin_calendar', {
    title: 'Avalanche | Calendar',
    appointments: pendingFirst,
    user: req.user,
  });
};

module.exports = {
  bookAppointment,
  getConfirmationPage,
  getMyAppointments,
  getAdminDashboard,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  getAppointmentsByUser,
  getAllAppointments,
};