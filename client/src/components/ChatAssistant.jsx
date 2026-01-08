import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your ThreadWise AI. Ask me anything about your inbox.' }
  ]);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // 1. Add User Message
    const userMessage = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // 2. Call Backend API
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.post('http://localhost:5000/api/chat', { query: userMessage.text }, config);

      // 3. Add AI Response
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: "Sorry, I couldn't connect to the AI brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window (Only visible when isOpen is true) */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <FiCpu className="text-xl" />
              <span className="font-bold">ThreadWise Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-500 text-xs px-3 py-2 rounded-full animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about your emails..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button (Always visible) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>

    </div>
  );
};

export default ChatAssistant;