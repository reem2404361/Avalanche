const express = require('express');
const router  = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { auth }  = require('../middleware/auth');
const roleAuth  = require('../middleware/roleAuth');

const { getRecommendation } = require('../utils/recommendation');
router.post('/recommend', (req, res, next) => {
    try {
        const { roofArea, monthlyConsumption } = req.body;
        const result = getRecommendation(Number(roofArea), Number(monthlyConsumption));
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.post('/', auth, roleAuth('admin', 'superadmin'), createProduct);
router.put('/:id', auth, roleAuth('admin', 'superadmin'), updateProduct);
router.delete('/:id', auth, roleAuth('admin', 'superadmin'), deleteProduct);

module.exports = router;