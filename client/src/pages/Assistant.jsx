import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { aiService } from '../services/api.js';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';

import {
  Sparkles,
  Send,
  User,
  Bot,
  Volume2,
  Copy,
  Check,
  Lightbulb
} from 'lucide-react';

const Assistant = () => {
  const { t, currentLanguage } = useLanguage();

  const {
    business,
    products,
    sales,
    expenses
  } = useBusiness();

  /* ==========================================================
     WELCOME MESSAGE
  ========================================================== */

  const getWelcomeMessage = (language) => {
    if (language === 'te') {
      return 'నమస్కారం! నేను మీ వ్యాపారమిత్ర AI సహాయకుడిని. అమ్మకాలు, ధరలు, ప్రభుత్వ పథకాలు లేదా మార్కెటింగ్ గురించి నన్ను అడగవచ్చు. మాట్లాడటానికి మైక్ బటన్ నొక్కండి.';
    }

    if (language === 'hi') {
      return 'नमस्ते! मैं आपका व्यापारमित्र एआई सहायक हूँ। बिक्री, मूल्य निर्धारण, सरकारी योजनाओं या प्रचार के बारे में मुझसे पूछें।';
    }

    if (language === 'ta') {
      return 'வணக்கம்! நான் உங்கள் வியாபாரமித்ரா AI உதவியாளர். விற்பனை, விலை, அரசு திட்டங்கள் அல்லது விளம்பரம் பற்றி என்னிடம் கேளுங்கள்.';
    }

    if (language === 'kn') {
      return 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವ್ಯಾಪಾರಮಿತ್ರ AI ಸಹಾಯಕ. ಮಾರಾಟ, ಬೆಲೆ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಿ.';
    }

    if (language === 'ml') {
      return 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വ്യാപാരമിത്ര AI സഹായി. വിൽപ്പന, വില, സർക്കാർ പദ്ധതികൾ അല്ലെങ്കിൽ വിപണനം സംബന്ധിച്ച് ചോദിക്കൂ.';
    }

    return 'Hello! I am your Vyapar Mitra AI business partner. Ask me about sales, prices, government schemes, marketing, expenses, or profit.';
  };

  /* ==========================================================
     STATE
  ========================================================== */

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: getWelcomeMessage(currentLanguage)
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  /* ==========================================================
     SCROLL CHAT TO BOTTOM
  ========================================================== */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /* ==========================================================
     UPDATE WELCOME MESSAGE WHEN LANGUAGE CHANGES
  ========================================================== */

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [
          {
            ...prev[0],
            text: getWelcomeMessage(currentLanguage)
          }
        ];
      }

      return prev;
    });
  }, [currentLanguage]);

  /* ==========================================================
     QUICK PROMPTS
  ========================================================== */

  const quickPrompts = [
    t.assistant?.q1 ||
      'How can I increase my sales this month?',

    t.assistant?.q2 ||
      'Is my selling price profitable?',

    t.assistant?.q3 ||
      'Which government scheme may support my business?',

    t.assistant?.q4 ||
      'Write a festival WhatsApp message for my customers.',

    t.assistant?.q5 ||
      'What are 3 practical ways to reduce my business expenses?'
  ];

  /* ==========================================================
     SEND MESSAGE
  ========================================================== */

  const handleSendMessage = async (textToSend) => {
    const query = (
      textToSend || inputMessage
    ).trim();

    if (!query || loading) {
      return;
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [
      ...prev,
      userMsg
    ]);

    setInputMessage('');
    setLoading(true);

    try {
      /*
        The backend already loads the authenticated
        user's business, products, sales and expenses
        directly from Supabase.

        We only send the user's question and language.
      */

      const payload = {
        message: query,
        language: currentLanguage
      };

      const res = await aiService.chat(payload);

      /*
        Backend response:
        {
          success: true,
          answer: "..."
        }
      */

      if (res?.success && res?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: res.answer
          }
        ]);
      } else {
        throw new Error(
          res?.message ||
            'AI returned an empty response'
        );
      }

    } catch (err) {
      console.error(
        'AI Assistant error:',
        err
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text:
            currentLanguage === 'te'
              ? 'క్షమించండి. ప్రస్తుతం మీ అభ్యర్థనను ప్రాసెస్ చేయలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.'
              : currentLanguage === 'hi'
              ? 'क्षमा करें। अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया फिर से प्रयास करें।'
              : 'Sorry, I could not process that request right now. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     COPY RESPONSE
  ========================================================== */

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);

    } catch (error) {
      console.error(
        'Failed to copy response:',
        error
      );
    }
  };

  /* ==========================================================
     TEXT TO SPEECH
  ========================================================== */

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9;

    /*
      Browser will automatically choose the
      available voice where possible.
    */

    window.speechSynthesis.speak(
      utterance
    );
  };

  /* ==========================================================
     BUSINESS DISPLAY
  ========================================================== */

  const businessName =
    business?.business_name ||
    business?.name ||
    'My Business';

  const businessType =
    business?.business_type ||
    business?.category ||
    '';

  const businessLocation =
    business?.location ||
    '';

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ======================================================
          ASSISTANT HEADER
      ====================================================== */}

      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">

              <span>
                {t.assistant?.title ||
                  'AI Business Operating Assistant'}
              </span>

              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Live Advisor
              </span>

            </h2>

            <p className="text-xs text-slate-500">

              {businessName}

              {businessType && (
                <>
                  {' • '}
                  {businessType}
                </>
              )}

              {businessLocation && (
                <>
                  {' • '}
                  {businessLocation}
                </>
              )}

            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          QUICK QUESTIONS
      ====================================================== */}

      <div className="p-3 bg-orange-50/50 border-b border-orange-100 overflow-x-auto flex items-center gap-2 no-scrollbar">

        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 whitespace-nowrap flex items-center gap-1 pl-1">

          <Lightbulb className="w-3.5 h-3.5" />

          <span>
            {t.assistant?.quick ||
              'Quick'}
            :
          </span>

        </span>

        {quickPrompts
          .slice(0, 3)
          .map((prompt, i) => (

            <button
              key={i}
              type="button"
              onClick={() =>
                handleSendMessage(prompt)
              }
              disabled={loading}
              className="text-xs font-medium bg-white hover:bg-orange-100/60 disabled:opacity-50 text-slate-700 hover:text-orange-900 border border-orange-200/80 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>

          ))}

      </div>

      {/* ======================================================
          CHAT MESSAGES
      ====================================================== */}

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">

        {messages.map((m) => (

          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user'
                ? 'flex-row-reverse'
                : 'flex-row'
            }`}
          >

            {/* AVATAR */}

            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {m.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4 text-orange-600" />
              )}
            </div>

            {/* MESSAGE */}

            <div
              className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-orange-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none'
              }`}
            >

              <div className="whitespace-pre-line">
                {m.text}
              </div>

              {/* AI ACTIONS */}

              {m.sender === 'ai' && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2 text-slate-400">

                  <button
                    type="button"
                    onClick={() =>
                      speakText(m.text)
                    }
                    className="p-1 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                    title="Listen in voice"
                    aria-label="Listen to answer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        m.id,
                        m.text
                      )
                    }
                    className="p-1 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                    title="Copy answer"
                    aria-label="Copy answer"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                </div>
              )}

            </div>

          </div>

        ))}

        {/* ====================================================
            LOADING INDICATOR
        ==================================================== */}

        {loading && (

          <div className="flex items-center gap-3">

            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-orange-600" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>

              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></div>

              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></div>

              <span className="text-xs text-slate-500 font-medium pl-1">
                Thinking...
              </span>

            </div>

          </div>

        )}

        <div ref={messagesEndRef} />

      </div>

      {/* ======================================================
          MESSAGE INPUT
      ====================================================== */}

      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >

          <VoiceInputButton
            onTranscript={(transcript) => {
              setInputMessage(transcript);
            }}
            title={
              t.assistant?.speakBtn ||
              'Speak in your language'
            }
          />

          <input
            type="text"
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(
                e.target.value
              )
            }
            disabled={loading}
            placeholder={
              t.assistant?.placeholder ||
              'Ask anything about sales, prices, loans, marketing...'
            }
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              !inputMessage.trim() ||
              loading
            }
            className="p-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>

        </form>

      </div>

    </div>
  );
};

export default Assistant;