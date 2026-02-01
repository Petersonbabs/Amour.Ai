import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                // No alerts found in Login.tsx based on view_file output. 
                // However, I will check Create.tsx, Payment.tsx and Result.tsx.
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FFF5F5]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5]/50"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-[#2A2A2A] mb-2">Welcome Back</h1>
                    <p className="text-[#666]">Sign in to save your love letters forever.</p>
                </div>

                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#8B1E3F',
                                    brandAccent: '#701832',
                                },
                                radii: {
                                    borderRadiusButton: '12px',
                                    buttonBorderRadius: '12px',
                                    inputBorderRadius: '12px',
                                }
                            },
                        },
                    }}
                    providers={['google']}
                    redirectTo={`${window.location.origin}/create`}
                    onlyThirdPartyProviders={false}
                />
            </motion.div>
        </div>
    );
}
