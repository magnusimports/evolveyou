import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, User, Loader2, Camera, FileImage } from 'lucide-react';

const ChatInterface = ({ userId, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou o Coach EVO, seu assistente nutricional personalizado. Como posso ajudar você hoje?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Como posso melhorar minha alimentação?',
    'Analise minha refeição',
    'Sugira um cardápio para hoje',
    'Quais alimentos são bons para meu objetivo?'
  ]);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Iniciar conversa quando o componente monta
    startConversation();
  }, [userId]);
  
  const startConversation = async () => {
    try {
        const response = await fetch(`https://8004-ijhrgjczsw8j5isslcyln-cb94686d.manusvm.computer/api/v1/chat/start?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };
  
  const sendMessage = async (messageText, messageType = 'text', imageData = null) => {
    if (!messageText.trim() && !imageData) return;
    
    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText || 'Imagem enviada',
      timestamp: new Date(),
      type: messageType,
      imageData: imageData
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const requestBody = {
        message: messageText || 'Analise esta imagem',
        message_type: messageType,
        session_id: sessionId,
        image_data: imageData
      };
      
      const response = await fetch(`https://8004-ijhrgjczsw8j5isslcyln-cb94686d.manusvm.computer/api/v1/chat/message?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Adicionar resposta do coach
        const coachMessage = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
          type: 'text',
          analysis: data.analysis,
          recommendations: data.recommendations
        };
        
        setMessages(prev => [...prev, coachMessage]);
        setSuggestions(data.suggestions || []);
        
        // Atualizar session_id se necessário
        if (data.session_id && data.session_id !== sessionId) {
          setSessionId(data.session_id);
        }
      } else {
        throw new Error('Erro na resposta do servidor');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Adicionar mensagem de erro
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date(),
        type: 'text',
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };
  
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result.split(',')[1];
        sendMessage('Analise esta imagem de refeição', 'image', base64Data);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : message.isError 
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
            }`}>
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
          </div>
          
          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : message.isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
          }`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
            
            {/* Image Preview */}
            {message.imageData && (
              <div className="mt-2">
                <img 
                  src={`data:image/jpeg;base64,${message.imageData}`}
                  alt="Imagem enviada"
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
            
            {/* Analysis Results */}
            {message.analysis && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">📊 Análise Nutricional</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Calorias:</strong> {message.analysis.total_calories} kcal</p>
                  <p><strong>Score:</strong> {message.analysis.nutritional_score}/10</p>
                  {message.analysis.food_items && (
                    <div>
                      <strong>Alimentos identificados:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {message.analysis.food_items.map((item, index) => (
                          <li key={index}>{item.name} ({item.quantity})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {message.recommendations && message.recommendations.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Recomendações</h4>
                <div className="space-y-2">
                  {message.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-sm text-blue-700">
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-xs">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Coach EVO</h2>
            <p className="text-sm text-gray-500">Seu assistente nutricional inteligente</p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Coach EVO está pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 py-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <Camera size={20} />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem ou envie uma foto da sua refeição..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

