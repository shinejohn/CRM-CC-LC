import React, { useEffect, useState, useRef } from 'react';
import { SendIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
export const ChatPanel = ({
  messages,
  addMessage,
  isCollapsed,
  onToggleCollapse
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage({
        sender: 'You',
        text: newMessage,
        isAI: false
      });
      // Simulate AI response
      setTimeout(() => {
        addMessage({
          sender: 'AI Facilitator',
          text: `I understand your message about "${newMessage}". How can I help further?`,
          isAI: true
        });
      }, 1000);
      setNewMessage('');
    }
  };
  return <div className={`flex flex-col bg-white border-t border-gray-300 transition-all duration-300 ${isCollapsed ? 'h-12' : 'h-full'}`}>
      <div className="p-3 bg-gray-200 font-medium flex items-center justify-between cursor-pointer hover:bg-gray-250 transition-colors" onClick={onToggleCollapse}>
        <span className="text-sm">Chat</span>
        <button className="p-1 hover:bg-gray-300 rounded transition-colors">
          {isCollapsed ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </button>
      </div>

      {!isCollapsed && <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => <div key={index} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.isAI ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>
                  <p className="text-xs font-medium mb-1">{message.sender}</p>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center">
              <input type="text" className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
              <button className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 transition-colors" onClick={handleSendMessage}>
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </>}
    </div>;
};