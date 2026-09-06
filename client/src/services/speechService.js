// Web Speech API Service for Multi-lingual Speech Recognition

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.isSupported = true;
      }
    }
  }

  getLanguageTag(langCode) {
    const map = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      en: 'en-IN'
    };
    return map[langCode] || 'en-IN';
  }

  startListening({ language = 'en', onResult, onError, onEnd }) {
    if (!this.isSupported) {
      if (onError) onError('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = this.getLanguageTag(language);

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (onResult && text) {
        onResult(text, Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed or already active:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
