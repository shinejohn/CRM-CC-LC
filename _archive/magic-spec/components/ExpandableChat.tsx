import React, { useEffect, useState, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

interface Message {
  sender: string;
  text: string;
  isAI: boolean;
}
interface ExpandableChatProps {
  messages: Message[];
  addMessage: (message: Message) => void;
  defaultExpanded?: boolean;
}
export const ExpandableChat = ({
  messages,
  addMessage,
  defaultExpanded = false
}: ExpandableChatProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      simulateApiDelay(1000).then(() => {
        addMessage({
          sender: 'AI Facilitator',
          text: `I understand your message about "${newMessage}". How can I help further?`,
          isAI: true
        });
      });
      setNewMessage('');
    }
  };
  return <div className={`border-t border-gray-300 transition-all duration-300 flex flex-col ${isExpanded ? 'h-1/2' : 'h-14'}`}>
      <div className="flex justify-between items-center p-3 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="font-medium flex items-center">
          <MessageCircleIcon size={18} className="mr-2" />
          <span>Chat with AI Assistant</span>
        </div>
        <button className="p-1 hover:bg-gray-300 rounded">
          {isExpanded ? <ChevronDownIcon size={18} /> : <ChevronUpIcon size={18} />}
        </button>
      </div>

      {isExpanded && <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((message, index) => <div key={index} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.isAI ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>
                  <p className="text-xs font-medium mb-1">{message.sender}</p>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>)}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white">
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