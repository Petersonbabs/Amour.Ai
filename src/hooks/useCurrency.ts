import { useState, useEffect } from 'react';

// Currency data - supported currencies with their Flutterwave codes and conversion rates
export const SUPPORTED_CURRENCIES = {
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

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const BASE_AMOUNT_USD = 0.10;

export function useCurrency() {
    const [userCurrency, setUserCurrency] = useState<CurrencyCode>('USD');
    const [convertedAmount, setConvertedAmount] = useState<number>(BASE_AMOUNT_USD);
    const [isDetecting, setIsDetecting] = useState(true);
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    useEffect(() => {
        detectUserCurrency();
    }, []);

    const detectUserCurrency = async () => {
        try {
            setIsDetecting(true);
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
            // Fallback rates
            const fallbackRates: Record<string, number> = {
                NGN: 1500,
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

    const formatCurrency = (amount: number, currency: CurrencyCode) => {
        const currencyInfo = SUPPORTED_CURRENCIES[currency];
        return `${currencyInfo.symbol}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return {
        userCurrency,
        setUserCurrency,
        convertedAmount,
        setConvertedAmount,
        isDetecting,
        exchangeRates,
        formatCurrency,
        fetchExchangeRates,
        detectUserCurrency
    };
}
