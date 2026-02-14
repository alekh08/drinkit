import { Minus, Plus, ShoppingCart, Store, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const { data } = await api.get('/users/stores/nearby');
            setStores(data.stores);
        } catch (error) {
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    const viewStore = async (storeId) => {
        try {
            const { data } = await api.get(`/users/stores/${storeId}`);
            setSelectedStore(data.store);
            setProducts(data.products);
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
            toast.success(`${product.name} quantity increased`);
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
            toast.success(`${product.name} added to cart`);
        }
    };

    const updateQuantity = (productId, change) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) return item;
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
        toast.success('Item removed from cart');
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        navigate('/coming-soon');
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Nav with Logo and Tagline */}
            <nav className="bg-white shadow-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo and Tagline Section */}
                        <div className="flex items-center gap-4">
                            <img
                                src="/drinkit-logo.png"
                                alt="DRINKIT"
                                className="h-14 object-contain"
                            />
                            <div className="hidden md:block border-l border-gray-300 pl-4">
                                <p className="text-xs text-gray-600 italic leading-tight">
                                    Because the night needs a drink
                                </p>
                                <p className="text-sm text-primary-600 font-bold">
                                    Liquor at your door
                                </p>
                            </div>
                        </div>

                        {/* Right side - Cart and User */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowCart(true)}
                                className="relative hover:bg-gray-100 p-2 rounded-lg transition"
                            >
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow">
                                    <span className="text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Cart Sidebar Modal */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowCart(false)}
                    ></div>

                    {/* Cart Panel */}
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-primary-600 text-white">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Your Cart</h2>
                            </div>
                            <button
                                onClick={() => setShowCart(false)}
                                className="hover:bg-primary-700 p-2 rounded-lg transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                                    <p className="text-lg font-medium">Your cart is empty</p>
                                    <p className="text-sm mt-1">Add some products to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                    <p className="text-sm text-gray-600">{item.brand} • {item.volume}</p>
                                                    <p className="text-lg font-bold text-primary-600 mt-1">₹{item.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-300 px-2 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        disabled={item.quantity <= 1}
                                                        className="text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="text-gray-600 hover:text-primary-600 p-1"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Subtotal</p>
                                                    <p className="text-lg font-bold text-gray-800">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer with Total and Checkout */}
                        {cart.length > 0 && (
                            <div className="border-t bg-gray-50 p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                                    <span className="text-2xl font-bold text-primary-600">₹{getCartTotal()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="btn-primary w-full py-3 text-lg font-semibold"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {!selectedStore ? (
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Nearby Stores</h2>
                        <p className="text-gray-600 mb-6">Browse and order from local liquor stores</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stores.map((store) => (
                                <div key={store.id} className="card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => viewStore(store.id)}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Store className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-800">{store.store_name}</h3>
                                            <p className="text-sm text-gray-600">{store.address}</p>
                                            <p className="text-xs text-gray-500 mt-2">📦 {store.product_count} products</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => setSelectedStore(null)} className="mb-4 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                            ← Back to Stores
                        </button>
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">{selectedStore.store_name}</h2>
                        <p className="text-gray-600 mb-6">{selectedStore.address}</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{product.brand} • {product.volume}</p>
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-2xl font-bold text-primary-600">₹{product.price}</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="btn-primary py-2 px-5 text-sm flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add to Cart
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

export default UserDashboard;
