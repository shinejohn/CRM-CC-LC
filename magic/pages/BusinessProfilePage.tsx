import React, { useState } from 'react';
import { AISessionLayout } from '../components/AISessionLayout';
import { BusinessProfileForm } from '../components/BusinessProfileForm';
export const BusinessProfilePage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFacilitatorPresent, setIsFacilitatorPresent] = useState(true);
  const [messages, setMessages] = useState([{
    sender: 'AI Facilitator',
    text: 'Welcome to the business profile analysis. How can I help you understand this company better?',
    isAI: true
  }, {
    sender: 'You',
    text: 'Can you tell me more about their financial performance?',
    isAI: false
  }, {
    sender: 'AI Facilitator',
    text: 'TechSolutions has shown strong financial growth with a CAGR of 18.7% over the last 3 years. Their revenue increased from $4.2M in 2020 to $5.9M in 2022, with improving gross margins from 62% to 68%. Their EBITDA margin of 22.4% is above the industry average.',
    isAI: true
  }]);
  const addMessage = (message: {
    sender: string;
    text: string;
    isAI: boolean;
  }) => {
    setMessages([...messages, message]);
  };
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };
  const participants = [{
    id: 1,
    name: 'John Doe',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    id: 2,
    name: 'Jane Smith',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    id: 3,
    name: 'Alex Johnson',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }];
  return <AISessionLayout title="AI-Assisted Business Profile" isMuted={isMuted} isVideoOff={isVideoOff} isChatOpen={isChatOpen} isListening={isListening} transcript={transcript} isFacilitatorPresent={isFacilitatorPresent} messages={messages} participants={participants} onMuteToggle={() => setIsMuted(!isMuted)} onVideoToggle={() => setIsVideoOff(!isVideoOff)} onChatToggle={() => setIsChatOpen(!isChatOpen)} onFacilitatorToggle={() => setIsFacilitatorPresent(!isFacilitatorPresent)} onEndCall={() => console.log('End call')} setIsListening={setIsListening} onTranscriptUpdate={handleTranscriptUpdate} setTranscript={setTranscript} addMessage={addMessage} defaultChatExpanded={false}>
      <BusinessProfileForm />
    </AISessionLayout>;
};