const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment
 * @access  Private (USER)
 */
router.post(
    '/initiate',
    [
        authenticate,
        authorize('USER'),
        body('orderId').isUUID().withMessage('Invalid order ID'),
        validate
    ],
    paymentController.initiatePayment
);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment
 * @access  Private (USER)
 */
router.post(
    '/verify',
    [
        authenticate,
        authorize('USER'),
        body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID required'),
        body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID required'),
        body('razorpaySignature').notEmpty().withMessage('Razorpay signature required'),
        validate
    ],
    paymentController.verifyPayment
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay webhook
 * @access  Public (Razorpay)
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
