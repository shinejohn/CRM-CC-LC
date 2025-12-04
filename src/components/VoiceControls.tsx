import React, { useEffect, useState } from 'react';
import { VolumeIcon, StopCircleIcon, MicIcon } from 'lucide-react';
export const VoiceControls = ({
  isListening,
  setIsListening,
  onTranscriptUpdate,
  transcript,
  setTranscript,
  addMessage
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      onTranscriptUpdate(text);
    };
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    if (isListening) {
      recognition.start();
    }
    return () => {
      recognition.stop();
    };
  }, [isListening]);
  const toggleListening = () => {
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
  const speakText = text => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  return <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Voice Controls</h3>
        <div className="flex space-x-2">
          <button className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} onClick={toggleListening} title={isListening ? 'Stop listening' : 'Start listening'}>
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
        {transcript ? transcript : isListening ? 'Listening...' : 'Click the microphone to start speaking'}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{isListening ? '🔴 Listening' : '⚪ Inactive'}</span>
        <span>{isSpeaking ? '🔊 Speaking' : ''}</span>
      </div>
    </div>;
};