import React, { useRef, Component } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, ArrowRight, MousePointer, Sparkles } from 'lucide-react';
interface Screen {
  title: string;
  description: string;
  image: string;
  features: string[];
  highlight: string;
}
export function ScreensShowcaseSection() {
  const screens: Screen[] = [{
    title: 'Marketing Strategy Development',
    description: 'AI-powered marketing plan generation that analyzes market data, identifies opportunities, and creates comprehensive strategies in real-time.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Real-time competitive analysis with confidence scoring', 'Auto-generated marketing strategy recommendations', 'Interactive collaboration with AI suggestions'],
    highlight: 'Reduced strategy development time by 68%'
  }, {
    title: 'Sales Discovery & Proposal',
    description: 'Interactive presentations that adapt to client reactions while the AI assistant analyzes needs and generates tailored proposals on the fly.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Dynamic presentation content based on client engagement', 'Real-time needs assessment and solution matching', 'Instant proposal generation with pricing optimization'],
    highlight: '35% higher close rates with AI-assisted presentations'
  }, {
    title: 'Project Implementation & Collaboration',
    description: 'Unified workspace where implementation teams collaborate, track milestones, and overcome challenges with AI-powered problem solving.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Visual project planning with AI-suggested improvements', 'Automated documentation and knowledge capture', 'Predictive issue identification and resolution'],
    highlight: '42% reduction in implementation time'
  }];
  return <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            See <span className="text-blue-600">IdeaCircuit</span> in Action
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience how teams across your organization use our platform to
            transform their workflow and deliver exceptional results
          </p>
        </motion.div>

        {/* Screens */}
        <div className="space-y-32">
          {screens.map((screen, index) => <ScreenShowcase key={index} screen={screen} index={index} />)}
        </div>
      </div>
    </section>;
}
// Individual Screen Showcase Component
interface ScreenShowcaseProps {
  screen: Screen;
  index: number;
}
function ScreenShowcase({
  screen,
  index
}: ScreenShowcaseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px'
  });
  const aiActivities = [{
    icon: Zap,
    text: 'Analyzing market data and identifying opportunities in the healthcare sector...'
  }, {
    icon: MousePointer,
    text: 'Generating targeted messaging recommendations based on competitor analysis...'
  }, {
    icon: Sparkles,
    text: 'Creating budget allocation suggestions optimized for maximum ROI...'
  }];
  return <motion.div ref={ref} initial={{
    opacity: 0,
    y: 60
  }} animate={isInView ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 0,
    y: 60
  }} transition={{
    duration: 0.7,
    delay: 0.2
  }} className="relative">
      {/* Screen showcase */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative">
          {/* Browser-like header */}
          <div className="bg-slate-800 p-4 flex items-center border-b border-slate-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            </div>
            <div className="flex-1 text-center text-slate-400 text-sm font-medium">
              IdeaCircuit — {screen.title}
            </div>
          </div>

          {/* Screenshot with overlay */}
          <div className="relative bg-slate-950">
            <img src={screen.image} alt={screen.title} className="w-full h-auto object-cover opacity-30 max-h-[500px]" />

            {/* AI Activity Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <motion.div initial={{
              scale: 0.9,
              opacity: 0
            }} animate={isInView ? {
              scale: 1,
              opacity: 1
            } : {
              scale: 0.9,
              opacity: 0
            }} transition={{
              duration: 0.5,
              delay: 0.5
            }} className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl max-w-2xl border border-slate-700/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div animate={{
                  scale: [1, 1.2, 1]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }} className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                  <p className="text-emerald-400 font-semibold text-lg">
                    AI Assistant Active
                  </p>
                </div>

                {/* Activities */}
                <div className="space-y-4">
                  {aiActivities.map((activity, i) => <motion.div key={i} initial={{
                  opacity: 0,
                  x: -20
                }} animate={isInView ? {
                  opacity: 1,
                  x: 0
                } : {
                  opacity: 0,
                  x: -20
                }} transition={{
                  duration: 0.5,
                  delay: 0.7 + i * 0.15
                }} className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shrink-0">
                        <activity.icon size={18} className="text-blue-400" />
                      </div>
                      <span className="text-slate-300 leading-relaxed">
                        {activity.text}
                      </span>
                    </motion.div>)}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <motion.div initial={{
      opacity: 0,
      y: 40
    }} animate={isInView ? {
      opacity: 1,
      y: 0
    } : {
      opacity: 0,
      y: 40
    }} transition={{
      duration: 0.6,
      delay: 0.4
    }} className="bg-white -mt-24 mx-6 md:mx-16 relative z-10 p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Content */}
          <div className="lg:w-2/3">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              {screen.title}
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-lg">
              {screen.description}
            </p>

            {/* Features */}
            <ul className="space-y-3">
              {screen.features.map((feature, i) => <motion.li key={i} initial={{
              opacity: 0,
              x: -20
            }} animate={isInView ? {
              opacity: 1,
              x: 0
            } : {
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.4,
              delay: 0.6 + i * 0.1
            }} className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded shrink-0 mt-0.5">
                    <ArrowRight size={16} className="text-blue-600" />
                  </div>
                  <span className="text-slate-700 leading-relaxed">
                    {feature}
                  </span>
                </motion.li>)}
            </ul>
          </div>

          {/* Highlight Stat */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={isInView ? {
          opacity: 1,
          scale: 1
        } : {
          opacity: 0,
          scale: 0.9
        }} transition={{
          duration: 0.5,
          delay: 0.8
        }} className="lg:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-700 font-semibold text-lg mb-2">
                {screen.highlight.split(' by ')[0]}
              </div>
              {screen.highlight.includes(' by ') && <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {screen.highlight.split(' by ')[1]}
                </div>}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>;
}