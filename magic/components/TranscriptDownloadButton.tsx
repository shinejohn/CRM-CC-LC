import React, { useState, createElement } from 'react';
import { DownloadIcon, FileTextIcon, CheckIcon, LoaderIcon } from 'lucide-react';
type DownloadStatus = 'idle' | 'downloading' | 'complete';
interface TranscriptDownloadButtonProps {
  sessionId?: string;
  disabled?: boolean;
}
export const TranscriptDownloadButton = ({
  sessionId,
  disabled
}: TranscriptDownloadButtonProps) => {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const handleDownload = () => {
    if (disabled) return;
    setDownloadStatus('downloading');
    // Simulate download processing time
    setTimeout(() => {
      // Create sample transcript content
      const transcriptContent = `
Meeting Transcript - ${new Date().toLocaleString()}
Session ID: ${sessionId || 'unknown'}

John Doe: Hello everyone, thanks for joining today's meeting.
Jane Smith: Hi John, glad to be here.
Alex Johnson: Hello team, looking forward to the discussion.

John Doe: Let's start by reviewing our progress on the AI implementation project.
Jane Smith: We've completed the data preprocessing phase and are now moving to model training.
Alex Johnson: I have some concerns about the timeline. Can we discuss the deployment schedule?

John Doe: Certainly. The current plan is to deploy the first version in two weeks.
Jane Smith: That seems ambitious given the remaining testing requirements.
Alex Johnson: I agree with Jane. We should consider adding an extra week for quality assurance.

John Doe: That's a good point. Let's adjust the timeline to include additional testing.
Jane Smith: Perfect, I'll update the project plan accordingly.
Alex Johnson: Thank you, that addresses my concerns.

John Doe: Any other topics we need to cover today?
Jane Smith: Not from my side.
Alex Johnson: We're all set. Thanks everyone.
John Doe: Great, let's wrap up then. Have a great day!
      `.trim();
      // Create and download the file
      const element = document.createElement('a');
      const file = new Blob([transcriptContent], {
        type: 'text/plain'
      });
      element.href = URL.createObjectURL(file);
      element.download = `meeting-transcript-${new Date().toISOString().substring(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadStatus('complete');
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);
    }, 1500);
  };
  return <div className="relative">
      <button onClick={handleDownload} disabled={disabled || downloadStatus === 'downloading'} className={`p-3 rounded-full flex items-center justify-center text-white transition-colors
          ${disabled ? 'bg-gray-400 cursor-not-allowed' : downloadStatus === 'downloading' ? 'bg-blue-400' : downloadStatus === 'complete' ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
        {downloadStatus === 'downloading' ? <LoaderIcon size={20} className="animate-spin" /> : downloadStatus === 'complete' ? <CheckIcon size={20} /> : <FileTextIcon size={20} />}
      </button>

      {downloadStatus === 'downloading' && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          Preparing transcript...
        </div>}

      {downloadStatus === 'complete' && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          Downloaded!
        </div>}
    </div>;
};