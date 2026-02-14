const db = require('../config/database');
const geoService = require('../services/geoService');
const commissionService = require('../services/commissionService');

class UserController {
    /**
     * Get nearby stores
     */
    async getNearbyStores(req, res, next) {
        try {
            const { latitude, longitude, radius = 10 } = req.query;

            let query = `
        SELECT s.*, u.name as owner_name, u.mobile as owner_mobile,
               COUNT(DISTINCT p.id) as product_count
        FROM stores s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN products p ON s.id = p.store_id AND p.is_available = TRUE
        WHERE s.is_approved = TRUE AND s.is_active = TRUE
      `;

            // If coordinates provided, filter by distance (mock implementation)
            if (latitude && longitude) {
                // In production, use PostGIS ST_DWithin or similar
                query += ` AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL`;
            }

            query += ` GROUP BY s.id, u.name, u.mobile ORDER BY s.created_at DESC`;

            const result = await db.query(query);

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
     * Get store details with products
     */
    async getStoreDetails(req, res, next) {
        try {
            const { storeId } = req.params;

            const storeResult = await db.query(
                `SELECT s.*, u.name as owner_name 
         FROM stores s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = $1 AND s.is_approved = TRUE AND s.is_active = TRUE`,
                [storeId]
            );

            if (storeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const productsResult = await db.query(
                `SELECT * FROM products 
         WHERE store_id = $1 AND is_available = TRUE 
         ORDER BY category, name`,
                [storeId]
            );

            res.json({
                success: true,
                store: storeResult.rows[0],
                products: productsResult.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Place an order
     */
    async placeOrder(req, res, next) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const userId = req.user.id;
            const { storeId, items, deliveryAddress, deliveryLatitude, deliveryLongitude, notes } = req.body;

            // Verify store exists and is active
            const storeResult = await client.query(
                'SELECT * FROM stores WHERE id = $1 AND is_approved = TRUE AND is_active = TRUE',
                [storeId]
            );

            if (storeResult.rows.length === 0) {
                throw new Error('Store not found or inactive');
            }

            // Calculate subtotal and validate products
            let subtotal = 0;
            const orderItems = [];

            for (const item of items) {
                const productResult = await client.query(
                    'SELECT * FROM products WHERE id = $1 AND store_id = $2 AND is_available = TRUE',
                    [item.productId, storeId]
                );

                if (productResult.rows.length === 0) {
                    throw new Error(`Product ${item.productId} not found or unavailable`);
                }

                const product = productResult.rows[0];

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                const itemSubtotal = product.price * item.quantity;
                subtotal += itemSubtotal;

                orderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price,
                    quantity: item.quantity,
                    subtotal: itemSubtotal
                });

                // Update stock (optional - can be done on order acceptance)
                // await client.query(
                //   'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                //   [item.quantity, product.id]
                // );
            }

            // Calculate commission and total
            const deliveryFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE) || 50;
            const commissionAmount = await commissionService.calculateCommission(subtotal);
            const totalAmount = subtotal + deliveryFee;

            // Generate order number
            const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Generate delivery OTP
            const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (
          order_number, user_id, store_id, delivery_address, 
          delivery_latitude, delivery_longitude, subtotal, delivery_fee,
          commission_amount, total_amount, delivery_otp, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
                [
                    orderNumber, userId, storeId, deliveryAddress,
                    deliveryLatitude, deliveryLongitude, subtotal, deliveryFee,
                    commissionAmount, totalAmount, deliveryOTP, notes, 'PLACED'
                ]
            );

            const order = orderResult.rows[0];

            // Create order items
            for (const item of orderItems) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [order.id, item.productId, item.productName, item.productPrice, item.quantity, item.subtotal]
                );
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                order: {
                    ...order,
                    items: orderItems
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }

    /**
     * Get user orders
     */
    async getOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const { status } = req.query;

            let query = `
        SELECT o.*, s.store_name, s.address as store_address,
               r.vehicle_type, u_rider.name as rider_name, u_rider.mobile as rider_mobile,
               p.status as payment_status
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        LEFT JOIN riders r ON o.rider_id = r.id
        LEFT JOIN users u_rider ON r.user_id = u_rider.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.user_id = $1
      `;

            const params = [userId];

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
     * Get order details
     */
    async getOrderDetails(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const orderResult = await db.query(
                `SELECT o.*, s.store_name, s.address as store_address, s.mobile as store_mobile,
                r.vehicle_type, r.vehicle_number, 
                u_rider.name as rider_name, u_rider.mobile as rider_mobile,
                p.status as payment_status, p.razorpay_payment_id
         FROM orders o
         JOIN stores s ON o.store_id = s.id
         LEFT JOIN riders r ON o.rider_id = r.id
         LEFT JOIN users u_rider ON r.user_id = u_rider.id
         LEFT JOIN payments p ON o.id = p.order_id
         WHERE o.id = $1 AND o.user_id = $2`,
                [orderId, userId]
            );

            if (orderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const itemsResult = await db.query(
                'SELECT * FROM order_items WHERE order_id = $1',
                [orderId]
            );

            res.json({
                success: true,
                order: orderResult.rows[0],
                items: itemsResult.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel order (only if status is PLACED)
     */
    async cancelOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;

            const result = await db.query(
                `UPDATE orders 
         SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2 AND status = 'PLACED'
         RETURNING *`,
                [orderId, userId]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({
                    error: 'Cannot cancel order. Order not found or already processed'
                });
            }

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                order: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
