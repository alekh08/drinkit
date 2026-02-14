const db = require('../config/database');
const commissionService = require('../services/commissionService');

class AdminController {
    /**
     * Get dashboard analytics
     */
    async getDashboard(req, res, next) {
        try {
            const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'USER') as total_users,
          (SELECT COUNT(*) FROM stores) as total_stores,
          (SELECT COUNT(*) FROM stores WHERE is_approved = TRUE) as approved_stores,
          (SELECT COUNT(*) FROM stores WHERE is_approved = FALSE) as pending_stores,
          (SELECT COUNT(*) FROM riders) as total_riders,
          (SELECT COUNT(*) FROM riders WHERE is_approved = TRUE) as approved_riders,
          (SELECT COUNT(*) FROM riders WHERE is_approved = FALSE) as pending_riders,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED') as completed_orders,
          (SELECT COALESCE(SUM(commission_amount), 0) FROM orders WHERE status = 'DELIVERED') as total_commission
      `);

            res.json({
                success: true,
                stats: stats.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users
     */
    async getUsers(req, res, next) {
        try {
            const { role } = req.query;

            let query = 'SELECT id, mobile, name, email, role, is_active, is_verified, created_at FROM users';
            const params = [];

            if (role) {
                query += ' WHERE role = $1';
                params.push(role);
            }

            query += ' ORDER BY created_at DESC';

            const result = await db.query(query, params);

            res.json({
                success: true,
                users: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Block/Unblock user
     */
    async toggleUserStatus(req, res, next) {
        try {
            const { userId } = req.params;
            const { isActive } = req.body;

            const result = await db.query(
                'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
                [isActive, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                message: `User ${isActive ? 'activated' : 'blocked'} successfully`,
                user: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending store approvals
     */
    async getPendingStores(req, res, next) {
        try {
            const result = await db.query(
                `SELECT s.*, u.name as owner_name, u.mobile as owner_mobile, u.email as owner_email
         FROM stores s
         JOIN users u ON s.user_id = u.id
         WHERE s.is_approved = FALSE
         ORDER BY s.created_at DESC`
            );

            res.json({
                success: true,
                stores: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all stores
     */
    async getAllStores(req, res, next) {
        try {
            const result = await db.query(
                `SELECT s.*, u.name as owner_name, u.mobile as owner_mobile
         FROM stores s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.created_at DESC`
            );

            res.json({
                success: true,
                stores: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve/Reject store
     */
    async updateStoreStatus(req, res, next) {
        try {
            const { storeId } = req.params;
            const { isApproved } = req.body;

            const result = await db.query(
                'UPDATE stores SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [isApproved, storeId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            res.json({
                success: true,
                message: `Store ${isApproved ? 'approved' : 'rejected'} successfully`,
                store: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending rider approvals
     */
    async getPendingRiders(req, res, next) {
        try {
            const result = await db.query(
                `SELECT r.*, u.name as rider_name, u.mobile as rider_mobile, u.email as rider_email
         FROM riders r
         JOIN users u ON r.user_id = u.id
         WHERE r.is_approved = FALSE
         ORDER BY r.created_at DESC`
            );

            res.json({
                success: true,
                riders: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all riders
     */
    async getAllRiders(req, res, next) {
        try {
            const result = await db.query(
                `SELECT r.*, u.name as rider_name, u.mobile as rider_mobile
         FROM riders r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC`
            );

            res.json({
                success: true,
                riders: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve/Reject rider
     */
    async updateRiderStatus(req, res, next) {
        try {
            const { riderId } = req.params;
            const { isApproved } = req.body;

            const result = await db.query(
                'UPDATE riders SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [isApproved, riderId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Rider not found' });
            }

            res.json({
                success: true,
                message: `Rider ${isApproved ? 'approved' : 'rejected'} successfully`,
                rider: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all orders
     */
    async getAllOrders(req, res, next) {
        try {
            const { status } = req.query;

            let query = `
        SELECT o.*, 
               u.name as customer_name, u.mobile as customer_mobile,
               s.store_name,
               u_rider.name as rider_name,
               p.status as payment_status
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN stores s ON o.store_id = s.id
        LEFT JOIN riders r ON o.rider_id = r.id
        LEFT JOIN users u_rider ON r.user_id = u_rider.id
        LEFT JOIN payments p ON o.id = p.order_id
      `;

            const params = [];

            if (status) {
                query += ' WHERE o.status = $1';
                params.push(status);
            }

            query += ' ORDER BY o.created_at DESC LIMIT 100';

            const result = await db.query(query, params);

            res.json({
                success: true,
                orders: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get commission settings
     */
    async getCommission(req, res, next) {
        try {
            const commission = await commissionService.getActiveCommission();

            res.json({
                success: true,
                commissionPercentage: commission
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update commission
     */
    async updateCommission(req, res, next) {
        try {
            const { commissionPercentage } = req.body;

            const result = await commissionService.updateCommission(commissionPercentage);

            res.json({
                success: true,
                message: 'Commission updated successfully',
                commission: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
