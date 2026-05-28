import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function Landing() {
  return <div className="w-full">
    
    {/* Hero Section */}
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#FFD1DC] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#FFE5B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-[#E6E6FA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-white/40 text-[#8B1E3F] text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 inline-block mr-2" />
            The most personal gift this Valentine's
          </span>
        </motion.div>

        <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-4xl md:text-7xl font-serif text-[#2A2A2A] leading-[1.1] mb-8">
          Turn your feelings into a <br />
          <span className="italic text-[#8B1E3F]">masterpiece of love.</span>
        </motion.h1>

        <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="text-base md:text-xl text-[#666] max-w-2xl mx-auto mb-12 leading-relaxed">
          You know how you feel, but finding the words is hard. We help you
          create a deeply personal love letter and voice message that will
          make them feel truly seen.
        </motion.p>

        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.8
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create">
            <Button size="lg" className="min-w-[200px] group">
              Create a Love Letter
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <span className="text-sm text-[#999]">
            Takes 2 minutes • No writing skills needed
          </span>
        </motion.div>
      </div>
    </section>

    {/* Emotional Value Prop */}
    <section className="py-24 px-6 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {[{
            icon: Heart,
            title: 'Deeply Personal',
            desc: 'Not generic templates. We weave your specific memories and inside jokes into a narrative that sounds like you—at your best.'
          }, {
            icon: Star,
            title: 'Beautifully Crafted',
            desc: 'Every letter is formatted with elegant typography and visual design, ready to be shared digitally or printed on premium paper.'
          }, {
            icon: Sparkles,
            title: 'Voice Enhanced',
            desc: 'Add a personal touch with an AI-enhanced voice reading of your letter, or record your own to accompany the text.'
          }].map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.2
          }} className="text-center">
            <div className="w-12 h-12 mx-auto bg-[#FFF5F5] rounded-full flex items-center justify-center mb-6 text-[#8B1E3F]">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-[#2A2A2A] mb-3">
              {item.title}
            </h3>
            <p className="text-[#666] leading-relaxed">{item.desc}</p>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* Testimonial */}
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Heart className="w-8 h-8 text-[#8B1E3F]/20 mx-auto mb-8" />
        <blockquote className="text-2xl md:text-4xl font-serif italic text-[#4A4A4A] leading-relaxed mb-8">
          "I cried when I read it. It captured things I've felt for years but
          never knew how to say. My wife framed it."
        </blockquote>
        <div className="flex items-center justify-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="font-medium text-[#2A2A2A]">Michael R.</div>
            <div className="text-sm text-[#999]">Married 12 years</div>
          </div>
        </div>
      </div>
    </section>
  </div>;
}