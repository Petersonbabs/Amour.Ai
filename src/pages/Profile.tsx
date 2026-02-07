import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Heart, Clock, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useCurrency, BASE_AMOUNT_USD } from '../hooks/useCurrency';
import { useToast } from '../context/ToastContext';

interface Letter {
    id: string;
    created_at: string;
    content: string;
    prompt_data: any;
    is_paid: boolean;
}

export function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Currency Hook
    const {
        userCurrency,
        convertedAmount,
        formatCurrency
    } = useCurrency();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            setUser(session.user);

            // Fetch letters
            const { data, error } = await supabase
                .from('letters')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLetters(data || []);

        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Flutterwave Configuration
    const config = {
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now().toString(),
        amount: convertedAmount,
        currency: userCurrency,
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
            email: user?.email || '',
            phone_number: '',
            name: user?.user_metadata?.full_name || 'Valued Member',
        },
        customizations: {
            title: 'Amour Premium',
            description: 'Unlock unlimited letters',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(config);

    const handleSuccess = async (response: any) => {
        closePaymentModal();
        if (response.status === 'successful') {
            try {
                // Call verify-payment with NULL prompt_data to just subscribe
                const { error } = await supabase.functions.invoke('verify-payment', {
                    body: {
                        transaction_id: response.transaction_id,
                        prompt_data: null,
                        currency: userCurrency,
                        amount_paid: convertedAmount,
                        base_amount_usd: BASE_AMOUNT_USD
                    }
                });

                if (error) throw error;

                toast('Welcome to Premium! You can now generate unlimited letters.', 'success');

                // Refresh Profile and Session
                const { data } = await supabase.auth.refreshSession();
                setUser(data.session?.user || null);

            } catch (err) {
                console.error(err);
                toast('Payment successful but verification failed. Please contact support.', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF5F5]">
                <div className="animate-spin w-8 h-8 border-4 border-[#8B1E3F] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6 bg-[#FFF5F5]">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5]/50 flex flex-col md:flex-row items-center md:items-start gap-6"
                >
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#fce7f3] border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-3xl font-serif text-[#8B1E3F]">
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.email?.[0].toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-serif text-[#2A2A2A] mb-1">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </h1>
                        <p className="text-[#666] mb-4">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${user?.user_metadata?.isSubscribed ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#FFF5F5] text-[#8B1E3F] border-[#ffe4e6]'}`}>
                                {user?.user_metadata?.isSubscribed ? 'Premium Member' : 'Standard Member'}
                            </span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Joined {formatDate(user?.created_at || new Date().toISOString())}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content: Letters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 space-y-6"
                    >
                        <h2 className="text-xl font-serif text-[#2A2A2A] flex items-center">
                            <Heart className="w-5 h-5 text-[#8B1E3F] mr-2" />
                            Your Love Letters
                        </h2>

                        {letters.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] text-center py-16">
                                <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8B1E3F]/50">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-[#2A2A2A] mb-2">No letters yet</h3>
                                <p className="text-[#666] mb-6">Start writing your first masterpiece today.</p>
                                <Button onClick={() => navigate('/create')}>Create New Letter</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {letters.map((letter) => (
                                    <div
                                        key={letter.id}
                                        className="bg-white p-5 rounded-2xl border border-[#E5E5E5] hover:border-[#8B1E3F]/30 hover:shadow-md transition-all group cursor-pointer"
                                        onClick={() => navigate('/result', { state: { letter: letter.content } })}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-[#2A2A2A] group-hover:text-[#8B1E3F] transition-colors">
                                                    For {letter.prompt_data?.partnerName || 'My Love'}
                                                </h3>
                                                <p className="text-xs text-[#999] mt-1 flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {formatDate(letter.created_at)}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#8B1E3F] transition-colors" />
                                        </div>
                                        <p className="text-sm text-[#666] line-clamp-2 italic">
                                            "{letter.content.substring(0, 100).replace(/[#*_]/g, '')}..."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar: Plan Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-serif text-[#2A2A2A] flex items-center">
                            <DollarSign className="w-5 h-5 text-[#8B1E3F] mr-2" />
                            Payment Plan
                        </h2>

                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
                                <span className="font-medium text-[#4A4A4A]">Current Plan</span>
                                <span className={`${user?.user_metadata?.isSubscribed ? 'text-amber-600' : 'text-[#8B1E3F]'} font-bold`}>
                                    {user?.user_metadata?.isSubscribed ? 'Premium' : 'Standard'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#666]">Cost per letter</span>
                                    <span className="font-medium text-[#2A2A2A]">
                                        {user?.user_metadata?.isSubscribed ? 'Free' : formatCurrency(convertedAmount, userCurrency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#666]">Letters Generated</span>
                                    <span className="font-medium text-[#2A2A2A]">{letters.length}</span>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 space-y-3">
                                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/create')}>
                                    Generate New Letter
                                </Button>

                                {!user?.user_metadata?.isSubscribed && (
                                    <div className="bg-[#FFF5F5] p-3 rounded-xl border border-[#ffe4e6]">
                                        <p className="text-[10px] text-[#8B1E3F] mb-2 leading-relaxed">
                                            Unlock Premium for <b>{formatCurrency(convertedAmount, userCurrency)}</b>. One-time payment.
                                        </p>
                                        <Button
                                            variant="primary"
                                            className="w-full text-xs h-8 bg-[#8B1E3F] hover:bg-[#701630] text-white"
                                            onClick={() => {
                                                handleFlutterwavePayment({
                                                    callback: handleSuccess,
                                                    onClose: () => { }
                                                })
                                            }}
                                        >
                                            Unlock Premium
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
