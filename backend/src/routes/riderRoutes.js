const express = require('express');
const { body, param } = require('express-validator');
const riderController = require('../controllers/riderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// All routes require RIDER role
router.use(authenticate, authorize('RIDER'));

/**
 * @route   POST /api/riders/profile
 * @desc    Create or update rider profile
 * @access  Private (RIDER)
 */
router.post(
    '/profile',
    [
        body('vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
        body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
        body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
        validate
    ],
    riderController.upsertRider
);

/**
 * @route   GET /api/riders/orders/available
 * @desc    Get available orders
 * @access  Private (RIDER)
 */
router.get('/orders/available', riderController.getAvailableOrders);

/**
 * @route   POST /api/riders/orders/:orderId/accept
 * @desc    Accept delivery order
 * @access  Private (RIDER)
 */
router.post(
    '/orders/:orderId/accept',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    riderController.acceptOrder
);

/**
 * @route   PUT /api/riders/orders/:orderId/pickup
 * @desc    Mark order as picked up
 * @access  Private (RIDER)
 */
router.put(
    '/orders/:orderId/pickup',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    riderController.markPickedUp
);

/**
 * @route   POST /api/riders/orders/:orderId/deliver
 * @desc    Deliver order with OTP
 * @access  Private (RIDER)
 */
router.post(
    '/orders/:orderId/deliver',
    [
        param('orderId').isUUID().withMessage('Invalid order ID'),
        body('otp').matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits'),
        validate
    ],
    riderController.deliverOrder
);

/**
 * @route   GET /api/riders/orders/active
 * @desc    Get active order
 * @access  Private (RIDER)
 */
router.get('/orders/active', riderController.getActiveOrder);

/**
 * @route   GET /api/riders/earnings
 * @desc    Get rider earnings
 * @access  Private (RIDER)
 */
router.get('/earnings', riderController.getEarnings);

/**
 * @route   PUT /api/riders/availability
 * @desc    Toggle rider availability
 * @access  Private (RIDER)
 */
router.put(
    '/availability',
    [
        body('isAvailable').isBoolean().withMessage('isAvailable must be boolean'),
        validate
    ],
    riderController.toggleAvailability
);

module.exports = router;
