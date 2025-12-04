import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  MessageCircle,
} from 'lucide-react';
import {
  HeroSlide,
  ProblemSlide,
  SolutionSlide,
  StatsSlide,
  ComparisonSlide,
  ProcessSlide,
  TestimonialSlide,
  PricingSlide,
  CTASlide,
} from './slides';
import { AIChatPanel } from './AIChatPanel';
import type { Presentation, Slide } from '@/types/learning';

interface FibonaccoPlayerProps {
  presentation: Presentation;
  autoPlay?: boolean;
  onSlideChange?: (slideId: number) => void;
  onComplete?: () => void;
}

const slideComponents: Record<string, React.ComponentType<any>> = {
  HeroSlide,
  ProblemSlide,
  SolutionSlide,
  StatsSlide,
  ComparisonSlide,
  ProcessSlide,
  TestimonialSlide,
  PricingSlide,
  CTASlide,
};

export const FibonaccoPlayer: React.FC<FibonaccoPlayerProps> = ({
  presentation,
  autoPlay = false,
  onSlideChange,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const slides = presentation.slides || [];
  const activeSlide = slides[currentSlide];
  const theme = presentation.meta.theme || 'blue';

  // Audio handling
  useEffect(() => {
    const audioUrl = activeSlide?.audio_url || activeSlide?.audioUrl;
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setAudioProgress(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      handleNextSlide();
    });

    if (isPlaying) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [currentSlide, activeSlide?.audio_url, activeSlide?.audioUrl, isPlaying]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      setAudioProgress(0);
      onSlideChange?.(nextSlide);
    } else {
      onComplete?.();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      setAudioProgress(0);
      onSlideChange?.(prevSlide);
    }
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setAudioProgress(0);
    onSlideChange?.(index);
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const SlideComponent = activeSlide
    ? slideComponents[activeSlide.component] || HeroSlide
    : HeroSlide;

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gray-900 flex flex-col relative"
    >
      {/* Slide Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeSlide && (
          <SlideComponent
            content={activeSlide.content as any}
            isActive={true}
            theme={theme}
          />
        )}
      </div>

      {/* AI Presenter Panel */}
      {presentation.presenter && activeSlide?.narration && (
        <div className="absolute bottom-24 left-0 right-0 px-6 z-20">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              {presentation.presenter.avatar_url && (
                <img
                  src={presentation.presenter.avatar_url}
                  alt={presentation.presenter.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {presentation.presenter.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {presentation.presenter.role}
                  </span>
                  {isPlaying && (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-indigo-600 rounded animate-pulse" />
                      <div className="w-1 h-4 bg-indigo-600 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-4 bg-indigo-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700">{activeSlide.narration}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm z-30">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{
              width: `${(audioProgress / audioDuration) * 100}%`,
            }}
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className="p-2 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:bg-white/10 rounded transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlide === slides.length - 1}
                className="p-2 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleMute}
                  className="p-2 text-white hover:bg-white/10 rounded transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>

            {/* Center: Slide Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideClick(index)}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${
                      index === currentSlide
                        ? 'bg-indigo-600 w-8'
                        : 'bg-white/30 hover:bg-white/50'
                    }
                  `}
                />
              ))}
            </div>

            {/* Right: Chat & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowChat(!showChat);
                  if (!showChat && isPlaying) {
                    handlePlayPause(); // Pause when opening chat
                  }
                }}
                className={`p-2 rounded transition-colors ${
                  showChat
                    ? 'bg-indigo-600 text-white'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Ask a question"
              >
                <MessageCircle size={20} />
              </button>
              <span className="text-sm text-white/70">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={handleFullscreen}
                className="p-2 text-white hover:bg-white/10 rounded transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showChat}
        onClose={() => {
          setShowChat(false);
          if (!isPlaying) {
            handlePlayPause(); // Resume if paused
          }
        }}
        presenterName={presentation.presenter?.name}
        customerId={presentation.meta?.email_hook ? undefined : undefined} // Extract from presentation
        presentationId={presentation.id}
        conversationId={conversationId}
        onResume={() => {
          setShowChat(false);
          handlePlayPause();
        }}
        isPaused={!isPlaying}
      />
    </div>
  );
};

