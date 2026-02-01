import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const variants = {
        initial: { opacity: 0, y: 50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, x: 20, scale: 0.9 },
    };

    const bgColors = {
        success: 'bg-white border-l-4 border-green-500',
        error: 'bg-white border-l-4 border-red-500',
        info: 'bg-white border-l-4 border-blue-500',
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`${bgColors[type]} p-4 rounded-lg shadow-lg shadow-black/5 flex items-center gap-3 min-w-[300px] pointer-events-auto`}
        >
            {icons[type]}
            <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
