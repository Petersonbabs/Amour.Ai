import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const location = useLocation();

  // Helper for Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F5] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5F5]/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-[#8B1E3F] fill-[#8B1E3F]" />
              <motion.div
                className="absolute inset-0 bg-[#8B1E3F] rounded-full blur-lg opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
            <span className="font-serif text-xl font-medium text-[#2A2A2A] tracking-tight">
              Amour.ai
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors"
            >
              Stories
            </Link>
            <Link
              to="/"
              className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors"
            >
              About
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors"
            >
              Sign Out
            </button>
            <Link
              to="/create"
              className="px-5 py-2 rounded-full bg-[#8B1E3F] text-white text-sm font-medium hover:bg-[#701630] transition-colors shadow-lg shadow-[#8B1E3F]/20"
            >
              Write Letter
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content with Transitions */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-[#E5E5E5] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#8B1E3F]/50" />
            <span className="text-sm text-[#999]">Made with love for love.</span>
          </div>
          <div className="flex space-x-6 text-sm text-[#999]">
            <a href="#" className="hover:text-[#8B1E3F] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#8B1E3F] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#8B1E3F] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}