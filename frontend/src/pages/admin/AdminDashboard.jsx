import { Bike, Shield, ShoppingCart, Store, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingStores, setPendingStores] = useState([]);
    const [pendingRiders, setPendingRiders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchPendingApprovals();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data.stats);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingApprovals = async () => {
        try {
            const [storesRes, ridersRes] = await Promise.all([
                api.get('/admin/stores/pending'),
                api.get('/admin/riders/pending')
            ]);
            setPendingStores(storesRes.data.stores);
            setPendingRiders(ridersRes.data.riders);
        } catch (error) {
            toast.error('Failed to load pending approvals');
        }
    };

    const approveStore = async (storeId) => {
        try {
            await api.put(`/admin/stores/${storeId}/approve`, { isApproved: true });
            toast.success('Store approved');
            fetchPendingApprovals();
            fetchDashboard();
        } catch (error) {
            toast.error('Failed to approve store');
        }
    };

    const approveRider = async (riderId) => {
        try {
            await api.put(`/admin/riders/${riderId}/approve`, { isApproved: true });
            toast.success('Rider approved');
            fetchPendingApprovals();
            fetchDashboard();
        } catch (error) {
            toast.error('Failed to approve rider');
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
                                <p className="text-xs text-gray-600 font-semibold">Admin Dashboard</p>
                                <p className="text-sm text-gray-800 font-bold">Platform Control</p>
                            </div>
                        </div>
                        <div className="badge-error px-3 py-1 text-sm flex items-center gap-1">
                            <Shield className="w-4 h-4" /> ADMIN
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

                {stats && (
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Users className="w-10 h-10 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold">{stats.total_users}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Store className="w-10 h-10 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Approved Stores</p>
                                    <p className="text-2xl font-bold">{stats.approved_stores}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Bike className="w-10 h-10 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Approved Riders</p>
                                    <p className="text-2xl font-bold">{stats.approved_riders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-10 h-10 text-primary-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.total_orders}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Store Approvals</h3>
                        <div className="space-y-4">
                            {pendingStores.map((store) => (
                                <div key={store.id} className="card">
                                    <h4 className="font-semibold">{store.store_name}</h4>
                                    <p className="text-sm text-gray-600">{store.owner_name} • {store.owner_mobile}</p>
                                    <p className="text-sm text-gray-500 mt-1">License: {store.license_number}</p>
                                    <button onClick={() => approveStore(store.id)} className="btn-primary mt-3 w-full py-1.5 text-sm">
                                        Approve Store
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Rider Approvals</h3>
                        <div className="space-y-4">
                            {pendingRiders.map((rider) => (
                                <div key={rider.id} className="card">
                                    <h4 className="font-semibold">{rider.rider_name}</h4>
                                    <p className="text-sm text-gray-600">{rider.rider_mobile}</p>
                                    <p className="text-sm text-gray-500 mt-1">Vehicle: {rider.vehicle_type} • {rider.vehicle_number}</p>
                                    <button onClick={() => approveRider(rider.id)} className="btn-primary mt-3 w-full py-1.5 text-sm">
                                        Approve Rider
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
