const express = require('express');
const router = express.Router();
const {placeOrder, getMyOrders, getAllOrders , 
    updateOrderStatus , getOrderById } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Customer routes
router.post('/', auth, roleAuth('customer'), placeOrder);
router.get('/my', auth, roleAuth('customer'), getMyOrders);

// Admin routes
router.get('/', auth, roleAuth('admin' , 'superadmin'), getAllOrders);
router.patch('/:id/status', auth, roleAuth('admin' , 'superadmin'), updateOrderStatus);

// Admin & Customer
router.get('/:id', auth, getOrderById);

module.exports = router;