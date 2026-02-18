import React, { useEffect, useState, useRef } from 'react';
import { SendIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { sendChatMessage, buildConversationContext, getDefaultPersonality } from '@/services/aiChatService';

interface ChatMessage {
  sender: string;
  text: string;
  isAI: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  personalityId?: string | null;
  customerId?: string | null;
}

export const ChatPanel = ({
  messages,
  addMessage,
  isCollapsed,
  onToggleCollapse,
  personalityId: personalityIdProp,
  customerId,
}: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [personalityId, setPersonalityId] = useState<string | null>(personalityIdProp ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (personalityIdProp) setPersonalityId(personalityIdProp);
    else if (!personalityId) getDefaultPersonality().then((p) => p && setPersonalityId(p.id));
  }, [personalityIdProp, personalityId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => scrollToBottom(), [messages]);

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    addMessage({ sender: 'You', text, isAI: false });
    setNewMessage('');

    const pid = personalityId ?? (await getDefaultPersonality())?.id;
    if (pid) {
      setIsLoading(true);
      try {
        const response = await sendChatMessage(text, {
          personalityId: pid,
          customerId: customerId ?? undefined,
          conversationContext: buildConversationContext(
            messages.map((m) => ({
              id: '',
              role: (m.isAI ? 'assistant' : 'user') as 'user' | 'assistant',
              content: m.text,
              isAI: m.isAI,
            }))
          ),
        });
        addMessage({ sender: 'AI Assistant', text: response, isAI: true });
      } catch (err) {
        addMessage({
          sender: 'AI Assistant',
          text: 'Sorry, I could not get a response. Please try again.',
          isAI: true,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      addMessage({
        sender: 'AI Assistant',
        text: 'AI is not configured. Please set up personalities in settings.',
        isAI: true,
      });
    }
  };
  const showHeader = isCollapsed !== undefined && onToggleCollapse !== undefined;
  return <div className={`flex flex-col bg-white border-t border-gray-300 transition-all duration-300 ${showHeader && isCollapsed ? 'h-12' : 'h-full'}`}>
      {showHeader && (
        <div className="p-3 bg-gray-200 font-medium flex items-center justify-between cursor-pointer hover:bg-gray-250 transition-colors" onClick={onToggleCollapse}>
          <span className="text-sm">Chat</span>
          <button className="p-1 hover:bg-gray-300 rounded transition-colors">
            {isCollapsed ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
          </button>
        </div>
      )}

      {(!showHeader || !isCollapsed) && <>
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
              <input type="text" className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isLoading && handleSendMessage()} disabled={isLoading} />
              <button className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSendMessage} disabled={isLoading}>
                {isLoading ? <span className="text-xs">...</span> : <SendIcon size={18} />}
              </button>
            </div>
          </div>
        </>}
    </div>;
};