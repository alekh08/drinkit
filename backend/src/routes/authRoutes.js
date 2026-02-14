const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to mobile number
 * @access  Public
 */
router.post(
    '/send-otp',
    [
        body('mobile')
            .matches(/^[0-9]{10}$/)
            .withMessage('Mobile number must be 10 digits'),
        body('role')
            .optional()
            .isIn(['USER', 'STORE', 'RIDER', 'ADMIN'])
            .withMessage('Invalid role'),
        validate
    ],
    authController.sendOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login
 * @access  Public
 */
router.post(
    '/verify-otp',
    [
        body('mobile')
            .matches(/^[0-9]{10}$/)
            .withMessage('Mobile number must be 10 digits'),
        body('otp')
            .matches(/^[0-9]{6}$/)
            .withMessage('OTP must be 6 digits'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        validate
    ],
    authController.verifyOTP
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
    '/profile',
    [
        authenticate,
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Invalid email address'),
        validate
    ],
    authController.updateProfile
);

module.exports = router;
