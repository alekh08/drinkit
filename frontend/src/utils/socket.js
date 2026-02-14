import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('✓ Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('✗ Socket disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;

export const subscribeToOrderUpdates = (callback) => {
    if (!socket) return;

    socket.on('order:update', callback);
    socket.on('order:new', callback);
    socket.on('order:available', callback);
};

export const unsubscribeFromOrderUpdates = () => {
    if (!socket) return;

    socket.off('order:update');
    socket.off('order:new');
    socket.off('order:available');
};
