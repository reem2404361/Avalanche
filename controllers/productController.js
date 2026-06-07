<<<<<<< HEAD
const Product = require('../models/Product');

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
=======
const Product = require('../models/Product'); 
const { getRecommendation } = require('../utils/recommendation');

/**
 * @desc    
 * @route   
 * @access 
 */
const getAllPanels = async (req, res, next) => {
    try {
        const { category } = req.query;
        let filter = {};

        
        if (category && category !== 'all') {
            filter.category = category;
        }

        const panels = await Product.find(filter);
        return res.status(200).json(panels);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    
 * @route   
 * @access  
 */
const getPanelById = async (req, res, next) => {
    try {
        
        const { id } = req.params;

        
        const panel = await Product.findById(id);
        
        
        if (!panel) {
            res.status(404);
            throw new Error('Panel not found');
        }

       
        return res.status(200).json(panel);
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    
 * @route   
 * @access  
 */
const createPanel = async (req, res, next) => {
    try {
       
        const { name, category, price, quantity, description, imageUrl, wattage } = req.body;

        
        const newPanel = await Product.create({
            name,
            category,
            price,
            quantity,
            description,
            imageUrl,
            wattage: wattage || 0 
        });

        
        return res.status(201).json(newPanel);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    
 * @route   
 * @access  
 */
const updatePanel = async (req, res, next) => {
    try {
        const { id } = req.params;

       
        const updatedPanel = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPanel) {
            res.status(404);
            throw new Error('Panel not found');
        }

        // Step 4: Return the updated panel
        return res.status(200).json(updatedPanel);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    
 * @route   
 * @access  
 */
const deletePanel = async (req, res, next) => {
    try {
        const { id } = req.params;

        
        const targetPanel = await Product.findById(id);

        
        if (!targetPanel) {
            res.status(404);
            throw new Error('Panel not found');
        }

        
        await Product.findByIdAndDelete(id);

        
        return res.status(200).json({
            success: true,
            message: 'Panel deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    
 * @route  
 * @access 
 */
const getSolarRecommendation = async (req, res, next) => {
    try {
        const { roofArea, monthlyConsumption } = req.body;

        if (!roofArea || !monthlyConsumption) {
            res.status(400);
            throw new Error('Please provide both roof area and monthly bill metrics');
        }

        const basePanel = await Product.findOne({ category: 'panels' });
        const panelWattage = basePanel ? basePanel.wattage : 400;

        const results = getRecommendation(Number(roofArea), Number(monthlyConsumption), panelWattage);

        return res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPanels,
    getPanelById,
    createPanel,
    updatePanel,
    deletePanel,
    getSolarRecommendation
};
>>>>>>> 7fcf333a6ff27a5e5eb200099ba45b45b2ca79d2
