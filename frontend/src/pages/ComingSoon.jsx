import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <div className="text-center max-w-2xl">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/drinkit-logo.png"
                        alt="DRINKIT"
                        className="h-40 object-contain drop-shadow-2xl animate-pulse"
                    />
                </div>

                {/* Taglines */}
                <div className="mb-12">
                    <h1 className="text-white text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
                        Because the night needs a drink
                    </h1>
                    <h2 className="text-yellow-300 text-4xl md:text-5xl font-bold tracking-wide drop-shadow-lg">
                        Liquor at your door
                    </h2>
                </div>

                {/* Coming Soon Message */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                        🚀 Feature Coming Soon!
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                        We're working hard to bring you an amazing checkout experience. Stay tuned!
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-primary py-3 px-8 text-lg font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Shopping
                    </button>
                </div>

                {/* Additional Info */}
                <p className="text-white/80 text-sm mt-8">
                    Thank you for your patience. This feature will be available soon! 🍾
                </p>
            </div>
        </div>
    );
};

export default ComingSoon;
