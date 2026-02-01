import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play, Star, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function Preview() {
  return <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: The Hook */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.8
      }} className="space-y-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] text-xs font-medium mb-4 tracking-wide uppercase">
              Ready for Sarah
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2A2A2A] leading-tight mb-4">
              We've created something beautiful.
            </h1>
            <p className="text-lg text-[#666] leading-relaxed">
              Based on your memories, we've crafted a letter that captures
              exactly how you feel about her. It's sincere, touching, and ready
              to be shared.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-[#555]">
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-[#8B1E3F]">
                <Star className="w-4 h-4" />
              </div>
              <span>Professional emotional tone</span>
            </div>
            <div className="flex items-center space-x-3 text-[#555]">
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-[#8B1E3F]">
                <Play className="w-4 h-4" />
              </div>
              <span>AI Voice narration included</span>
            </div>
            <div className="flex items-center space-x-3 text-[#555]">
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-[#8B1E3F]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Private & secure</span>
            </div>
          </div>

          <Link to="/payment" className="block">
            <Button size="lg" className="w-full md:w-auto min-w-[240px]">
              Unlock Full Experience
            </Button>
          </Link>
          <p className="text-xs text-[#999] text-center md:text-left">
            One-time payment of $9.99 • Instant access
          </p>
        </motion.div>

        {/* Right Column: The Blurred Preview */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="relative">
          {/* Paper Container */}
          <div className="bg-white rounded-xl shadow-2xl shadow-[#8B1E3F]/10 p-8 md:p-12 relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Visible Header */}
            <div className="mb-8 text-center border-b border-[#E5E5E5] pb-6">
              <div className="text-xs uppercase tracking-widest text-[#999] mb-2">
                A Letter For
              </div>
              <h2 className="text-2xl font-serif text-[#2A2A2A]">Sarah</h2>
            </div>

            {/* Content with Blur Gradient */}
            <div className="space-y-4 font-serif text-lg leading-relaxed text-[#4A4A4A] relative">
              <p>My Dearest Sarah,</p>
              <p>
                As I sit here thinking about the last 5 years we've shared, I'm
                overwhelmed by how much my life has changed since you walked
                into it. Do you remember that rainy afternoon in London? That
                was the moment I knew...
              </p>
              <p className="blur-[2px]">
                Your laughter has become the soundtrack of my happiest days. The
                way you care for everyone around you inspires me to be a better
                person. I love how you...
              </p>
              <p className="blur-[4px]">
                Every morning waking up next to you feels like a gift I don't
                deserve but will always cherish. You are my best friend, my
                confidant, and my...
              </p>
              <p className="blur-[8px]">
                I promise to always stand by your side, through every storm and
                every sunrise. You are the love of my life, and I...
              </p>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex flex-col items-center justify-end pb-12">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 text-center max-w-xs mx-auto transform translate-y-4">
                  <Lock className="w-8 h-8 text-[#8B1E3F] mx-auto mb-3" />
                  <h3 className="font-serif text-xl text-[#2A2A2A] mb-1">
                    Unlock the rest
                  </h3>
                  <p className="text-sm text-[#666] mb-4">
                    Read the full letter and hear the voice message.
                  </p>
                  <Link to="/payment">
                    <Button size="sm" className="w-full">
                      Unlock Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-[#FFB6C1] rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        </motion.div>
      </div>
    </div>;
}