import React, { useState } from 'react';
import { Facilitator } from './Facilitator';
import { Participants } from './Participants';
import { NotesPanel } from './NotesPanel';
import { ChatPanel } from './ChatPanel';
import { VoiceControls } from './VoiceControls';
import { MainNavigationHeader } from './MainNavigationHeader';
import { VideoIcon, MessageCircleIcon, MicIcon } from 'lucide-react';
import { RecordButton } from './RecordButton';
import { TranscriptDownloadButton } from './TranscriptDownloadButton';
export const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingData, setRecordingData] = useState(null);
  const [isFacilitatorPresent, setIsFacilitatorPresent] = useState(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [messages, setMessages] = useState([{
    sender: 'AI Facilitator',
    text: 'Welcome to the meeting! How can I help today?',
    isAI: true
  }, {
    sender: 'You',
    text: 'Can we discuss the project timeline?',
    isAI: false
  }]);
  const addMessage = message => {
    setMessages([...messages, message]);
  };
  const handleTranscriptUpdate = text => {
    setTranscript(text);
  };
  const handleRecordingComplete = data => {
    setRecordingData(data);
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
  const notes = [{
    category: 'Action Items',
    items: ['Schedule follow-up meeting with design team', 'Share project timeline with stakeholders', 'Prepare Q3 budget proposal']
  }, {
    category: 'Key Decisions',
    items: ['Approved new marketing strategy', 'Postponed product launch to Q4', 'Hired two new developers for mobile team']
  }, {
    category: 'Questions & Issues',
    items: ['How will the new pricing model affect current customers?', 'Need clarification on the scope of Phase 2', 'Resource allocation for international expansion']
  }];
  return <div className="flex flex-col h-screen">
      {/* Main Navigation Header */}
      <MainNavigationHeader />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area - Notes and Chat */}
        <div className="flex-1 border-r border-gray-300 flex flex-col">
          {/* Notes Panel - 2/3 of space */}
          <div className={`overflow-y-auto transition-all duration-300 ${isChatCollapsed ? 'flex-1' : 'h-2/3'}`}>
            <NotesPanel notes={notes} />
          </div>
          {/* Chat - 1/3 of space, collapsible */}
          <div className={`transition-all duration-300 ${isChatCollapsed ? 'h-auto' : 'h-1/3'}`}>
            <ChatPanel messages={messages} addMessage={addMessage} isCollapsed={isChatCollapsed} onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)} />
          </div>
        </div>

        {/* Right Sidebar - Facilitator, Voice Controls, and Participants */}
        <div className="w-80 bg-gray-50 flex flex-col">
          {/* Facilitator */}
          {isFacilitatorPresent && <div className="p-3 border-b border-gray-200">
              <div className="h-48">
                <Facilitator isVisible={true} isVideoOff={isVideoOff} />
              </div>
            </div>}

          {/* Voice Controls */}
          <div className="p-3 border-b border-gray-200">
            <VoiceControls isListening={isListening} setIsListening={setIsListening} onTranscriptUpdate={handleTranscriptUpdate} transcript={transcript} setTranscript={setTranscript} addMessage={addMessage} />
          </div>

          {/* Participants */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 bg-gray-200 font-medium text-sm sticky top-0">
              <span>Participants ({participants.length})</span>
            </div>
            <Participants participants={participants} />
          </div>
        </div>
      </div>

      {/* Footer - Controls */}
      <div className="bg-gray-800 text-white p-4 flex justify-center items-center space-x-6">
        <button className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsMuted(!isMuted)}>
          <MicIcon size={20} />
        </button>
        <button className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsVideoOff(!isVideoOff)}>
          <VideoIcon size={20} />
        </button>
        <RecordButton onRecordingComplete={handleRecordingComplete} />
        <TranscriptDownloadButton sessionId="current-session-123" disabled={!messages.length} />
        <button className={`p-3 rounded-full ${isChatOpen ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsChatOpen(!isChatOpen)}>
          <MessageCircleIcon size={20} />
        </button>
        <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500" onClick={() => setIsFacilitatorPresent(!isFacilitatorPresent)}>
          {isFacilitatorPresent ? 'Hide Facilitator' : 'Show Facilitator'}
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium">
          End Call
        </button>
      </div>
    </div>;
};