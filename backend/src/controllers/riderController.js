const db = require('../config/database');

class RiderController {
    /**
     * Create or update rider profile
     */
    async upsertRider(req, res, next) {
        try {
            const userId = req.user.id;
            const { vehicleType, vehicleNumber, licenseNumber } = req.body;

            const existingRider = await db.query(
                'SELECT * FROM riders WHERE user_id = $1',
                [userId]
            );

            let result;

            if (existingRider.rows.length > 0) {
                result = await db.query(
                    `UPDATE riders SET
           vehicle_type = COALESCE($1, vehicle_type),
           vehicle_number = COALESCE($2, vehicle_number),
           license_number = COALESCE($3, license_number),
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4
           RETURNING *`,
                    [vehicleType, vehicleNumber, licenseNumber, userId]
                );
            } else {
                result = await db.query(
                    `INSERT INTO riders (user_id, vehicle_type, vehicle_number, license_number)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
                    [userId, vehicleType, vehicleNumber, licenseNumber]
                );
            }

            res.json({
                success: true,
                message: existingRider.rows.length > 0 ? 'Rider profile updated' : 'Rider profile created. Awaiting admin approval.',
                rider: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available orders for riders
     */
    async getAvailableOrders(req, res, next) {
        try {
            const userId = req.user.id;

            // Check if rider is approved
            const riderResult = await db.query(
                'SELECT * FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            const rider = riderResult.rows[0];

            if (!rider.is_approved) {
                return res.status(403).json({ error: 'Rider profile not approved yet' });
            }

            if (!rider.is_available) {
                return res.status(400).json({ error: 'Rider is not marked as available' });
            }

            // Get orders that are ACCEPTED but not yet assigned to a rider
            const result = await db.query(
                `SELECT o.*, s.store_name, s.address as store_address, s.latitude as store_lat, s.longitude as store_lng,
                u.name as customer_name, u.mobile as customer_mobile
         FROM orders o
         JOIN stores s ON o.store_id = s.id
         JOIN users u ON o.user_id = u.id
         WHERE o.status = 'ACCEPTED' AND o.rider_id IS NULL
         ORDER BY o.accepted_at ASC`
            );

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
     * Accept a delivery order
     */
    async acceptOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const riderResult = await db.query(
                'SELECT * FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            const rider = riderResult.rows[0];

            if (!rider.is_approved) {
                return res.status(403).json({ error: 'Rider profile not approved' });
            }

            const result = await db.query(
                `UPDATE orders SET
           rider_id = $1,
           status = 'RIDER_ASSIGNED',
           rider_assigned_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'ACCEPTED' AND rider_id IS NULL
         RETURNING *`,
                [rider.id, orderId]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Order not available or already assigned' });
            }

            // Mark rider as unavailable
            await db.query(
                'UPDATE riders SET is_available = FALSE WHERE id = $1',
                [rider.id]
            );

            res.json({
                success: true,
                message: 'Order accepted successfully',
                order: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark order as picked up
     */
    async markPickedUp(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const riderResult = await db.query(
                'SELECT id FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            const result = await db.query(
                `UPDATE orders SET
           status = 'OUT_FOR_DELIVERY',
           out_for_delivery_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND rider_id = $2 AND status = 'RIDER_ASSIGNED'
         RETURNING *`,
                [orderId, riderResult.rows[0].id]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Order not found or invalid status' });
            }

            res.json({
                success: true,
                message: 'Order marked as picked up',
                order: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deliver order with OTP verification
     */
    async deliverOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const { otp } = req.body;

            const riderResult = await db.query(
                'SELECT id FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            // Verify OTP and update order
            const orderResult = await db.query(
                'SELECT * FROM orders WHERE id = $1 AND rider_id = $2 AND status = \'OUT_FOR_DELIVERY\'',
                [orderId, riderResult.rows[0].id]
            );

            if (orderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const order = orderResult.rows[0];

            if (order.delivery_otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }

            const result = await db.query(
                `UPDATE orders SET
           status = 'DELIVERED',
           delivered_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
                [orderId]
            );

            // Mark rider as available again and increment delivery count
            await db.query(
                `UPDATE riders SET 
           is_available = TRUE,
           total_deliveries = total_deliveries + 1
         WHERE id = $1`,
                [riderResult.rows[0].id]
            );

            res.json({
                success: true,
                message: 'Order delivered successfully',
                order: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get rider's active order
     */
    async getActiveOrder(req, res, next) {
        try {
            const userId = req.user.id;

            const riderResult = await db.query(
                'SELECT id FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            const result = await db.query(
                `SELECT o.*, s.store_name, s.address as store_address,
                u.name as customer_name, u.mobile as customer_mobile
         FROM orders o
         JOIN stores s ON o.store_id = s.id
         JOIN users u ON o.user_id = u.id
         WHERE o.rider_id = $1 AND o.status IN ('RIDER_ASSIGNED', 'OUT_FOR_DELIVERY')
         ORDER BY o.rider_assigned_at DESC
         LIMIT 1`,
                [riderResult.rows[0].id]
            );

            // Get order items
            let orderItems = [];
            if (result.rows.length > 0) {
                const itemsResult = await db.query(
                    'SELECT * FROM order_items WHERE order_id = $1',
                    [result.rows[0].id]
                );
                orderItems = itemsResult.rows;
            }

            res.json({
                success: true,
                order: result.rows[0] || null,
                items: orderItems
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get rider earnings
     */
    async getEarnings(req, res, next) {
        try {
            const userId = req.user.id;

            const riderResult = await db.query(
                'SELECT id, total_deliveries FROM riders WHERE user_id = $1',
                [userId]
            );

            if (riderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            const result = await db.query(
                `SELECT 
           COUNT(*) as completed_deliveries,
           COALESCE(SUM(delivery_fee), 0) as total_earnings
         FROM orders
         WHERE rider_id = $1 AND status = 'DELIVERED'`,
                [riderResult.rows[0].id]
            );

            res.json({
                success: true,
                earnings: {
                    ...result.rows[0],
                    total_deliveries: riderResult.rows[0].total_deliveries
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Toggle rider availability
     */
    async toggleAvailability(req, res, next) {
        try {
            const userId = req.user.id;
            const { isAvailable } = req.body;

            const result = await db.query(
                `UPDATE riders SET 
           is_available = $1,
           updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING *`,
                [isAvailable, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Rider profile not found' });
            }

            res.json({
                success: true,
                message: `Rider marked as ${isAvailable ? 'available' : 'unavailable'}`,
                rider: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RiderController();
