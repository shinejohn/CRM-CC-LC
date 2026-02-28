import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ListIcon, StickyNoteIcon } from 'lucide-react';
interface Slide {
  id: number;
  title: string;
  content: string;
  notes: string;
}
export function PresentationPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const slides: Slide[] = [{
    id: 1,
    title: 'Q3 Project Overview',
    content: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    notes: "Start by welcoming everyone and introducing the agenda for today's meeting."
  }, {
    id: 2,
    title: 'Current Metrics',
    content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    notes: "Highlight the key performance indicators and how we've improved since last quarter."
  }, {
    id: 3,
    title: 'Team Structure',
    content: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    notes: 'Explain the new team organization and how it will help us meet our goals.'
  }, {
    id: 4,
    title: 'Next Steps',
    content: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    notes: 'Outline action items and deadlines for the upcoming sprint.'
  }, {
    id: 5,
    title: 'Q&A',
    content: 'https://images.unsplash.com/photo-1520004434532-668416a08753?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    notes: 'Open the floor for questions and discussion.'
  }];
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setShowThumbnails(false);
  };
  return <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="px-6 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-white font-semibold">
          {slides[currentSlide].title}
        </h2>
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => setShowThumbnails(!showThumbnails)} className={`p-2 rounded-lg transition-colors ${showThumbnails ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
          <ListIcon size={18} />
        </motion.button>
      </div>

      <div className={`flex-1 flex ${showThumbnails ? 'flex-row' : 'flex-col'} overflow-hidden`}>
        {/* Main slide view */}
        <div className={`${showThumbnails ? 'w-3/4' : 'w-full'} flex flex-col`}>
          {/* Slide display */}
          <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 relative">
            <AnimatePresence mode="wait">
              <motion.img key={currentSlide} initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.95
            }} transition={{
              duration: 0.3
            }} src={slides[currentSlide].content} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain rounded-lg shadow-2xl" />
            </AnimatePresence>

            {/* Slide navigation dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50 shadow-lg">
              {slides.map((_, index) => <motion.button key={index} whileHover={{
              scale: 1.2
            }} whileTap={{
              scale: 0.9
            }} className={`rounded-full transition-all ${index === currentSlide ? 'bg-blue-500 w-8 h-2' : 'bg-slate-600 hover:bg-slate-500 w-2 h-2'}`} onClick={() => goToSlide(index)} />)}
            </div>

            {/* Navigation arrows */}
            <motion.button whileHover={{
            scale: 1.05,
            x: -2
          }} whileTap={{
            scale: 0.95
          }} onClick={prevSlide} disabled={currentSlide === 0} className={`absolute left-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 text-white transition-opacity shadow-lg ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800'}`}>
              <ChevronLeftIcon size={24} />
            </motion.button>

            <motion.button whileHover={{
            scale: 1.05,
            x: 2
          }} whileTap={{
            scale: 0.95
          }} onClick={nextSlide} disabled={currentSlide === slides.length - 1} className={`absolute right-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 text-white transition-opacity shadow-lg ${currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800'}`}>
              <ChevronRightIcon size={24} />
            </motion.button>
          </div>

          {/* Slide counter */}
          <div className="px-6 py-2 bg-slate-800 border-t border-slate-700 text-center">
            <span className="text-sm text-slate-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>

          {/* Presenter notes */}
          <motion.div initial={{
          height: 0
        }} animate={{
          height: 'auto'
        }} className="px-6 py-3 bg-amber-900/20 border-t border-amber-800/30">
            <div className="flex items-center gap-2 mb-2">
              <StickyNoteIcon size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                Presenter Notes
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={currentSlide} initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: 10
            }} transition={{
              duration: 0.2
            }} className="text-sm text-slate-300 leading-relaxed">
                {slides[currentSlide].notes}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Thumbnails sidebar */}
        <AnimatePresence>
          {showThumbnails && <motion.div initial={{
          width: 0,
          opacity: 0
        }} animate={{
          width: '25%',
          opacity: 1
        }} exit={{
          width: 0,
          opacity: 0
        }} transition={{
          duration: 0.3
        }} className="border-l border-slate-700 overflow-hidden bg-slate-800">
              <div className="p-4 text-sm font-semibold text-slate-300 border-b border-slate-700">
                All Slides
              </div>
              <div className="p-3 space-y-3 overflow-y-auto h-full">
                {slides.map((slide, index) => <motion.button key={slide.id} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => goToSlide(index)} className={`w-full p-2 rounded-lg transition-all ${index === currentSlide ? 'bg-blue-600/30 border-2 border-blue-500 shadow-lg' : 'bg-slate-700/50 border-2 border-transparent hover:bg-slate-700'}`}>
                    <div className="aspect-video mb-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-600">
                      <img src={slide.content} alt={slide.title} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-xs font-medium text-slate-300 truncate">
                      {index + 1}. {slide.title}
                    </div>
                  </motion.button>)}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}