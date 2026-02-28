import React, { useState } from 'react';
import { AISessionLayout } from '../components/AISessionLayout';
import { AIWorkflowPanel } from '../components/AIWorkflowPanel';
export const AIWorkflowPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFacilitatorPresent, setIsFacilitatorPresent] = useState(true);
  const [messages, setMessages] = useState([{
    sender: 'AI Facilitator',
    text: 'Welcome to the AI workflow session. How can I help you design your AI pipeline?',
    isAI: true
  }, {
    sender: 'You',
    text: 'Can you explain how we should structure the data preprocessing step?',
    isAI: false
  }, {
    sender: 'AI Facilitator',
    text: 'For data preprocessing, I recommend a three-stage pipeline: 1) Data cleaning to handle missing values and outliers, 2) Feature engineering to create relevant variables, and 3) Normalization to ensure consistent scales. This approach has shown to improve model performance by 23% in similar use cases.',
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
  return <AISessionLayout title="AI-Assisted Workflow Design" isMuted={isMuted} isVideoOff={isVideoOff} isChatOpen={isChatOpen} isListening={isListening} transcript={transcript} isFacilitatorPresent={isFacilitatorPresent} messages={messages} participants={participants} onMuteToggle={() => setIsMuted(!isMuted)} onVideoToggle={() => setIsVideoOff(!isVideoOff)} onChatToggle={() => setIsChatOpen(!isChatOpen)} onFacilitatorToggle={() => setIsFacilitatorPresent(!isFacilitatorPresent)} onEndCall={() => { console.log('[API POST] /api/v1/ai/session/end'); }} setIsListening={setIsListening} onTranscriptUpdate={handleTranscriptUpdate} setTranscript={setTranscript} addMessage={addMessage} defaultChatExpanded={true}>
      <AIWorkflowPanel />
    </AISessionLayout>;
};