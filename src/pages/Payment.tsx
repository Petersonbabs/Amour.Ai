import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

// Currency data - supported currencies with their Flutterwave codes and conversion rates
const SUPPORTED_CURRENCIES = {
  // African countries
  NGN: { country: 'Nigeria', symbol: '₦', name: 'Naira' },
  KES: { country: 'Kenya', symbol: 'KSh', name: 'Kenyan Shilling' },
  GHS: { country: 'Ghana', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  UGX: { country: 'Uganda', symbol: 'USh', name: 'Ugandan Shilling' },
  TZS: { country: 'Tanzania', symbol: 'TSh', name: 'Tanzanian Shilling' },
  ZAR: { country: 'South Africa', symbol: 'R', name: 'South African Rand' },
  // Other regions
  USD: { country: 'United States', symbol: '$', name: 'US Dollar' },
  EUR: { country: 'European Union', symbol: '€', name: 'Euro' },
  GBP: { country: 'United Kingdom', symbol: '£', name: 'British Pound' },
  CAD: { country: 'Canada', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { country: 'Australia', symbol: 'A$', name: 'Australian Dollar' },
} as const;

type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Base amount in USD
const BASE_AMOUNT_USD = 0.10; // Example: $3 USD

export function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { formData } = location.state || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'generating' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Currency state
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!formData) {
      navigate('/create');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || '');
      if (!session) {
        toast('Please log in to continue', 'error');
        navigate('/login');
      }
    });

    // Detect user's location and currency
    detectUserCurrency();
  }, [formData, navigate]);

  // Function to detect user's currency
  const detectUserCurrency = async () => {
    try {
      // Method 1: Try using IP geolocation API
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();

      const countryCode = geoData.country_code;
      const currencyCode = geoData.currency;

      // Check if this currency is supported by Flutterwave
      let selectedCurrency: CurrencyCode = 'USD'; // Default fallback

      if (currencyCode && SUPPORTED_CURRENCIES[currencyCode as CurrencyCode]) {
        selectedCurrency = currencyCode as CurrencyCode;
      } else {
        // Map country to currency if direct currency code not supported
        const countryCurrencyMap: Record<string, CurrencyCode> = {
          'NG': 'NGN',
          'KE': 'KES',
          'GH': 'GHS',
          'UG': 'UGX',
          'TZ': 'TZS',
          'ZA': 'ZAR',
          'US': 'USD',
          'GB': 'GBP',
          'CA': 'CAD',
          'AU': 'AUD',
          'DE': 'EUR',
          'FR': 'EUR',
          'IT': 'EUR',
          'ES': 'EUR',
        };

        if (countryCode && countryCurrencyMap[countryCode]) {
          selectedCurrency = countryCurrencyMap[countryCode];
        }
      }

      // Get exchange rates
      await fetchExchangeRates(selectedCurrency);

    } catch (error) {
      console.error('Failed to detect location:', error);
      // Fallback to USD with default exchange rate
      setUserCurrency('USD');
      setConvertedAmount(BASE_AMOUNT_USD);
    } finally {
      setIsDetecting(false);
    }
  };

  // Fetch exchange rates from an API
  const fetchExchangeRates = async (targetCurrency: CurrencyCode) => {
    try {
      // Using a free exchange rate API
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = await response.json();

      setExchangeRates(data.rates);

      // Calculate converted amount
      const rate = data.rates[targetCurrency] || 1;
      const amount = BASE_AMOUNT_USD * rate;

      // Round to 2 decimal places
      const roundedAmount = Math.round(amount * 100) / 100;

      setUserCurrency(targetCurrency);
      setConvertedAmount(roundedAmount);

    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates (you should update these periodically)
      const fallbackRates: Record<string, number> = {
        NGN: 1500,  // Example: 1 USD = 1500 NGN
        KES: 150,
        GHS: 12,
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.35,
        AUD: 1.52,
        USD: 1,
      };

      setExchangeRates(fallbackRates);
      const amount = BASE_AMOUNT_USD * (fallbackRates[targetCurrency] || 1);
      const roundedAmount = Math.round(amount * 100) / 100;

      setUserCurrency(targetCurrency);
      setConvertedAmount(roundedAmount);
    }
  };

  // Format currency display
  const formatCurrency = (amount: number, currency: CurrencyCode) => {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    return `${currencyInfo.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: Date.now().toString(),
    amount: convertedAmount,
    currency: userCurrency,
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: userEmail || formData?.email || '',
      phone_number: formData?.phone || '',
      name: formData?.partnerName || 'Valued Customer',
    },
    customizations: {
      title: 'Amour Love Letter',
      description: 'Unlock your personalized masterpiece',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  const handleSuccess = async (response: any) => {
    closePaymentModal();

    if (response.status === 'successful') {
      setStatus('verifying');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
        if (sessionError || !session) {
          throw new Error("Session expired. Please sign in again.");
        }

        // Pass currency info to backend
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            transaction_id: response.transaction_id,
            prompt_data: formData,
            currency: userCurrency,
            amount_paid: convertedAmount,
            base_amount_usd: BASE_AMOUNT_USD
          }
        });

        if (error) {
          if (error.code === 401 || error.context?.status === 401) {
            throw new Error("Authentication failed. Please sign out and sign in again.");
          }
          throw error;
        }

        if (data && (data.error || data.success === false)) {
          throw new Error(data.error || "Payment verification failed backend");
        }

        navigate('/result', { state: { letter: data.letter } });
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || JSON.stringify(err));
        setStatus('error');
      }
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
          {/* <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-[#666] mr-2" />
              <span className="font-medium text-[#2A2A2A]">Payment Currency</span>
            </div>
            {isDetecting ? (
              <span className="text-sm text-[#8B1E3F]">Detecting your location...</span>
            ) : (
              <span className="text-sm text-[#666]">
                Detected: {SUPPORTED_CURRENCIES[userCurrency].country}
              </span>
            )}
          </div> */}

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

        {/* Rest of your component remains the same... */}
        {status === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex flex-col items-start">
            {/* Error UI */}
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

        {/* <p className="text-center text-xs text-[#999] mt-6">
          Secured by Flutterwave • Multiple currencies supported
        </p> */}
      </motion.div>
    </div>
  );
}