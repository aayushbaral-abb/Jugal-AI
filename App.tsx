import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send, Globe, Trash2, LogOut, StopCircle, Loader2, BrainCircuit, VolumeX } from 'lucide-react';
import { Message, Language } from './types';
import { generateResponse } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';
import ChatMessage from './components/ChatMessage';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Using any for SpeechRecognition

  // Initialize from LocalStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('jugal_api_key');
    if (storedKey) setApiKey(storedKey);

    // Initial Welcome Message
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Namaste! I am ${APP_NAME}. How can I help you today? \n\nYou can ask me questions in English or Nepali using text or voice.`,
        timestamp: new Date()
      }
    ]);

    // Handle speech synthesis state
    const interval = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript); // Auto-send on voice end
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  // Update recognition language when selection changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('jugal_api_key', key);
    setApiKey(key);
    setApiKeyError('');
  };

  const handleClearKey = () => {
    localStorage.removeItem('jugal_api_key');
    setApiKey(null);
    setMessages([]);
    setApiKeyError('');
  };

  const clearChat = () => {
     setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Namaste! I am ${APP_NAME}. Chat cleared. How can I help you?`,
        timestamp: new Date()
      }
    ]);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking(); // Stop speaking if starting to record
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Target Language Code prefix (e.g., 'en' or 'ne')
      const langPrefix = language.split('-')[0];

      // Strategy: 
      // 1. Filter by language.
      // 2. Prioritize 'Female' or 'Google' (often higher quality) in the name.
      // 3. Special handling for Nepali to fallback to Hindi if Nepali voice is missing.
      
      let matchingVoice = voices.find(v => 
        v.lang.startsWith(langPrefix) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'))
      );

      // Fallback 1: Any voice matching the language
      if (!matchingVoice) {
        matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
      }

      // Fallback 2: If Nepali is requested but not found, try Hindi (closest script support)
      if (!matchingVoice && langPrefix === 'ne') {
        matchingVoice = voices.find(v => v.lang.startsWith('hi'));
      }

      // Fallback 3: If still nothing, try to find any female voice (English)
      if (!matchingVoice) {
         matchingVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      }

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.lang = language;
      utterance.pitch = 1.1; 
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !apiKey) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const apiHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const responseText = await generateResponse(apiKey, textToSend, apiHistory);

      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newModelMsg]);

      // Note: Auto-speak is disabled. User must manually click the speak button.

    } catch (error: any) {
      
      // Handle Quota Exceeded Specifically
      if (error.message === 'QUOTA_EXCEEDED') {
         setApiKeyError("Your free tier API key limit exceeded. Please change it.");
         setApiKey(null);
         localStorage.removeItem('jugal_api_key');
         setIsLoading(false);
         return; // Stop processing, the modal will appear
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the service. Please check your API key or internet connection.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!apiKey) {
    return <ApiKeyModal onSave={handleSaveApiKey} initialError={apiKeyError} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              {APP_NAME}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             {/* Language Selector */}
            <div className="relative group flex items-center bg-gray-100 rounded-full px-1 p-1">
              <button
                onClick={() => setLanguage(Language.ENGLISH)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${language === Language.ENGLISH ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ENG
              </button>
              <button
                onClick={() => setLanguage(Language.NEPALI)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${language === Language.NEPALI ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                NEP
              </button>
            </div>

            {/* Stop Speaking Button - Visible only when speaking */}
            {isSpeaking && (
              <button 
                onClick={stopSpeaking} 
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors animate-pulse" 
                title="Stop Speaking"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            )}

            <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Chat">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={handleClearKey} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Remove API Key">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4">
        <div className="max-w-3xl mx-auto flex flex-col pt-4 pb-20">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onSpeak={speakText} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex flex-row items-end gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BotIcon />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                  : 'bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm'
              }`}
              title="Voice Input"
            >
              {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Type your message here..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 py-3 px-2 text-gray-700 placeholder-gray-400"
              disabled={isRecording || isLoading}
            />

            <button
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && !isRecording) || isLoading}
              className={`p-3 rounded-xl transition-all ${
                (inputText.trim() && !isLoading)
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              {APP_NAME} can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Icon component for reuse within file
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

export default App;