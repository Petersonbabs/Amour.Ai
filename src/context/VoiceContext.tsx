import React, { createContext, useContext, useState, useEffect } from 'react';

interface VoiceContextType {
    isRecording: boolean;
    setIsRecording: (recording: boolean) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
    const [isRecording, setIsRecording] = useState(false);

    // Prevent closing window when recording
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isRecording) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        if (isRecording) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isRecording]);

    return (
        <VoiceContext.Provider value={{ isRecording, setIsRecording }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoiceContext() {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error('useVoiceContext must be used within a VoiceProvider');
    }
    return context;
}
