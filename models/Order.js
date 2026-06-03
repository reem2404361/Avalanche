const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    priceAtOrder: { 
      type: Number,
      required: [true, 'Price is required']
    }
  },
  { _id: false } //tells mongo not to create a separate ID for each item since they're just part of the order.
);


// main order schema 
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user']
    },

    items: {
      type: [orderItemSchema], 
      validate: { 
        validator: function (val) { // val = items array 
          return val.length > 0;
        },
        message: 'Order must have at least one product'
      }
    },

    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be a positive number']
    },

    shippingDetails: { // nested object 
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
      },
      deliveryAddress: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true
      }
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],  
      default: 'pending'
    },

    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true } //to store the createdAt and updatedAt timestamps automatically
);

module.exports = mongoose.model('Order', orderSchema);