import React, { useEffect, useState, useRef } from 'react';
import { VolumeIcon, StopCircleIcon, MicIcon } from 'lucide-react';
interface Message {
  sender: string;
  text: string;
  isAI: boolean;
}
interface VoiceControlsProps {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  onTranscriptUpdate: (text: string) => void;
  transcript: string;
  setTranscript: (text: string) => void;
  addMessage: (message: Message) => void;
}
// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
export const VoiceControls = ({
  isListening,
  setIsListening,
  onTranscriptUpdate,
  transcript,
  setTranscript,
  addMessage
}: VoiceControlsProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  // Initialize speech recognition
  useEffect(() => {
    try {
      // Check if browser supports speech recognition
      if (typeof window === 'undefined' || !('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        setIsSupported(false);
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          try {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
            onTranscriptUpdate(text);
          } catch (error) {
            console.error('Speech recognition result error:', error);
          }
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setIsSupported(false);
          }
        };
        recognitionRef.current.onend = () => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
              setIsListening(false);
            }
          }
        };
      }
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to start recognition:', error);
        }
      } else if (!isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Failed to stop recognition:', error);
        }
      }
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        }
      };
    } catch (error) {
      console.error('Speech recognition initialization error:', error);
      setIsSupported(false);
    }
  }, [isListening, onTranscriptUpdate, setTranscript, setIsListening]);
  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('');
    } else if (transcript) {
      // Add transcript to chat when stopping
      addMessage({
        sender: 'You',
        text: transcript,
        isAI: false
      });
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = `I heard you say: "${transcript}". Is there anything specific you'd like to discuss about this?`;
        addMessage({
          sender: 'AI Facilitator',
          text: aiResponse,
          isAI: true
        });
        // Text-to-speech for AI response
        speakText(aiResponse);
      }, 1000);
    }
  };
  const speakText = (text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = event => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };
  const stopSpeaking = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Stop speaking error:', error);
    }
  };
  return <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Voice Controls</h3>
        <div className="flex space-x-2">
          <button className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={toggleListening} title={isListening ? 'Stop listening' : 'Start listening'} disabled={!isSupported}>
            <MicIcon size={16} />
          </button>
          {isSpeaking ? <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors" onClick={stopSpeaking} title="Stop speaking">
              <StopCircleIcon size={16} />
            </button> : <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onClick={() => transcript && speakText(transcript)} title="Speak text" disabled={!transcript}>
              <VolumeIcon size={16} />
            </button>}
        </div>
      </div>
      <div className="bg-gray-50 rounded p-2 min-h-[50px] text-xs border border-gray-200">
        {!isSupported ? 'Voice features not available in this browser' : transcript ? transcript : isListening ? 'Listening...' : 'Click the microphone to start speaking'}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{isListening ? '🔴 Listening' : '⚪ Inactive'}</span>
        <span>{isSpeaking ? '🔊 Speaking' : ''}</span>
      </div>
    </div>;
};