import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const RiderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchActiveOrder();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/riders/orders/available');
            setOrders(data.orders);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveOrder = async () => {
        try {
            const { data } = await api.get('/riders/orders/active');
            setActiveOrder(data.order);
        } catch (error) {
            // No active order
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            await api.post(`/riders/orders/${orderId}/accept`);
            toast.success('Order accepted');
            fetchOrders();
            fetchActiveOrder();
        } catch (error) {
            toast.error('Failed to accept order');
        }
    };

    const markPickedUp = async () => {
        try {
            await api.put(`/riders/orders/${activeOrder.id}/pickup`);
            toast.success('Order marked as picked up');
            fetchActiveOrder();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Nav with Logo */}
            <nav className="bg-white shadow-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img
                                src="/drinkit-logo.png"
                                alt="DRINKIT"
                                className="h-14 object-contain"
                            />
                            <div className="hidden md:block border-l border-gray-300 pl-4">
                                <p className="text-xs text-gray-600 font-semibold">Rider Dashboard</p>
                                <p className="text-sm text-gray-800 font-bold">Delivery Partner</p>
                            </div>
                        </div>
                        <div className="badge-info px-3 py-1 text-sm">RIDER</div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeOrder ? (
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Active Delivery</h2>
                        <div className="card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{activeOrder.order_number}</h3>
                                    <p className="text-sm text-gray-600">{activeOrder.store_name}</p>
                                    <p className="text-sm mt-2">{activeOrder.delivery_address}</p>
                                    <p className="text-lg font-bold mt-4 text-primary-600">₹{activeOrder.delivery_fee}</p>
                                </div>
                                <span className="badge-info">{activeOrder.status}</span>
                            </div>
                            {activeOrder.status === 'RIDER_ASSIGNED' && (
                                <button onClick={markPickedUp} className="btn-primary mt-4 w-full">
                                    Mark as Picked Up
                                </button>
                            )}
                            {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium">Delivery OTP: <span className="text-2xl font-bold ml-2">{activeOrder.delivery_otp}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Available Orders</h2>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{order.order_number}</h4>
                                            <p className="text-sm text-gray-600">{order.store_name} → {order.customer_name}</p>
                                            <p className="text-lg font-bold mt-2 text-primary-600">Earn: ₹{order.delivery_fee}</p>
                                        </div>
                                        <button onClick={() => acceptOrder(order.id)} className="btn-primary py-1.5 px-4 text-sm">
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderDashboard;
