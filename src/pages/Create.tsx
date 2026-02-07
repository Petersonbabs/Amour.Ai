import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useVoiceContext } from '../context/VoiceContext';

export function Create() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRecording } = useVoiceContext();
  const currentStepBeforeLogin = sessionStorage.getItem("currentStepBeforeLogin");
  const [step, setStep] = useState(currentStepBeforeLogin ? parseInt(currentStepBeforeLogin) : 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('love_letter_form');
    return saved ? JSON.parse(saved) : {
      yourName: '',
      partnerName: '',
      relationship: '',
      duration: '',
      memories: '',
      qualities: '',
      tone: 'romantic'
    };
  });

  useEffect(() => {
    localStorage.setItem('love_letter_form', JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    if (isRecording) {
      toast("Please stop recording first.", 'error');
      return;
    }
    if (step < 4) setStep(step + 1); else handleSubmit();
  };

  const handleBack = () => {
    if (isRecording) {
      toast("Please stop recording first.", 'error');
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (isRecording) {
      toast("Please stop recording first.", 'error');
      return;
    }
    setIsGenerating(true);

    // Check if logged in
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setIsGenerating(false);
      toast("Please sign in to save your progress. We'll bring you right back here.", 'error');
      sessionStorage.setItem("currentStepBeforeLogin", step.toString());
      navigate('/login', { state: { from: '/create' } });
      return;
    }

    // Check for subscription status
    const isSubscribed = session.user.user_metadata?.isSubscribed;

    if (isSubscribed) {
      navigate('/generating', { state: { formData } });
    } else {
      navigate('/payment', { state: { formData } });
    }
  };

  const getPartnerLabel = () => {
    const r = formData.relationship;
    if (['girlfriend', 'wife'].includes(r)) return "What's her name?";
    if (['boyfriend', 'husband'].includes(r)) return "What's his name?";
    return "What's their name?";
  };

  const tones = [{
    id: 'romantic',
    label: 'Deeply Romantic',
    desc: 'Sincere, passionate, and emotional.'
  }, {
    id: 'playful',
    label: 'Playful & Sweet',
    desc: 'Lighthearted, fun, but still loving.'
  }, {
    id: 'poetic',
    label: 'Poetic & Elegant',
    desc: 'Lyrical, timeless, and sophisticated.'
  }];

  return <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-xs uppercase tracking-widest text-[#999] mb-4">
          <span className={step >= 1 ? 'text-[#8B1E3F]' : ''}>
            The Basics
          </span>
          <span className={step >= 3 ? 'text-[#8B1E3F]' : ''}>Memories</span>
          <span className={step >= 4 ? 'text-[#8B1E3F]' : ''}>Tone</span>
        </div>
        <div className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#8B1E3F]" initial={{
            width: '0%'
          }} animate={{
            width: `${step / 4 * 100}%`
          }} transition={{
            duration: 0.5
          }} />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-[#8B1E3F]/5 border border-[#E5E5E5]/50 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFF5F5] rounded-full blur-3xl opacity-50 pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="step1" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
                Who is this for?
              </h2>
              <p className="text-[#666]">
                Tell us about you and your special someone.
              </p>
            </div>

            <Input label="Your Name" placeholder="e.g. John, Alex" value={formData.yourName} onChange={e => setFormData({
              ...formData,
              yourName: e.target.value
            })} autoFocus />

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-2">I am doing this for my...</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white focus:ring-2 focus:ring-[#8B1E3F] focus:border-transparent outline-none transition-all"
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value })}
              >
                <option value="" disabled>Select relationship</option>
                <option value="girlfriend">Girlfriend</option>
                <option value="boyfriend">Boyfriend</option>
                <option value="wife">Wife</option>
                <option value="husband">Husband</option>
                <option value="fiance">Fiancé/Fiancée</option>
                <option value="crush">Crush</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {formData.relationship && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Input
                  label={getPartnerLabel()}
                  placeholder="e.g. Sarah, Michael"
                  value={formData.partnerName}
                  onChange={e => setFormData({
                    ...formData,
                    partnerName: e.target.value
                  })}
                />
              </motion.div>
            )}
          </motion.div>}

          {step === 2 && <motion.div key="step2" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
                Tell us more
              </h2>
              <p className="text-[#666]">
                A few more details about {['girlfriend', 'wife'].includes(formData.relationship) ? 'her' : ['boyfriend', 'husband'].includes(formData.relationship) ? 'him' : 'them'}.
              </p>
            </div>

            <Input label="How long have you been together?" placeholder="e.g. 6 months, 5 years" value={formData.duration} onChange={e => setFormData({
              ...formData,
              duration: e.target.value
            })} autoFocus />
          </motion.div>}

          {step === 3 && <motion.div key="step3" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
                The little things
              </h2>
              <p className="text-[#666]">
                What makes your relationship unique?
              </p>
            </div>

            <TextArea label="Favorite memory together" placeholder="e.g. That time we got lost in Paris, our first coffee date, watching movies on Sundays..." value={formData.memories} onChange={e => setFormData({
              ...formData,
              memories: e.target.value
            })} />

            <TextArea label="What do you love most about them?" placeholder="e.g. Their laugh, how they care for others, their ambition..." value={formData.qualities} onChange={e => setFormData({
              ...formData,
              qualities: e.target.value
            })} />
          </motion.div>}

          {step === 4 && <motion.div key="step4" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
                Set the mood
              </h2>
              <p className="text-[#666]">How should this letter feel?</p>
            </div>

            <div className="grid gap-4">
              {tones.map(tone => <button key={tone.id} onClick={() => setFormData({
                ...formData,
                tone: tone.id
              })} className={`
                        text-left p-4 rounded-xl border transition-all duration-300 flex items-center
                        ${formData.tone === tone.id ? 'border-[#8B1E3F] bg-[#FFF5F5] ring-1 ring-[#8B1E3F]' : 'border-[#E5E5E5] hover:border-[#8B1E3F]/30 hover:bg-gray-50'}
                      `}>
                <div className={`
                        w-5 h-5 rounded-full border mr-4 flex items-center justify-center
                        ${formData.tone === tone.id ? 'border-[#8B1E3F]' : 'border-gray-300'}
                      `}>
                  {formData.tone === tone.id && <div className="w-3 h-3 rounded-full bg-[#8B1E3F]" />}
                </div>
                <div>
                  <div className="font-medium text-[#2A2A2A]">
                    {tone.label}
                  </div>
                  <div className="text-sm text-[#666]">{tone.desc}</div>
                </div>
              </button>)}
            </div>
          </motion.div>}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E5E5E5]">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isGenerating} className={step === 1 ? 'invisible' : ''}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <Button onClick={handleNext} isLoading={isGenerating} className="min-w-[140px]">
            {step === 4 ? isGenerating ? 'Crafting...' : 'Create Letter' : 'Continue'}
            {!isGenerating && step !== 4 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  </div>;
}