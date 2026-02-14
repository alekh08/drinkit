const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/database');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService {
    /**
     * Create Razorpay order
     */
    async createOrder(orderId, amount) {
        try {
            const options = {
                amount: Math.round(amount * 100), // Amount in paise
                currency: 'INR',
                receipt: orderId,
                notes: {
                    order_id: orderId,
                    platform: 'DRINKIT'
                }
            };

            const razorpayOrder = await razorpay.orders.create(options);

            // Store payment record
            await db.query(
                `INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5)`,
                [orderId, razorpayOrder.id, amount, 'INR', 'PENDING']
            );

            return {
                success: true,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID
            };
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw new Error('Failed to create payment order');
        }
    }

    /**
     * Verify payment signature
     */
    verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const text = `${razorpayOrderId}|${razorpayPaymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === razorpaySignature;
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(razorpayOrderId, razorpayPaymentId, razorpaySignature, status) {
        try {
            const result = await db.query(
                `UPDATE payments 
         SET razorpay_payment_id = $1, 
             razorpay_signature = $2, 
             status = $3,
             paid_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE razorpay_order_id = $4
         RETURNING order_id`,
                [razorpayPaymentId, razorpaySignature, status, razorpayOrderId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error('Failed to update payment status');
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        return expectedSignature === signature;
    }

    /**
     * Calculate payouts
     */
    async calculatePayouts(orderId) {
        const result = await db.query(
            `SELECT o.total_amount, o.delivery_fee, o.commission_amount,
              o.store_id, o.rider_id
       FROM orders o
       WHERE o.id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = result.rows[0];
        const storePayout = order.total_amount - order.delivery_fee - order.commission_amount;
        const riderPayout = order.delivery_fee;
        const platformCommission = order.commission_amount;

        return {
            store: { id: order.store_id, amount: storePayout },
            rider: { id: order.rider_id, amount: riderPayout },
            platform: { amount: platformCommission }
        };
    }
}

module.exports = new PaymentService();
