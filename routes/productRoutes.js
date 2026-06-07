const express = require('express');
<<<<<<< HEAD
const router  = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { auth }  = require('../middleware/auth');
const roleAuth  = require('../middleware/roleAuth');

router.get('/',     getAllProducts);
router.get('/:id',  getProductById);
router.post('/',    auth, roleAuth('admin', 'superadmin'), createProduct);
router.put('/:id',  auth, roleAuth('admin', 'superadmin'), updateProduct);
router.delete('/:id', auth, roleAuth('admin', 'superadmin'), deleteProduct);
=======
const router = express.Router();


const {
    getAllPanels,
    getPanelById,
    createPanel,
    updatePanel,
    deletePanel,
    getSolarRecommendation
} = require('../controllers/productController');


const { validatePanel } = require('../middleware/validate');


const auth = require('../middleware/auth') || ((req, res, next) => next()); 
const roleAuth = (role) => (req, res, next) => next(); 

router.get('/', getAllPanels);

router.get('/:id', getPanelById);

router.post('/recommend', getSolarRecommendation);

router.post('/', auth, roleAuth('admin'), validatePanel, createPanel);

router.put('/:id', auth, roleAuth('admin'), validatePanel, updatePanel);

router.delete('/:id', auth, roleAuth('admin'), deletePanel);
>>>>>>> 7fcf333a6ff27a5e5eb200099ba45b45b2ca79d2

module.exports = router;