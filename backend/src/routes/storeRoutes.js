const express = require('express');
const { body, query, param } = require('express-validator');
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// All routes require STORE role
router.use(authenticate, authorize('STORE'));

/**
 * @route   POST /api/stores/profile
 * @desc    Create or update store profile
 * @access  Private (STORE)
 */
router.post(
    '/profile',
    [
        body('storeName').trim().notEmpty().withMessage('Store name is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
        body('latitude').optional().isFloat().withMessage('Invalid latitude'),
        body('longitude').optional().isFloat().withMessage('Invalid longitude'),
        validate
    ],
    storeController.upsertStore
);

/**
 * @route   GET /api/stores/dashboard
 * @desc    Get store dashboard
 * @access  Private (STORE)
 */
router.get('/dashboard', storeController.getDashboard);

/**
 * @route   GET /api/stores/products
 * @desc    Get store products
 * @access  Private (STORE)
 */
router.get('/products', storeController.getProducts);

/**
 * @route   POST /api/stores/products
 * @desc    Add product
 * @access  Private (STORE)
 */
router.post(
    '/products',
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('category').trim().notEmpty().withMessage('Category is required'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
        validate
    ],
    storeController.addProduct
);

/**
 * @route   PUT /api/stores/products/:productId
 * @desc    Update product
 * @access  Private (STORE)
 */
router.put(
    '/products/:productId',
    [
        param('productId').isUUID().withMessage('Invalid product ID'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
        body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
        body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
        validate
    ],
    storeController.updateProduct
);

/**
 * @route   DELETE /api/stores/products/:productId
 * @desc    Delete product
 * @access  Private (STORE)
 */
router.delete(
    '/products/:productId',
    [
        param('productId').isUUID().withMessage('Invalid product ID'),
        validate
    ],
    storeController.deleteProduct
);

/**
 * @route   GET /api/stores/orders
 * @desc    Get store orders
 * @access  Private (STORE)
 */
router.get(
    '/orders',
    [
        query('status').optional().isIn(['PLACED', 'ACCEPTED', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
        validate
    ],
    storeController.getOrders
);

/**
 * @route   PUT /api/stores/orders/:orderId/accept
 * @desc    Accept order
 * @access  Private (STORE)
 */
router.put(
    '/orders/:orderId/accept',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    storeController.acceptOrder
);

/**
 * @route   PUT /api/stores/orders/:orderId/reject
 * @desc    Reject order
 * @access  Private (STORE)
 */
router.put(
    '/orders/:orderId/reject',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    storeController.rejectOrder
);

/**
 * @route   GET /api/stores/earnings
 * @desc    Get store earnings
 * @access  Private (STORE)
 */
router.get('/earnings', storeController.getEarnings);

module.exports = router;
