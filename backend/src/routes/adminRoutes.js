const express = require('express');
const { body, query, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// All routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard analytics
 * @access  Private (ADMIN)
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (ADMIN)
 */
router.get(
    '/users',
    [
        query('role').optional().isIn(['USER', 'STORE', 'RIDER', 'ADMIN']),
        validate
    ],
    adminController.getUsers
);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Block/Unblock user
 * @access  Private (ADMIN)
 */
router.put(
    '/users/:userId/status',
    [
        param('userId').isUUID().withMessage('Invalid user ID'),
        body('isActive').isBoolean().withMessage('isActive must be boolean'),
        validate
    ],
    adminController.toggleUserStatus
);

/**
 * @route   GET /api/admin/stores/pending
 * @desc    Get pending store approvals
 * @access  Private (ADMIN)
 */
router.get('/stores/pending', adminController.getPendingStores);

/**
 * @route   GET /api/admin/stores
 * @desc    Get all stores
 * @access  Private (ADMIN)
 */
router.get('/stores', adminController.getAllStores);

/**
 * @route   PUT /api/admin/stores/:storeId/approve
 * @desc    Approve/Reject store
 * @access  Private (ADMIN)
 */
router.put(
    '/stores/:storeId/approve',
    [
        param('storeId').isUUID().withMessage('Invalid store ID'),
        body('isApproved').isBoolean().withMessage('isApproved must be boolean'),
        validate
    ],
    adminController.updateStoreStatus
);

/**
 * @route   GET /api/admin/riders/pending
 * @desc    Get pending rider approvals
 * @access  Private (ADMIN)
 */
router.get('/riders/pending', adminController.getPendingRiders);

/**
 * @route   GET /api/admin/riders
 * @desc    Get all riders
 * @access  Private (ADMIN)
 */
router.get('/riders', adminController.getAllRiders);

/**
 * @route   PUT /api/admin/riders/:riderId/approve
 * @desc    Approve/Reject rider
 * @access  Private (ADMIN)
 */
router.put(
    '/riders/:riderId/approve',
    [
        param('riderId').isUUID().withMessage('Invalid rider ID'),
        body('isApproved').isBoolean().withMessage('isApproved must be boolean'),
        validate
    ],
    adminController.updateRiderStatus
);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (ADMIN)
 */
router.get(
    '/orders',
    [
        query('status').optional().isIn(['PLACED', 'ACCEPTED', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
        validate
    ],
    adminController.getAllOrders
);

/**
 * @route   GET /api/admin/commission
 * @desc    Get commission settings
 * @access  Private (ADMIN)
 */
router.get('/commission', adminController.getCommission);

/**
 * @route   PUT /api/admin/commission
 * @desc    Update commission
 * @access  Private (ADMIN)
 */
router.put(
    '/commission',
    [
        body('commissionPercentage')
            .isFloat({ min: 0, max: 100 })
            .withMessage('Commission must be between 0 and 100'),
        validate
    ],
    adminController.updateCommission
);

module.exports = router;
