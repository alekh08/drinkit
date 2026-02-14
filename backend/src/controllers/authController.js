const jwt = require('jsonwebtoken');
const db = require('../config/database');
const otpService = require('../services/otpService');

class AuthController {
    /**
     * Send OTP to mobile number
     */
    async sendOTP(req, res, next) {
        try {
            const { mobile, role } = req.body;

            // Check if user exists
            const userResult = await db.query(
                'SELECT id, role, is_active FROM users WHERE mobile = $1',
                [mobile]
            );

            let user = userResult.rows[0];

            // If user doesn't exist and role is provided, create new user
            if (!user && role) {
                const insertResult = await db.query(
                    'INSERT INTO users (mobile, name, role, is_verified) VALUES ($1, $2, $3, FALSE) RETURNING *',
                    [mobile, `User ${mobile.slice(-4)}`, role]
                );
                user = insertResult.rows[0];
            }

            if (user && !user.is_active) {
                return res.status(403).json({ error: 'Account is inactive' });
            }

            // Generate and send OTP
            const result = await otpService.generateAndSendOTP(mobile);

            res.json({
                success: true,
                message: result.message,
                exists: !!userResult.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify OTP and login
     */
    async verifyOTP(req, res, next) {
        try {
            const { mobile, otp, name } = req.body;

            // Verify OTP
            const otpResult = await otpService.verifyOTP(mobile, otp);

            if (!otpResult.success) {
                return res.status(400).json({ error: otpResult.message });
            }

            // Get or update user
            const userResult = await db.query(
                'SELECT * FROM users WHERE mobile = $1',
                [mobile]
            );

            let user = userResult.rows[0];

            if (!user) {
                return res.status(404).json({ error: 'User not found. Please register first.' });
            }

            // Update name if provided and user is not verified
            if (name && !user.is_verified) {
                await db.query(
                    'UPDATE users SET name = $1, is_verified = TRUE WHERE id = $2',
                    [name, user.id]
                );
                user.name = name;
                user.is_verified = true;
            } else if (!user.is_verified) {
                await db.query(
                    'UPDATE users SET is_verified = TRUE WHERE id = $1',
                    [user.id]
                );
                user.is_verified = true;
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, mobile: user.mobile, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Get role-specific data
            let roleData = {};

            if (user.role === 'STORE') {
                const storeResult = await db.query(
                    'SELECT * FROM stores WHERE user_id = $1',
                    [user.id]
                );
                roleData.store = storeResult.rows[0] || null;
            } else if (user.role === 'RIDER') {
                const riderResult = await db.query(
                    'SELECT * FROM riders WHERE user_id = $1',
                    [user.id]
                );
                roleData.rider = riderResult.rows[0] || null;
            }

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    mobile: user.mobile,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.is_verified,
                    ...roleData
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;

            const result = await db.query(
                'SELECT id, mobile, name, email, role, is_verified, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];

            // Get role-specific data
            let roleData = {};

            if (user.role === 'STORE') {
                const storeResult = await db.query(
                    'SELECT * FROM stores WHERE user_id = $1',
                    [user.id]
                );
                roleData.store = storeResult.rows[0] || null;
            } else if (user.role === 'RIDER') {
                const riderResult = await db.query(
                    'SELECT * FROM riders WHERE user_id = $1',
                    [user.id]
                );
                roleData.rider = riderResult.rows[0] || null;
            }

            res.json({
                success: true,
                user: { ...user, ...roleData }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, email } = req.body;

            const result = await db.query(
                'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [name, email, userId]
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
