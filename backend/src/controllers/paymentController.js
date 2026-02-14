const paymentService = require('../services/paymentService');
const db = require('../config/database');

class PaymentController {
    /**
     * Initiate payment
     */
    async initiatePayment(req, res, next) {
        try {
            const { orderId } = req.body;
            const userId = req.user.id;

            // Verify order belongs to user
            const orderResult = await db.query(
                'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
                [orderId, userId]
            );

            if (orderResult.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const order = orderResult.rows[0];

            // Create Razorpay order
            const paymentOrder = await paymentService.createOrder(order.id, order.total_amount);

            res.json({
                success: true,
                payment: paymentOrder
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify payment
     */
    async verifyPayment(req, res, next) {
        try {
            const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

            // Verify signature
            const isValid = paymentService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid payment signature' });
            }

            // Update payment status
            const payment = await paymentService.updatePaymentStatus(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                'SUCCESS'
            );

            res.json({
                success: true,
                message: 'Payment verified successfully',
                orderId: payment.order_id
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Razorpay webhook handler
     */
    async handleWebhook(req, res, next) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const payload = req.body;

            // Verify webhook signature
            const isValid = paymentService.verifyWebhookSignature(payload, signature);

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid webhook signature' });
            }

            const event = payload.event;

            if (event === 'payment.captured') {
                const paymentEntity = payload.payload.payment.entity;

                // Update payment status
                await db.query(
                    `UPDATE payments 
           SET status = 'SUCCESS', 
               razorpay_payment_id = $1,
               payment_method = $2,
               paid_at = CURRENT_TIMESTAMP
           WHERE razorpay_order_id = $3`,
                    [paymentEntity.id, paymentEntity.method, paymentEntity.order_id]
                );
            } else if (event === 'payment.failed') {
                const paymentEntity = payload.payload.payment.entity;

                await db.query(
                    `UPDATE payments 
           SET status = 'FAILED'
           WHERE razorpay_order_id = $1`,
                    [paymentEntity.order_id]
                );
            }

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
