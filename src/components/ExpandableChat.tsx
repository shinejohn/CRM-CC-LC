import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { ChevronUpIcon, ChevronDownIcon, MessageCircleIcon } from 'lucide-react';
interface ExpandableChatProps {
  messages: any[];
  addMessage: (message: any) => void;
  defaultExpanded?: boolean;
}
export const ExpandableChat = ({
  messages,
  addMessage,
  defaultExpanded = false
}: ExpandableChatProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return <div className={`border-t border-gray-300 transition-all duration-300 flex flex-col ${isExpanded ? 'h-1/2' : 'h-14'}`}>
      <div className="flex justify-between items-center p-3 bg-gray-200 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="font-medium flex items-center">
          <MessageCircleIcon size={18} className="mr-2" />
          <span>Chat with AI Assistant</span>
        </div>
        <button className="p-1 hover:bg-gray-300 rounded">
          {isExpanded ? <ChevronDownIcon size={18} /> : <ChevronUpIcon size={18} />}
        </button>
      </div>
      {isExpanded && <div className="flex-1 overflow-hidden">
          <ChatPanel messages={messages} addMessage={addMessage} />
        </div>}
    </div>;
};