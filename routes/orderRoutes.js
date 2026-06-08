const express = require('express');
const router = express.Router();
const {placeOrder, getMyOrders, getAllOrders , 
    updateOrderStatus , getOrderById } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Customer routes
router.post('/', auth, roleAuth('customer'), placeOrder);
router.get('/my', auth, roleAuth('customer'), getMyOrders);
// add this with the customer routes
router.post('/cancel', auth, roleAuth('customer'), async (req, res, next) => {
  try {
    const order = await Order.findOne({
      user:   req.user._id,
      status: { $nin: ['cancelled', 'rejected'] }
    }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No active order found' });
    }

    // restore stock
    const Product = require('../models/Product');
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

// Admin routes
router.get('/', auth, roleAuth('admin' , 'superadmin'), getAllOrders);
router.patch('/:id/status', auth, roleAuth('admin' , 'superadmin'), updateOrderStatus);

// Admin & Customer
router.get('/:id', auth, getOrderById);

module.exports = router;