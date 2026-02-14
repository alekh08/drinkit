const db = require('../config/database');

class StoreController {
    /**
     * Create or update store profile
     */
    async upsertStore(req, res, next) {
        try {
            const userId = req.user.id;
            const { storeName, description, address, latitude, longitude, licenseNumber, openingTime, closingTime } = req.body;

            // Check if store already exists
            const existingStore = await db.query(
                'SELECT * FROM stores WHERE user_id = $1',
                [userId]
            );

            let result;

            if (existingStore.rows.length > 0) {
                // Update existing store
                result = await db.query(
                    `UPDATE stores SET 
           store_name = COALESCE($1, store_name),
           description = COALESCE($2, description),
           address = COALESCE($3, address),
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           license_number = COALESCE($6, license_number),
           opening_time = COALESCE($7, opening_time),
           closing_time = COALESCE($8, closing_time),
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $9
           RETURNING *`,
                    [storeName, description, address, latitude, longitude, licenseNumber, openingTime, closingTime, userId]
                );
            } else {
                // Create new store
                result = await db.query(
                    `INSERT INTO stores (user_id, store_name, description, address, latitude, longitude, license_number, opening_time, closing_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
                    [userId, storeName, description, address, latitude, longitude, licenseNumber, openingTime, closingTime]
                );
            }

            res.json({
                success: true,
                message: existingStore.rows.length > 0 ? 'Store updated successfully' : 'Store created successfully. Awaiting admin approval.',
                store: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get store dashboard stats
     */
    async getDashboard(req, res, next) {
        try {
            const userId = req.user.id;

            // Get store
            const storeResult = await db.query(
                'SELECT * FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found. Please create your store profile first.' });
            }

            const store = storeResult.rows[0];

            // Get stats
            const stats = await db.query(
                `SELECT 
           COUNT(*) FILTER (WHERE status = 'PLACED') as pending_orders,
           COUNT(*) FILTER (WHERE status IN ('ACCEPTED', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY')) as active_orders,
           COUNT(*) FILTER (WHERE status = 'DELIVERED') as completed_orders,
           COALESCE(SUM(total_amount - delivery_fee - commission_amount) FILTER (WHERE status = 'DELIVERED'), 0) as total_earnings
         FROM orders
         WHERE store_id = $1`,
                [store.id]
            );

            const productCount = await db.query(
                'SELECT COUNT(*) as count FROM products WHERE store_id = $1',
                [store.id]
            );

            res.json({
                success: true,
                store,
                stats: {
                    ...stats.rows[0],
                    total_products: productCount.rows[0].count
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get store products
     */
    async getProducts(req, res, next) {
        try {
            const userId = req.user.id;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                'SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC',
                [storeResult.rows[0].id]
            );

            res.json({
                success: true,
                products: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add product
     */
    async addProduct(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, description, category, price, volume, alcoholPercentage, brand, stockQuantity, imageUrl } = req.body;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                `INSERT INTO products (store_id, name, description, category, price, volume, alcohol_percentage, brand, stock_quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
                [storeResult.rows[0].id, name, description, category, price, volume, alcoholPercentage, brand, stockQuantity || 0, imageUrl]
            );

            res.status(201).json({
                success: true,
                message: 'Product added successfully',
                product: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update product
     */
    async updateProduct(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;
            const { name, description, category, price, volume, alcoholPercentage, brand, stockQuantity, imageUrl, isAvailable } = req.body;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                `UPDATE products SET
           name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           volume = COALESCE($5, volume),
           alcohol_percentage = COALESCE($6, alcohol_percentage),
           brand = COALESCE($7, brand),
           stock_quantity = COALESCE($8, stock_quantity),
           image_url = COALESCE($9, image_url),
           is_available = COALESCE($10, is_available),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND store_id = $12
         RETURNING *`,
                [name, description, category, price, volume, alcoholPercentage, brand, stockQuantity, imageUrl, isAvailable, productId, storeResult.rows[0].id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({
                success: true,
                message: 'Product updated successfully',
                product: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                'DELETE FROM products WHERE id = $1 AND store_id = $2 RETURNING *',
                [productId, storeResult.rows[0].id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get store orders
     */
    async getOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const { status } = req.query;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            let query = `
        SELECT o.*, u.name as customer_name, u.mobile as customer_mobile,
               r.vehicle_type, u_rider.name as rider_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN riders r ON o.rider_id = r.id
        LEFT JOIN users u_rider ON r.user_id = u_rider.id
        WHERE o.store_id = $1
      `;

            const params = [storeResult.rows[0].id];

            if (status) {
                query += ` AND o.status = $2`;
                params.push(status);
            }

            query += ` ORDER BY o.created_at DESC`;

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
     * Accept order
     */
    async acceptOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                `UPDATE orders SET 
           status = 'ACCEPTED', 
           accepted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND store_id = $2 AND status = 'PLACED'
         RETURNING *`,
                [orderId, storeResult.rows[0].id]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Order not found or cannot be accepted' });
            }

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
     * Reject order
     */
    async rejectOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                `UPDATE orders SET 
           status = 'CANCELLED',
           cancelled_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND store_id = $2 AND status = 'PLACED'
         RETURNING *`,
                [orderId, storeResult.rows[0].id]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Order not found or cannot be rejected' });
            }

            res.json({
                success: true,
                message: 'Order rejected successfully',
                order: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get earnings
     */
    async getEarnings(req, res, next) {
        try {
            const userId = req.user.id;

            const storeResult = await db.query(
                'SELECT id FROM stores WHERE user_id = $1',
                [userId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const result = await db.query(
                `SELECT 
           COUNT(*) as total_orders,
           COALESCE(SUM(subtotal), 0) as total_sales,
           COALESCE(SUM(commission_amount), 0) as total_commission,
           COALESCE(SUM(subtotal - commission_amount), 0) as net_earnings
         FROM orders
         WHERE store_id = $1 AND status = 'DELIVERED'`,
                [storeResult.rows[0].id]
            );

            res.json({
                success: true,
                earnings: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StoreController();
