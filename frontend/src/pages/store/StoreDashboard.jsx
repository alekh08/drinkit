import { DollarSign, Package, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StoreDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/stores/dashboard');
            setStats(data.stats);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/stores/products');
            setProducts(data.products);
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/stores/orders?status=PLACED');
            setOrders(data.orders);
        } catch (error) {
            toast.error('Failed to load orders');
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            await api.put(`/stores/orders/${orderId}/accept`);
            toast.success('Order accepted');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to accept order');
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
                                <p className="text-xs text-gray-600 font-semibold">Store Dashboard</p>
                                <p className="text-sm text-gray-800 font-bold">{user.name}</p>
                            </div>
                        </div>
                        <div className="badge-success px-3 py-1 text-sm">STORE</div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>

                {stats && (
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-10 h-10 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Pending Orders</p>
                                    <p className="text-2xl font-bold">{stats.pending_orders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Package className="w-10 h-10 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Products</p>
                                    <p className="text-2xl font-bold">{stats.total_products}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-10 h-10 text-primary-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Earnings</p>
                                    <p className="text-2xl font-bold">₹{stats.total_earnings}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-10 h-10 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed_orders}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Orders</h3>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="card">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{order.order_number}</h4>
                                    <p className="text-sm text-gray-600">{order.customer_name} • {order.customer_mobile}</p>
                                    <p className="text-lg font-bold mt-2 text-primary-600">₹{order.total_amount}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => acceptOrder(order.id)} className="btn-primary py-1.5 px-4 text-sm">
                                        Accept
                                    </button>
                                    <button className="btn-secondary py-1.5 px-4 text-sm">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoreDashboard;
