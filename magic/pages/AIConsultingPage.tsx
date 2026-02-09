import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { AIServiceAdvisor } from '../components/AIServiceAdvisor';
import { ProposalCard } from '../components/ProposalCard';
import { ImplementationTracker } from '../components/ImplementationTracker';
import { SessionScheduler } from '../components/SessionScheduler';
import { ConsultingChat } from '../components/ConsultingChat';
interface AIConsultingPageProps {
  onNavigate?: (page: string) => void;
}
export function AIConsultingPage({
  onNavigate
}: AIConsultingPageProps) {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Consulting</h1>
        <p className="text-slate-500">
          Strategic guidance and implementation for your business growth.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Strategy & Implementation */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Proposals */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Active Proposals
            </h2>
            <div className="space-y-4">
              <div onClick={() => onNavigate?.('proposal-detail')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <ProposalCard />
              </div>
            </div>
          </motion.div>

          {/* Implementation Projects */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Implementation Projects
            </h2>
            <div onClick={() => onNavigate?.('implementation-detail')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <ImplementationTracker />
            </div>
          </motion.div>

          {/* Service Advisor */}
          <motion.div variants={itemVariants}>
            <AIServiceAdvisor />
          </motion.div>
        </div>

        {/* Right Column - Chat & Scheduling */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div variants={itemVariants} className="h-[500px]">
            <ConsultingChat />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div onClick={() => onNavigate?.('session-detail')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <SessionScheduler />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>;
}