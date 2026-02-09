import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, VideoOff } from 'lucide-react';
interface FacilitatorProps {
  isVisible: boolean;
  isVideoOff: boolean;
}
export function Facilitator({
  isVisible,
  isVideoOff
}: FacilitatorProps) {
  if (!isVisible) return null;
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.95
  }} className="bg-slate-900 rounded-xl overflow-hidden flex-1 flex items-center justify-center relative shadow-lg border border-slate-800">
      <AnimatePresence mode="wait">
        {isVideoOff ? <motion.div key="video-off" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} className="flex flex-col items-center justify-center text-white">
            <div className="bg-slate-800 p-6 rounded-full mb-3 border-2 border-slate-700">
              <VideoOff size={48} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-300">Camera Off</p>
            <p className="text-sm text-slate-500 mt-1">AI Facilitator</p>
          </motion.div> : <motion.div key="video-on" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="relative w-full h-full">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="AI Facilitator" className="w-full h-full object-cover" />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Name badge */}
            <motion.div initial={{
          y: 10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.2
        }} className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 flex items-center gap-2 shadow-lg">
              <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }} className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-white">
                AI Facilitator
              </span>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}