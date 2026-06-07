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

router.get('/userdash', auth, (req, res) =>
  res.render('User_Dashboard', {
    user:         req.user,
    appointments: [],
    title:        'Avalanche | Dashboard',
  })
);
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