
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, PenTool, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const timelineSteps = [
    { icon: Heart, label: "Connecting to hearts..." },
    { icon: Sparkles, label: "Analyzing memories..." },
    { icon: PenTool, label: "Drafting your letter..." },
    { icon: CheckCircle, label: "Adding final touches..." },
];

export function Generating() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { formData } = location.state || {}; // Expecting formData from Create.tsx
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (!formData) {
            // Redirect back if accessed directly without data
            navigate('/create');
            return;
        }

        const generateLetter = async () => {
            try {
                // Refresh session
                const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
                if (sessionError || !session) {
                    throw new Error("Session expired. Please sign in to continue.");
                }

                const { data, error } = await supabase.functions.invoke('verify-payment', {
                    body: {
                        transaction_id: null, // Subscribed user flow
                        prompt_data: formData,
                        // currency, amount_paid etc are not needed for subscription flow or handle in backend
                    }
                });

                if (error) throw error;
                if (data && (data.error || data.success === false)) {
                    throw new Error(data.error || "Letter generation failed.");
                }

                // Success - navigate to result with the letter
                // Artificial delay for UX if generation was too fast?
                // Let's just go when done, but ensure steps look nice.

                // Wait for last step animation
                setCurrentStepIndex(timelineSteps.length - 1);
                setTimeout(() => {
                    navigate('/result', { state: { letter: data.letter } });
                }, 1500);


            } catch (err: any) {
                console.error("Generation error:", err);
                toast(err.message || "Something went wrong. Please try again.", 'error');
                // On error, maybe go back to create to retry?
                navigate('/create', { state: { formData } }); // Preserve form data to retry
            }
        };

        // Simulate step progress while generating (purely visual)
        const stepInterval = setInterval(() => {
            setCurrentStepIndex(prev => {
                if (prev < timelineSteps.length - 2) return prev + 1; // Don't go to last step purely by timer
                return prev;
            })
        }, 2000);

        // Start generation
        generateLetter();

        return () => clearInterval(stepInterval);

    }, [formData, navigate, toast]);


    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFF5F5]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5]"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8B1E3F]">
                        <Loader className="w-8 h-8 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#2A2A2A] mb-2">Creating Magic</h2>
                    <p className="text-[#666]">
                        We are crafting your perfect love letter...
                    </p>
                </div>

                <div className="space-y-6 relative">
                    {/* Connecting line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10" />

                    {timelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-500
                            ${isActive || isCompleted ? 'bg-[#8B1E3F] border-[#8B1E3F] text-white' : 'bg-white border-gray-200 text-gray-300'}
                        `}>
                                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                                </div>
                                <div className={`transition-opacity duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                                    <p className={`font-medium ${isActive ? 'text-[#8B1E3F]' : 'text-[#2A2A2A]'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </motion.div>
        </div>
    );
}
