import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode, BASE_AMOUNT_USD } from '../hooks/useCurrency';

export function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { formData } = location.state || {}; // Although checking formData is good, sometimes we might just want to pay? No, this is "Generate Letter" flow.
  const [status, setStatus] = useState<'idle' | 'verifying' | 'generating' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Use the custom hook for all currency logic
  const {
    userCurrency,
    setUserCurrency,
    convertedAmount,
    setConvertedAmount,
    isDetecting,
    exchangeRates,
    formatCurrency,
    detectUserCurrency
  } = useCurrency();

  // Initial Check and User Setup
  useEffect(() => {
    if (!formData) {
      navigate('/create');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || '');
      if (!session) {
        toast('Please log in to continue', 'error');
        navigate('/login');
        return;
      }

      // Check Subscription Status
      if (session.user.user_metadata?.isSubscribed) {
        generateLetterVerified(null);
      }
    });

    // Detect user's location and currency via hook
    // The hook has its own useEffect, but we can call it explicitly if needed, 
    // or rely on the hook's internal useEffect. 
    // The hook's useEffect calls detectUserCurrency on mount. Use that.
    // However, the hook is imported. It runs its effect.
    // Wait, the hook source I saw (step 431) has `useEffect(() => { detectUserCurrency(); }, [])`.
    // So distinct calls here might be redundant but harmless.

  }, [formData, navigate]);

  const generateLetterVerified = async (transactionId: string | null) => {
    setStatus('verifying');
    try {
      // Refresh session first to ensure token is valid
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !session) {
        throw new Error("Session expired. Please sign in again.");
      }

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          transaction_id: transactionId,
          prompt_data: formData,
          currency: userCurrency,
          amount_paid: convertedAmount,
          base_amount_usd: BASE_AMOUNT_USD
        }
      });

      if (error) throw error;
      if (data && (data.error || data.success === false)) {
        throw new Error(data.error || "Generation failed");
      }

      navigate('/result', { state: { letter: data.letter } });

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong");
      setStatus('error');
    }
  };

  // Flutterwave Config
  // Ensure we use the User's email if available, else generic.
  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: Date.now().toString(),
    amount: convertedAmount,
    currency: userCurrency,
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: userEmail || 'user@example.com',
      phone_number: '',
      name: 'Amour User',
    },
    customizations: {
      title: 'Amour Letter Generation',
      description: 'Generate your love letter',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  // Initialize Flutterwave Hook
  const handleFlutterwavePayment = useFlutterwave(config);

  const handleSuccess = async (response: any) => {
    closePaymentModal();
    if (response.status === 'successful') {
      await generateLetterVerified(response.transaction_id);
    }
  };

  // Allow user to manually change currency
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (exchangeRates[newCurrency]) {
      const amount = BASE_AMOUNT_USD * exchangeRates[newCurrency];
      const roundedAmount = Math.round(amount * 100) / 100;
      setUserCurrency(newCurrency);
      setConvertedAmount(roundedAmount);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFF5F5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8B1E3F]">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">Unlock Your Love Letter</h2>
          <p className="text-[#666]">
            Your masterpiece is ready to be generated by our advanced AI.
          </p>
        </div>

        {/* Currency Selection */}
        <div className="mb-6 bg-[#FAFAFA] rounded-xl p-4 border border-[#E5E5E5]">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm">
              <span className="text-[#666] mr-2">Base amount:</span>
              <span className="font-medium">${BASE_AMOUNT_USD} USD</span>
            </div>

            <select
              value={userCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              className="px-3 py-1.5 border border-[#E5E5E5] rounded-lg bg-white text-[#2A2A2A] text-sm focus:outline-none focus:border-[#8B1E3F]"
              disabled={isDetecting}
            >
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.country} ({code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E5E5E5]">
          <div className="flex flex-col sm:flex-col justify-between items-center mb-4 pb-4 border-b border-[#E5E5E5]">
            <span className="font-medium text-[#2A2A2A]">Love Letter Generation</span>
            <span className="font-bold text-[#2A2A2A] text-2xl">
              {formatCurrency(convertedAmount, userCurrency)}
            </span>
          </div>


          {userCurrency !== 'USD' && (
            <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
              <p className="text-xs text-[#999] text-center">
                ≈ ${BASE_AMOUNT_USD} USD • Rate: 1 USD = {exchangeRates[userCurrency]?.toFixed(2) || '...'}
              </p>
            </div>
          )}
        </div>

        {status === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {status === 'verifying' ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[#8B1E3F] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#8B1E3F] font-medium">Crafting your letter...</p>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              handleFlutterwavePayment({
                callback: handleSuccess,
                onClose: () => console.log("closed"),
              });
            }}
            disabled={isDetecting}
          >
            {isDetecting ? 'Detecting Currency...' : `Pay ${formatCurrency(convertedAmount, userCurrency)}`}
          </Button>
        )}
      </motion.div>
    </div>
  );
}