const Order = require('../models/Order');
const Product = require('../models/Product');


const placeOrder = async (req, res, next) => { 
  try {
    const { items, shippingDetails } = req.body; 

    // check if items array is not empty
    if (!items || items.length === 0) {
      const error = new Error('Order must have at least one product');
      error.statusCode = 400;
      return next(error);
    }

    // loop through each item to validate and calculate price
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      // check if product exists
      if (!product) {
        const error = new Error(`Product not found`);
        error.statusCode = 404;
        return next(error);
      }

      // check if enough stock is available
      if (product.quantity < item.quantity) {
        const error = new Error(`Only ${product.quantity} items available in stock for ${product.name}`);
        error.statusCode = 400;
        return next(error);
      }

      // add item to order items array
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtOrder: product.price
      });

      // add to total price
      totalPrice += product.price * item.quantity;

      // reduce product stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // create the order in the db
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      shippingDetails
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (err) {
    next(err);
  }
};





const getMyOrders = async (req, res, next) => {
  try {
    //method chaining : 1st find orders by user id, then populate product details, then sort by creation date
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image') // by7ot el product details gwa el part bta3 el product elly fy el order
      .sort({ createdAt: -1 }); // newest orders first

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (err) {
    next(err);
  }
};




const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (err) {
    next(err);
  }
};




const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // validate status value
    const allowedStatuses = ['pending', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      const error = new Error('Invalid status value');
      error.statusCode = 400;
      return next(error);
    }

    // check if order exists
    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // if admin rejects order, restore product stock
    if (status === 'rejected' && order.status !== 'rejected') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      data: order
    });

  } catch (err) {
    next(err);
  }
};




const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // customer can only see their own orders
    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to view this order');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById
};