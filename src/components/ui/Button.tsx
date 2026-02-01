import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#8B1E3F] text-white hover:bg-[#701630] shadow-lg shadow-[#8B1E3F]/20 focus:ring-[#8B1E3F]',
    secondary: 'bg-white text-[#8B1E3F] border border-[#E5E5E5] hover:border-[#8B1E3F]/30 hover:bg-[#FFF5F5] shadow-sm focus:ring-[#8B1E3F]',
    ghost: 'bg-transparent text-[#666] hover:text-[#8B1E3F] hover:bg-[#8B1E3F]/5 focus:ring-[#8B1E3F]'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return <motion.button whileHover={{
    scale: disabled || isLoading ? 1 : 1.02
  }} whileTap={{
    scale: disabled || isLoading ? 1 : 0.98
  }} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>;
}