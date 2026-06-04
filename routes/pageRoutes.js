const express = require('express');
const router = express.Router();
const path = require('path');

// Helper function to send HTML files
const sendFile = (filename) => (req, res) => {
  res.sendFile(path.join(__dirname, '../views', filename));
   //dirname is the current directory of this file (folder containing this file), 
   // then we go up to views and send the requested file
};

// Public routes
router.get('/', sendFile('landingpage.html'));
router.get('/login', sendFile('login.html'));
router.get('/signup', sendFile('signup.html'));
router.get('/logout', sendFile('Logout.html'));

// Customer routes
router.get('/dashboard', sendFile('User_Dashboard.html'));
router.get('/catalog', sendFile('customercatalog.html'));
router.get('/orders', sendFile('Customer_Order_History.html'));
router.get('/calculator', sendFile('calculator.html'));
router.get('/solution', sendFile('solution.html'));
router.get('/scheduler', sendFile('scheduler.html'));

// Admin routes
router.get('/admin/dashboard', sendFile('Admin_Dashboard.html'));
router.get('/admin/catalog', sendFile('admincatalog.html'));
router.get('/admin/orders', sendFile('Admin_Order_Managment.html'));
router.get('/admin/calendar', sendFile('Admin_calendar.html'));

module.exports = router;