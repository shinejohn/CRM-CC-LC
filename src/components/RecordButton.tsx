import React, { useEffect, useState } from 'react';
import { StopCircleIcon, LoaderIcon } from 'lucide-react';
export const RecordButton = ({
  onRecordingComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, processing, complete
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingStatus('processing');
      // Simulate processing time
      setTimeout(() => {
        setRecordingStatus('complete');
        if (onRecordingComplete) {
          onRecordingComplete({
            duration: recordingTime,
            date: new Date().toISOString(),
            filename: `recording-${new Date().toISOString().substring(0, 10)}.mp4`
          });
        }
      }, 2000);
    } else {
      // Start recording
      setRecordingTime(0);
      setIsRecording(true);
      setRecordingStatus('recording');
    }
  };
  return <div className="relative">
      <button onClick={toggleRecording} disabled={recordingStatus === 'processing'} className={`p-3 rounded-full flex items-center justify-center relative
          ${isRecording ? 'bg-red-500 text-white animate-pulse' : recordingStatus === 'processing' ? 'bg-gray-400 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}>
        {recordingStatus === 'processing' ? <LoaderIcon size={20} className="animate-spin" /> : isRecording ? <StopCircleIcon size={20} /> : <div size={20} />}
      </button>
      {isRecording && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {formatTime(recordingTime)}
        </div>}
      {recordingStatus === 'complete' && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          Recording saved
        </div>}
    </div>;
};