const express = require('express');
const { body, query, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// All routes require USER role
router.use(authenticate, authorize('USER'));

/**
 * @route   GET /api/users/stores/nearby
 * @desc    Get nearby stores
 * @access  Private (USER)
 */
router.get(
    '/stores/nearby',
    [
        query('latitude').optional().isFloat().withMessage('Invalid latitude'),
        query('longitude').optional().isFloat().withMessage('Invalid longitude'),
        query('radius').optional().isInt({ min: 1, max: 50 }).withMessage('Radius must be between 1-50 km'),
        validate
    ],
    userController.getNearbyStores
);

/**
 * @route   GET /api/users/stores/:storeId
 * @desc    Get store details with products
 * @access  Private (USER)
 */
router.get(
    '/stores/:storeId',
    [
        param('storeId').isUUID().withMessage('Invalid store ID'),
        validate
    ],
    userController.getStoreDetails
);

/**
 * @route   POST /api/users/orders
 * @desc    Place an order
 * @access  Private (USER)
 */
router.post(
    '/orders',
    [
        body('storeId').isUUID().withMessage('Invalid store ID'),
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('items.*.productId').isUUID().withMessage('Invalid product ID'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
        body('deliveryLatitude').optional().isFloat().withMessage('Invalid latitude'),
        body('deliveryLongitude').optional().isFloat().withMessage('Invalid longitude'),
        validate
    ],
    userController.placeOrder
);

/**
 * @route   GET /api/users/orders
 * @desc    Get user orders
 * @access  Private (USER)
 */
router.get(
    '/orders',
    [
        query('status').optional().isIn(['PLACED', 'ACCEPTED', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
        validate
    ],
    userController.getOrders
);

/**
 * @route   GET /api/users/orders/:orderId
 * @desc    Get order details
 * @access  Private (USER)
 */
router.get(
    '/orders/:orderId',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    userController.getOrderDetails
);

/**
 * @route   PUT /api/users/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private (USER)
 */
router.put(
    '/orders/:orderId/cancel',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    userController.cancelOrder
);

module.exports = router;
