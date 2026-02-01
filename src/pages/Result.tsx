import { motion } from 'framer-motion';
import { Play,  Download, Share2, Heart, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export function Result() {
  const { toast } = useToast();
  // const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();
  const { letter } = location.state || {};

  // Parse markdown-like content into paragraphs if needed, or just display
  const content = letter || `As I sit here thinking about the last 5 years we've shared... (Demo Content)`;
  return <div className="min-h-screen py-12 px-6">
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <motion.div className="text-center mb-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
        <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8B1E3F]">
          <Heart className="w-8 h-8 fill-current animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#2A2A2A] mb-4">
          It's ready.
        </h1>
        <p className="text-lg text-[#666]">
          Your letter has been crafted. Take a moment to read it, listen to
          it, and share it.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Main Letter Display */}
        <motion.div className="md:col-span-8" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
          <div className="bg-white p-8 md:p-16 rounded-xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5] relative overflow-hidden">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 bg-[#FFFDF9] opacity-50 pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="text-xs uppercase tracking-widest text-[#999] mb-4">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h2 className="text-3xl font-serif text-[#2A2A2A]">
                  My Dearest,
                </h2>
              </div>

              <div className="prose prose-lg font-serif text-[#4A4A4A] leading-loose mx-auto whitespace-pre-line text-left">
                {content}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Actions */}
        <motion.div className="md:col-span-4 space-y-6" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }}>
          {/* Audio Player Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] relative overflow-hidden opacity-90">
            <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              COMING SOON
            </div>

            <h3 className="font-medium text-[#2A2A2A] mb-4 flex items-center">
              Voice Message
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded border border-gray-200">AI Generated</span>
            </h3>
            <div className="bg-[#F8F8F8] rounded-xl p-4 flex items-center space-x-4 grayscale opacity-75 cursor-not-allowed">
              <button disabled className="w-10 h-10 rounded-full bg-[#8B1E3F] text-white flex items-center justify-center">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
              <div className="flex-1 space-y-1">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1E3F] w-1/3" />
                </div>
                <div className="flex justify-between text-[10px] text-[#999] uppercase tracking-wider">
                  <span>0:00</span>
                  <span>--:--</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center font-medium">Auto-composed song featuring your voice clone.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" onClick={() => {
              // Share logic placeholder
              if (navigator.share) {
                navigator.share({
                  title: 'My Love Letter',
                  text: content,
                }).catch(console.error);
              } else {
                toast('Sharing is not supported on this device/browser.', 'info');
              }
            }}>
              <Share2 className="w-4 h-4 mr-3" />
              Share Link
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => {
              // Simple PDF placeholder (print)
              window.print();
            }}>
              <Download className="w-4 h-4 mr-3" />
              Download / Print
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => {
              navigator.clipboard.writeText(content);
              toast('Letter copied to clipboard!', 'success');
            }}>
              <Copy className="w-4 h-4 mr-3" />
              Copy Text
            </Button>
          </div>

          {/* Emotional Note */}
          <div className="bg-[#FFF5F5] p-6 rounded-2xl text-center">
            <p className="text-sm text-[#8B1E3F] italic font-serif">
              "Love is not about how much you say. It's about how much you
              feel."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </div>;
}