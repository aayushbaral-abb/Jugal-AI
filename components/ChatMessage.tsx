import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Volume2 } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isModel ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isModel ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-200'}`}>
          {isModel ? (
            <Bot className="h-5 w-5 text-white" />
          ) : (
            <User className="h-5 w-5 text-gray-600" />
          )}
        </div>

        {/* Message Bubble */}
        <div 
          className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
          ${isModel 
            ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100' 
            : 'bg-blue-600 text-white rounded-br-none'
          }`}
        >
          {isModel ? (
            <div className="prose prose-sm max-w-none text-gray-800">
               <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ) : (
             <p>{message.text}</p>
          )}

          {/* Timestamp & Actions */}
          <div className={`flex items-center gap-2 mt-1 ${isModel ? 'justify-start' : 'justify-end opacity-70'}`}>
             <span className={`text-[10px] ${isModel ? 'text-gray-400' : 'text-blue-100'}`}>
               {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
             {isModel && (
               <button 
                onClick={() => onSpeak(message.text)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                title="Read aloud"
               >
                 <Volume2 size={12} />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
