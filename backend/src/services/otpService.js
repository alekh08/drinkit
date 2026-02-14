const { redisClient } = require('../config/redis');

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 || 300; // 5 minutes in seconds
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;

class OTPService {
    /**
     * Generate a random OTP
     */
    generateOTP() {
        const min = Math.pow(10, OTP_LENGTH - 1);
        const max = Math.pow(10, OTP_LENGTH) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    /**
     * Store OTP in Redis
     */
    async storeOTP(mobile, otp) {
        const key = `otp:${mobile}`;
        await redisClient.setEx(key, OTP_EXPIRY, otp);
        console.log(`OTP stored for ${mobile}: ${otp} (expires in ${OTP_EXPIRY}s)`);
    }

    /**
     * Verify OTP
     */
    async verifyOTP(mobile, otp) {
        const key = `otp:${mobile}`;
        const storedOTP = await redisClient.get(key);

        if (!storedOTP) {
            return { success: false, message: 'OTP expired or not found' };
        }

        if (storedOTP !== otp) {
            return { success: false, message: 'Invalid OTP' };
        }

        // Delete OTP after successful verification
        await redisClient.del(key);
        return { success: true, message: 'OTP verified successfully' };
    }

    /**
     * Send OTP (Mock implementation - in production, integrate SMS service)
     */
    async sendOTP(mobile, otp) {
        // In production, integrate with SMS service like Twilio, MSG91, etc.
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📱 OTP for ${mobile}: ${otp}`);
        console.log(`Valid for ${OTP_EXPIRY / 60} minutes`);
        console.log(`${'='.repeat(50)}\n`);

        return { success: true, message: 'OTP sent successfully' };
    }

    /**
     * Generate and send OTP
     */
    async generateAndSendOTP(mobile) {
        const otp = this.generateOTP();
        await this.storeOTP(mobile, otp);
        const result = await this.sendOTP(mobile, otp);
        return result;
    }
}

module.exports = new OTPService();
