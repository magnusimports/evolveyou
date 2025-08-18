import React from 'react';
import { X } from 'lucide-react';
import ChatInterface from './ChatInterface';

const CoachModal = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Coach Virtual EVO</h2>
                <p className="text-green-100 text-sm">Seu assistente nutricional inteligente</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface userId={userId} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachModal;

