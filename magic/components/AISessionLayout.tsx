import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoIcon, MessageCircleIcon, MicIcon, PhoneOff, Eye, EyeOff } from 'lucide-react';
import { NavigationMenu } from './NavigationMenu';
import { Facilitator } from './Facilitator';
import { VoiceControls } from './VoiceControls';
import { Participants } from './Participants';
import { ExpandableChat } from './ExpandableChat';
interface AISessionLayoutProps {
  title: string;
  children: ReactNode;
  isMuted: boolean;
  isVideoOff: boolean;
  isChatOpen: boolean;
  isListening: boolean;
  transcript: string;
  isFacilitatorPresent: boolean;
  messages: Array<{
    sender: string;
    text: string;
    isAI: boolean;
  }>;
  participants: Array<{
    id: number;
    name: string;
    image: string;
  }>;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onChatToggle: () => void;
  onFacilitatorToggle: () => void;
  onEndCall: () => void;
  setIsListening: (value: boolean) => void;
  onTranscriptUpdate: (text: string) => void;
  setTranscript: (text: string) => void;
  addMessage: (message: {
    sender: string;
    text: string;
    isAI: boolean;
  }) => void;
  defaultChatExpanded?: boolean;
}
export function AISessionLayout({
  title,
  children,
  isMuted,
  isVideoOff,
  isChatOpen,
  isListening,
  transcript,
  isFacilitatorPresent,
  messages,
  participants,
  onMuteToggle,
  onVideoToggle,
  onChatToggle,
  onFacilitatorToggle,
  onEndCall,
  setIsListening,
  onTranscriptUpdate,
  setTranscript,
  addMessage,
  defaultChatExpanded = false
}: AISessionLayoutProps) {
  return <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <motion.header initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 200
        }} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.1
        }} className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-medium shadow-sm">
              Live
            </span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs font-medium">
              00:15:32
            </span>
          </motion.div>
          <NavigationMenu />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }} className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex-1 overflow-y-auto bg-white">{children}</div>

          {/* Expandable Chat */}
          <ExpandableChat messages={messages} addMessage={addMessage} defaultExpanded={defaultChatExpanded} />
        </motion.div>

        {/* Right Sidebar */}
        <motion.aside initial={{
        x: 20,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.3
      }} className="w-80 bg-slate-50 flex flex-col border-l border-slate-200">
          {/* Facilitator */}
          <AnimatePresence>
            {isFacilitatorPresent && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.3
          }} className="border-b border-slate-200 overflow-hidden">
                <div className="p-4">
                  <div className="h-48 rounded-lg overflow-hidden shadow-sm">
                    <Facilitator isVisible={true} isVideoOff={isVideoOff} />
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Voice Controls */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <VoiceControls isListening={isListening} setIsListening={setIsListening} onTranscriptUpdate={onTranscriptUpdate} transcript={transcript} setTranscript={setTranscript} addMessage={addMessage} />
          </div>

          {/* Participants */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
              <span className="text-sm font-semibold text-slate-700">
                Participants ({participants.length})
              </span>
            </div>
            <Participants participants={participants} />
          </div>
        </motion.aside>
      </div>

      {/* Footer Controls */}
      <motion.footer initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.4
    }} className="bg-slate-900 px-6 py-4 flex justify-center items-center gap-4 border-t border-slate-800 shadow-lg">
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`} onClick={onMuteToggle}>
          <MicIcon size={20} />
        </motion.button>

        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`} onClick={onVideoToggle}>
          <VideoIcon size={20} />
        </motion.button>

        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className={`p-3 rounded-full transition-colors ${isChatOpen ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`} onClick={onChatToggle}>
          <MessageCircleIcon size={20} />
        </motion.button>

        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors" onClick={onFacilitatorToggle} title={isFacilitatorPresent ? 'Hide Facilitator' : 'Show Facilitator'}>
          {isFacilitatorPresent ? <EyeOff size={20} /> : <Eye size={20} />}
        </motion.button>

        <div className="w-px h-8 bg-slate-700 mx-2" />

        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2" onClick={onEndCall}>
          <PhoneOff size={18} />
          End Session
        </motion.button>
      </motion.footer>
    </div>;
}