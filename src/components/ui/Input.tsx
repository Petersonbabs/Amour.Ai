import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { useVoiceContext } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { ToastType } from './Toast';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const useVoiceInput = (
  value: string | number | readonly string[] | undefined,
  onChange: ((e: React.ChangeEvent<any>) => void) | undefined,
  {
    isGlobalRecording,
    setGlobalIsRecording,
    toast
  }: {
    isGlobalRecording: boolean;
    setGlobalIsRecording: (v: boolean) => void;
    toast: (msg: string, type?: ToastType) => void 
  }
) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const valueRef = useRef(value);
  const shouldStopRef = useRef(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) {
      setIsSupported(true);
    }
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      toast("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.", 'error');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      if (isGlobalRecording) {
        toast("Please stop the current recording first.", 'error');
        return;
      }
      startListening();
    }
  };

  const stopListening = () => {
    shouldStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setGlobalIsRecording(false);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    shouldStopRef.current = false;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setGlobalIsRecording(true);
    };

    recognition.onend = () => {
      // If NOT manually stopped, restart immediately
      if (!shouldStopRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore error if already started
        }
      } else {
        setIsListening(false);
        setGlobalIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (['not-allowed', 'service-not-allowed'].includes(event.error)) {
        shouldStopRef.current = true;
        setIsListening(false);
        setGlobalIsRecording(false);
        toast("Microphone access denied.", 'error');
      }
    };

    recognition.onresult = (event: any) => {
      let newTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newTranscript += event.results[i][0].transcript;
        }
      }

      if (newTranscript) {
        const currentValue = String(valueRef.current || '');
        const spacer = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
        const newValue = currentValue + spacer + newTranscript;

        if (onChange) {
          const syntheticEvent = {
            target: { value: newValue },
            currentTarget: { value: newValue }
          };
          onChange(syntheticEvent as React.ChangeEvent<any>);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return { isListening, isSupported, toggleListening };
};

export function Input({
  label,
  error,
  className = '',
  onChange,
  value,
  onFocus,
  ...props
}: InputProps) {
  const { isRecording: isGlobalRecording, setIsRecording: setGlobalIsRecording } = useVoiceContext();
  const { toast } = useToast();

  const { isListening, toggleListening } = useVoiceInput(value, onChange, {
    isGlobalRecording,
    setGlobalIsRecording,
    toast 
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isGlobalRecording && !isListening) {
      toast("Please stop recording first before switching fields.", 'error');
      e.target.blur();
      return;
    }
    if (onFocus) onFocus(e);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#666] ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
          w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white/50 
          text-[#4A4A4A] placeholder:text-[#999]
          transition-all duration-300
          focus:outline-none focus:border-[#8B1E3F]/30 focus:ring-4 focus:ring-[#8B1E3F]/5
          hover:border-[#8B1E3F]/20
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
          pr-12
          ${className}
        `}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          {...props}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors z-10
            ${isListening
              ? 'text-white bg-red-500 shadow-lg shadow-red-500/20 animate-pulse'
              : 'text-[#999] hover:text-[#8B1E3F] hover:bg-[#8B1E3F]/5'}
          `}
          title={isListening ? "Stop recording" : "Use voice input"}
        >
          {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({
  label,
  error,
  className = '',
  onChange,
  value,
  onFocus,
  ...props
}: TextAreaProps) {
  const { isRecording: isGlobalRecording, setIsRecording: setGlobalIsRecording } = useVoiceContext();
  const { toast } = useToast();

  const { isListening, toggleListening } = useVoiceInput(value, onChange, {
    isGlobalRecording,
    setGlobalIsRecording,
    toast
  });

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (isGlobalRecording && !isListening) {
      toast("Please stop recording first before switching fields.", 'error');
      e.target.blur();
      return;
    }
    if (onFocus) onFocus(e);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#666] ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`
          w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white/50 
          text-[#4A4A4A] placeholder:text-[#999]
          transition-all duration-300
          focus:outline-none focus:border-[#8B1E3F]/30 focus:ring-4 focus:ring-[#8B1E3F]/5
          hover:border-[#8B1E3F]/20
          min-h-[120px] resize-y
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
          pr-12
          ${className}
        `}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          {...props}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`
            absolute right-3 top-3 p-2 rounded-full transition-colors z-10
            ${isListening
              ? 'text-white bg-red-500 shadow-lg shadow-red-500/20 animate-pulse'
              : 'text-[#999] hover:text-[#8B1E3F] hover:bg-[#8B1E3F]/5'}
          `}
          title={isListening ? "Stop recording" : "Use voice input"}
        >
          {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}