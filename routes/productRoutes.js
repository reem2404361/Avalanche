const express = require('express');
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

module.exports = router;