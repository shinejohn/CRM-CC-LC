import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Sparkles, MoreVertical, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { AddAIParticipantModal } from './AddAIParticipantModal';
interface Participant {
  id: number | string;
  name: string;
  image?: string;
  isAI?: boolean;
  role?: string;
  avatar?: string;
  avatarColor?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}
interface ParticipantsProps {
  participants: Participant[];
  onNavigateToConversation?: (agentId: string) => void;
}
export function Participants({
  participants: initialParticipants,
  onNavigateToConversation
}: ParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleAddAgent = (agent: any) => {
    const newParticipant: Participant = {
      id: agent.id,
      name: agent.name,
      isAI: true,
      role: agent.role,
      avatar: agent.avatar,
      avatarColor: agent.avatarColor,
      isMuted: false,
      isVideoOff: false
    };
    setParticipants([...participants, newParticipant]);
  };
  const currentParticipantIds = participants.filter(p => p.isAI).map(p => p.id.toString());
  return <>
      <div className="p-3">
        {/* Add AI Button */}
        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => setIsAddModalOpen(true)} className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
          <UserPlus size={18} />
          Add AI Specialist
        </motion.button>

        {/* Participants List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {participants.map((participant, index) => <ParticipantCard key={participant.id} participant={participant} index={index} />)}
          </AnimatePresence>
        </div>
      </div>

      <AddAIParticipantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddAgent={onNavigateToConversation ? undefined : handleAddAgent} onNavigateToConversation={onNavigateToConversation} currentParticipants={currentParticipantIds} />
    </>;
}
// Participant Card Component
interface ParticipantCardProps {
  participant: Participant;
  index: number;
}
function ParticipantCard({
  participant,
  index
}: ParticipantCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  return <motion.div layout initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 20
  }} transition={{
    duration: 0.3,
    delay: index * 0.05
  }} className="bg-white rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-all group">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {participant.isAI ? <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${participant.avatarColor} flex items-center justify-center text-xl shadow-md relative`}>
            {participant.avatar}
            <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </motion.div>
          </div> : <img src={participant.image} alt={participant.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-200" />}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900 text-sm truncate">
              {participant.name}
            </h4>
            {participant.isAI && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                AI
              </span>}
          </div>
          {participant.role && <p className="text-xs text-slate-500 truncate">
              {participant.role}
            </p>}
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-1">
          {participant.isMuted && <div className="p-1 bg-red-100 rounded">
              <MicOff size={12} className="text-red-600" />
            </div>}
          {participant.isVideoOff && <div className="p-1 bg-slate-100 rounded">
              <VideoOff size={12} className="text-slate-600" />
            </div>}

          {/* Menu */}
          <div className="relative">
            <motion.button whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }} onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={14} className="text-slate-600" />
            </motion.button>

            <AnimatePresence>
              {showMenu && <motion.div initial={{
              opacity: 0,
              scale: 0.95,
              y: -10
            }} animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }} exit={{
              opacity: 0,
              scale: 0.95,
              y: -10
            }} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 min-w-[120px]">
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    View Profile
                  </button>
                  {participant.isAI && <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Remove from Call
                    </button>}
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>;
}