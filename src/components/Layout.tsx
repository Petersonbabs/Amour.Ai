import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function Layout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center space-x-8">
              {!user && (
                <Link
                  to="/login"
                  className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors"
                >
                  Sign In
                </Link>
              )}
              {/* <Link
                to="/"
                className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors"
              >
                Stories
              </Link> */}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="text-sm text-[#666] hover:text-[#8B1E3F] transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              )}
            </div>

            <Link
              to="/create"
              className="px-5 py-2 rounded-full bg-[#8B1E3F] text-white text-sm font-medium hover:bg-[#701630] transition-colors shadow-lg shadow-[#8B1E3F]/20 hidden md:block"
            >
              Write Letter
            </Link>

            {/* Profile Avatar - Visible on Mobile & Desktop */}
            {user && (
              <Link to="/profile" className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#fce7f3] border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-[#8B1E3F] font-medium transition-transform transform group-hover:scale-105">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">
                      {user.user_metadata?.full_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            )}
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