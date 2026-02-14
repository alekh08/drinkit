const db = require('../config/database');

class CommissionService {
    /**
     * Get active commission rate
     */
    async getActiveCommission() {
        const result = await db.query(
            'SELECT commission_percentage FROM commissions WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
        );

        if (result.rows.length === 0) {
            return parseFloat(process.env.DEFAULT_COMMISSION_PERCENTAGE) || 15.0;
        }

        return parseFloat(result.rows[0].commission_percentage);
    }

    /**
     * Calculate commission amount
     */
    async calculateCommission(subtotal) {
        const commissionPercentage = await this.getActiveCommission();
        return (subtotal * commissionPercentage) / 100;
    }

    /**
     * Update commission rate
     */
    async updateCommission(newPercentage) {
        // Deactivate all existing commissions
        await db.query('UPDATE commissions SET is_active = FALSE');

        // Insert new commission rate
        const result = await db.query(
            'INSERT INTO commissions (commission_percentage, is_active) VALUES ($1, TRUE) RETURNING *',
            [newPercentage]
        );

        return result.rows[0];
    }
}

module.exports = new CommissionService();
