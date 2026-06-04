const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category (panels, inverters, storage) is required'],
        enum: ['panels', 'inverters', 'storage'] 
    },
    wattage: {
        type: Number, 
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Product price in EGP is required'],
        min: [0, 'Price cannot be a negative number'] 
    },
    quantity: {
        type: Number,
        required: [true, 'Stock count is required'],
        min: [0, 'Stock quantities cannot drop below zero'],
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1509391366360-2e959784a276' 
    }

}, {
    timestamps: true 
});


module.exports = mongoose.model('Product', productSchema);