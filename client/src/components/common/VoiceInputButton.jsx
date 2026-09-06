import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { speechService } from '../../services/speechService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const VoiceInputButton = ({ onTranscript, className = '', title = 'Voice input' }) => {
  const { currentLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setErrorMsg(null);
    setIsListening(true);

    speechService.startListening({
      language: currentLanguage,
      onResult: (transcript, isFinal) => {
        if (onTranscript) {
          onTranscript(transcript, isFinal);
        }
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setErrorMsg('Microphone error or permission denied');
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={title}
        className={`relative p-2 rounded-xl transition-all flex items-center justify-center ${
          isListening
            ? 'text-orange-600 bg-orange-100 animate-mic'
            : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
        } ${className}`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 animate-pulse" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {errorMsg && (
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap z-50">
          {errorMsg}
        </span>
      )}
    </div>
  );
};

export default VoiceInputButton;
