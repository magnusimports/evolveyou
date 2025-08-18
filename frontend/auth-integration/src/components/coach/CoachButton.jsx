import React, { useState } from 'react';
import { Bot, MessageCircle, Sparkles } from 'lucide-react';

const CoachButton = ({ onClick, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Tooltip */}
      {isHovered && !isActive && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
          Converse com o Coach EVO
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {/* Main Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform
          ${isActive 
            ? 'bg-red-500 hover:bg-red-600 scale-110' 
            : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 hover:scale-110'
          }
          focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
        `}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-75 animate-pulse"></div>
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          {isActive ? (
            <div className="text-white transform rotate-45 transition-transform duration-300">
              <MessageCircle size={24} />
            </div>
          ) : (
            <Bot className="text-white" size={24} />
          )}
        </div>
        
        {/* Notification Dot */}
        {!isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </div>
        )}
      </button>
      
      {/* Ripple Effect */}
      {!isActive && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-30 animate-ping"></div>
      )}
    </div>
  );
};

export default CoachButton;

