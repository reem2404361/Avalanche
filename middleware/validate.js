const { body, validationResult } = require('express-validator');

const checkValidationResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const validateRegister = [
    body('name')
        .notEmpty().withMessage('Name is strictly required')
        .trim(),
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    checkValidationResults 
];

const validateLogin = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    checkValidationResults
];


const validatePanel = [
    body('name')
        .notEmpty().withMessage('Product name is required')
        .trim(),
    body('category')
        .isIn(['panels', 'inverters', 'storage']).withMessage('Category must be panels, inverters, or storage'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity')
        .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    body('wattage')
        .optional()
        .isFloat({ min: 0 }).withMessage('Wattage must be a positive number if provided'),
    checkValidationResults
];


const validateOrder = [
    body('panelId')
        .isMongoId().withMessage('panelId must be a valid MongoDB ObjectId identifier'),
    body('quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer of 1 or more'),
    checkValidationResults
];

module.exports = {
    validateRegister,
    validateLogin,
    validatePanel,
    validateOrder
};