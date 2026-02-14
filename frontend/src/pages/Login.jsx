import { KeyRound, Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
    const { login } = useAuth();
    const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
    const [role, setRole] = useState('USER');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [userExists, setUserExists] = useState(true);

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/send-otp', { mobile, role });
            setUserExists(data.exists);
            setStep('otp');
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        if (!userExists && !name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', {
                mobile,
                otp,
                ...(name && { name })
            });

            toast.success(data.message);
            login(data.user, data.token);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Logo & Tagline */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/drinkit-logo.png"
                            alt="DRINKIT"
                            className="h-28 object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Tagline */}
                    <div className="mb-5 pb-5 border-b-2 border-gray-200">
                        <p className="text-gray-700 font-semibold text-lg italic leading-relaxed">
                            Because the night needs a drink
                        </p>
                        <p className="text-primary-600 font-extrabold text-2xl mt-2 tracking-wide">
                            Liquor at your door
                        </p>
                    </div>

                    <p className="text-gray-700 text-base font-semibold">
                        {step === 'mobile' ? 'Sign in to continue' : 'Verify OTP'}
                    </p>
                </div>

                {step === 'mobile' ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="input-field"
                            >
                                <option value="USER">Customer</option>
                                <option value="STORE">Store Owner</option>
                                <option value="RIDER">Delivery Partner</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {/* Mobile Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit mobile"
                                    className="input-field pl-10"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || mobile.length !== 10}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <p className="text-sm text-gray-600 text-center">
                            OTP sent to <span className="font-semibold">{mobile}</span>
                            <button
                                type="button"
                                onClick={() => setStep('mobile')}
                                className="text-primary-600 ml-2 hover:underline"
                            >
                                Change
                            </button>
                        </p>

                        {!userExists && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="input-field"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="6-digit OTP"
                                    className="input-field pl-10 text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="btn-outline w-full"
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                <p className="text-xs text-center text-gray-500 mt-6">
                    By continuing, you agree to DRINKIT's Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
