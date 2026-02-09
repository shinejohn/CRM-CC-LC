import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Sparkles } from 'lucide-react';
export function AIPresentationPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const slides = [{
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
  return <div className="h-full flex flex-col bg-gray-900">
      {/* Minimal header - just slide title and thumbnails toggle */}
      <div className="px-4 py-2 bg-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-medium">
            {slides[currentSlide].title}
          </span>
        </div>
        <button onClick={() => setShowThumbnails(!showThumbnails)} className="p-1.5 hover:bg-gray-700 rounded transition-colors text-white">
          <List size={16} />
        </button>
      </div>

      <div className={`flex-1 flex ${showThumbnails ? 'flex-row' : 'flex-col'} overflow-hidden`}>
        {/* Main slide view - maximized */}
        <div className={`${showThumbnails ? 'w-3/4' : 'w-full'} flex flex-col`}>
          {/* Slide display - takes all available space */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center p-2 relative">
            <motion.img key={currentSlide} initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3
          }} src={slides[currentSlide].content} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain" />

            {/* Slide navigation dots - minimal overlay */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-60 rounded-full px-3 py-1.5">
              {slides.map((_, index) => <button key={index} className={`h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-gray-400 hover:bg-gray-300 w-2'}`} onClick={() => goToSlide(index)}></button>)}
            </div>

            {/* Navigation arrows - minimal overlay */}
            <button onClick={prevSlide} disabled={currentSlide === 0} className={`absolute left-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-60 text-white transition-opacity ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-60 text-white transition-opacity ${currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Compact slide counter */}
          <div className="px-4 py-1.5 bg-gray-800 text-center">
            <span className="text-xs text-gray-400">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>

          {/* Presenter notes - compact */}
          <div className="px-4 py-2 bg-yellow-900 bg-opacity-20 border-t border-yellow-800">
            <div className="text-xs font-medium text-yellow-200 mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI NOTES
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {slides[currentSlide].notes}
            </p>
          </div>
        </div>

        {/* Thumbnails sidebar - compact */}
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
        }} className="border-l border-gray-700 overflow-y-auto bg-gray-800">
              <div className="p-2 text-xs font-medium text-gray-300 border-b border-gray-700">
                All Slides
              </div>
              <div className="p-2 space-y-2">
                {slides.map((slide, index) => <button key={slide.id} onClick={() => goToSlide(index)} className={`w-full p-2 rounded cursor-pointer transition-colors ${index === currentSlide ? 'bg-blue-600 bg-opacity-30 border border-blue-500' : 'hover:bg-gray-700'}`}>
                    <div className="aspect-video mb-1 bg-gray-900 rounded overflow-hidden">
                      <img src={slide.content} alt={slide.title} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-xs font-medium truncate text-gray-300">
                      {index + 1}. {slide.title}
                    </div>
                  </button>)}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}