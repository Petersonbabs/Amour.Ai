import { motion } from 'framer-motion';
import { Play, Pause, Square, Download, Share2, Heart, Copy, Volume2, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useState, useEffect, useRef } from 'react';

export function Result() {
  const { toast } = useToast();
  const location = useLocation();
  const { letter } = location.state || {};

  // Voice State
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [voiceTone, setVoiceTone] = useState<'calm' | 'warm' | 'passionate'>('warm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  const synth = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth.current = window.speechSynthesis;
      setSupported(true);
    } else {
      setSupported(false);
    }

    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!synth.current) return;

    if (isPlaying) {
      synth.current.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(letter || "No content to play.");
    utteranceRef.current = utterance;

    // Select Voice based on Gender
    const voices = synth.current.getVoices();
    let selectedVoice = voices.find(v => v.lang.includes('en')); // Default

    // Simple heuristic for gender (not perfect as API doesn't standardise gender)
    // We look for names common in OS voices or keywords
    const maleKeywords = ['david', 'james', 'mark', 'george', 'male', 'guy'];
    const femaleKeywords = ['zira', 'samantha', 'victoria', 'female', 'girl', 'woman'];

    if (voiceGender === 'male') {
      selectedVoice = voices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)) && v.lang.includes('en')) || selectedVoice;
    } else {
      selectedVoice = voices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)) && v.lang.includes('en')) || selectedVoice;
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    // Apply Tone (Pitch/Rate adjustments)
    switch (voiceTone) {
      case 'calm':
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        break;
      case 'passionate':
        utterance.rate = 1.1; // Slightly faster to simulate excitement/flow? Or slower? 
        // Let's try slightly faster but deeper? Or maybe varying? 
        // "Passionate" is hard with simple TTS. Let's try a bit higher pitch.
        utterance.pitch = 1.1;
        break;
      case 'warm':
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        break;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.current.speak(utterance);
    setIsPlaying(true);
  };

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
          {/* Audio Player Card - Active */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] relative overflow-hidden">
            <h3 className="font-medium text-[#2A2A2A] mb-4 flex items-center">
              Voice Message
              <span className="ml-2 px-1.5 py-0.5 bg-[#FFF0F5] text-[#8B1E3F] text-[10px] rounded border border-[#ffe4e6]">Preview</span>
            </h3>

            {/* Voice Controls */}
            <div className="space-y-4 mb-6">
              {/* Gender */}
              <div>
                <label className="text-xs text-[#999] uppercase tracking-wider font-semibold mb-2 block">Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVoiceGender('female')}
                    className={`text-sm py-1.5 rounded-lg border transition-all ${voiceGender === 'female' ? 'bg-[#FFF5F5] border-[#8B1E3F] text-[#8B1E3F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => setVoiceGender('male')}
                    className={`text-sm py-1.5 rounded-lg border transition-all ${voiceGender === 'male' ? 'bg-[#FFF5F5] border-[#8B1E3F] text-[#8B1E3F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    Male
                  </button>
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="text-xs text-[#999] uppercase tracking-wider font-semibold mb-2 block">Tone</label>
                <div className="flex gap-2">
                  {(['calm', 'warm', 'passionate'] as const).map(tone => (
                    <button
                      key={tone}
                      onClick={() => setVoiceTone(tone)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${voiceTone === tone ? 'bg-[#FFF5F5] border-[#8B1E3F] text-[#8B1E3F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4 flex items-center space-x-4 border border-[#F0F0F0]">
              <button
                onClick={handlePlay}
                disabled={!supported}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#ffebef] text-[#8B1E3F]' : 'bg-[#8B1E3F] text-white hover:bg-[#701630] shadow-md shadow-[#8B1E3F]/20'} ${!supported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex-1">
                {isPlaying ? (
                  <div className="flex items-center space-x-1 h-8">
                    {/* Audio Visualizer Animation */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[#8B1E3F]/60 rounded-full"
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    <span className="text-xs text-[#8B1E3F] ml-2 font-medium">Playing...</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#666]">
                    {supported ? "Ready to play" : "Voice not supported"}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-3 text-center">
              This is a preview using your device's voice engine.
            </p>
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