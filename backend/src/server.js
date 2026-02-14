require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocket } = require('./socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const riderRoutes = require('./routes/riderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later'
});

app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'DRINKIT API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection test
const testDatabaseConnection = async () => {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✓ Database connected successfully');
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            console.log('⚠️  Starting server without database connection');
        }

        // Connect to Redis
        await connectRedis();

        // Start HTTP server
        server.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 DRINKIT Backend Server');
            console.log('='.repeat(50));
            console.log(`🌐 Server running on: http://localhost:${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
            console.log(`💬 WebSocket: Connection enabled`);
            console.log('='.repeat(50) + '\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

startServer();

module.exports = { app, server };
