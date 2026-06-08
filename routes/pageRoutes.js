const express = require('express');
const router  = express.Router();

const { auth, optionalAuth } = require('../middleware/auth');

router.get('/',       (req, res) => res.render('landingpage', { user: null }));
router.get('/login',  (req, res) => res.render('login',       { user: null }));
router.get('/signup', (req, res) => res.render('signup',      { user: null }));
router.get('/logout', (req, res) => res.render('Logout',      { user: null }));

router.get('/calculator', optionalAuth, (req, res) =>
  res.render('calculator', { user: req.user || null })
);
router.get('/solution', optionalAuth, (req, res) =>
  res.render('solution', { user: req.user || null })
);

const Order       = require('../models/Order');
const Appointment = require('../models/Appointment');

router.get('/userdash', auth, async (req, res) => {
  try {
    // grab latest non-cancelled order
    const order = await Order.findOne({
      user:   req.user._id,
      status: { $nin: ['cancelled', 'rejected'] }
    }).sort({ createdAt: -1 });

    // grab latest non-cancelled appointment
    const appointment = await Appointment.findOne({
      user:   req.user._id,
      status: { $nin: ['cancelled'] }
    }).sort({ createdAt: -1 });

    // decide dashType
    let dashType = 'none';
    if (appointment) dashType = 'installation';
    else if (order)  dashType = 'order';

    // map status -> activeStep
    // installation steps: Order Placed(0), Assessment(1), Scheduling(2), Installation(3), Activation(4)
    // order steps:        Order Placed(0), Approved(1), Shipped(2), Delivered(3)
    const installationStepMap = {
      pending:   1,  // assessment
      approved:  2,  // scheduling
      completed: 4,  // activation
    };
    const orderStepMap = {
      pending:  0,
      approved: 1,
    };

    let activeStep = 0;
    if (dashType === 'installation' && appointment) {
      activeStep = installationStepMap[appointment.status] ?? 0;
    } else if (dashType === 'order' && order) {
      activeStep = orderStepMap[order.status] ?? 0;
    }

    res.render('User_Dashboard', {
      title:       'Avalanche | Dashboard',
      user:        req.user,
      dashType,
      order:       order       || null,
      appointment: appointment || null,
      activeStep,
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('404', {
      title:   'Avalanche | Error',
      message: 'Something went wrong loading your dashboard.',
      user:    req.user || null,
    });
  }
});

router.get('/scheduler', auth, (req, res) =>
  res.render('scheduler', { user: req.user })
);
router.get('/orders/my', auth, (req, res) =>
  res.render('Customer_Order_History', { user: req.user })
);
router.get('/customercatalog', optionalAuth, (req, res) =>
  res.render('customercatalog', { user: req.user || null })
);

router.get('/admin/dashboard', auth, (req, res) =>
  res.redirect('/appointments/admin/dashboard')
);
router.get('/admincatalog', auth, (req, res) =>
  res.render('admincatalog', { user: req.user })
);
router.get('/orders/manage', auth, (req, res) =>
  res.render('Admin_Order_Managment', { user: req.user, title: 'Avalanche | Order Management' })
);
router.get('/Admin_calendar', auth, (req, res) =>
  res.render('Admin_calendar', { user: req.user, title: 'Avalanche | Calendar' })
);

router.use((req, res) => {
  res.status(404).render('404', {
    title:   'Avalanche | 404',
    message: 'The page you requested does not exist.',
    user:    req.user || null,
  });
});

module.exports = router;