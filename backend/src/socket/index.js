const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✓ Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

        // Join role-based room
        socket.join(socket.userRole);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        socket.on('disconnect', () => {
            console.log(`✗ Socket disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

/**
 * Broadcast order status update to relevant parties
 */
const broadcastOrderUpdate = (order, updateType = 'status_change') => {
    if (!io) return;

    const event = {
        type: updateType,
        order: order,
        timestamp: new Date().toISOString()
    };

    // Notify customer
    io.to(`user:${order.user_id}`).emit('order:update', event);

    // Notify store
    if (order.store_id) {
        io.to(`user:${order.store_id}`).emit('order:update', event);
    }

    // Notify rider if assigned
    if (order.rider_id) {
        io.to(`user:${order.rider_id}`).emit('order:update', event);
    }

    // Notify all admins
    io.to('ADMIN').emit('order:update', event);
};

/**
 * Broadcast new order to store owners
 */
const broadcastNewOrder = (order) => {
    if (!io) return;

    io.to('STORE').emit('order:new', {
        type: 'new_order',
        order: order,
        timestamp: new Date().toISOString()
    });
};

/**
 * Broadcast available order to riders
 */
const broadcastAvailableOrder = (order) => {
    if (!io) return;

    io.to('RIDER').emit('order:available', {
        type: 'order_available',
        order: order,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    initializeSocket,
    getIO,
    broadcastOrderUpdate,
    broadcastNewOrder,
    broadcastAvailableOrder
};
