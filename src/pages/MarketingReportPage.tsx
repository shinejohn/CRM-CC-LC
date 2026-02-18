import React, { useState, useEffect } from 'react';
import { Facilitator } from '../components/Facilitator';
import { Participants } from '../components/Participants';
import { MarketingPlanForm } from '../components/MarketingPlanForm';
import { ExpandableChat } from '../components/ExpandableChat';
import { VoiceControls } from '../components/VoiceControls';
import { MainNavigationHeader } from '../components/MainNavigationHeader';
import { VideoIcon, MessageCircleIcon, MicIcon, BarChart3, RefreshCw } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

interface CampaignPerformanceItem {
  campaign_type: string;
  total_sessions: number;
  conversions: number;
  conversion_rate: number;
  avg_duration: number | null;
  engagement_rate: number;
}

interface CampaignPerformanceData {
  campaign_performance: CampaignPerformanceItem[];
  date_range: { start: string; end: string; days: number };
}

export const MarketingReportPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFacilitatorPresent, setIsFacilitatorPresent] = useState(true);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; isAI: boolean }>>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformanceData | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [participants, setParticipants] = useState<Array<{ id: number; name: string; image: string }>>([]);

  useEffect(() => {
    loadCampaignPerformance();
  }, []);

  const loadCampaignPerformance = async () => {
    setCampaignLoading(true);
    try {
      const data = await analyticsService.getCampaignPerformance() as unknown as CampaignPerformanceData;
      setCampaignPerformance(data);
    } catch (err) {
      console.error('Failed to load campaign performance:', err);
    } finally {
      setCampaignLoading(false);
    }
  };

  const addMessage = (message: { sender: string; text: string; isAI: boolean }) => {
    setMessages((prev) => [...prev, message]);
  };
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };
  return <div className="flex flex-col h-screen">
      {/* Main Navigation Header */}
      <MainNavigationHeader />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area - Marketing Report */}
        <div className="flex-1 border-r border-gray-300 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* Campaign Performance - Real API: GET /v1/crm/analytics/campaign-performance */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Campaign Performance
                </h2>
                <button
                  onClick={loadCampaignPerformance}
                  disabled={campaignLoading}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${campaignLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {campaignLoading ? (
                <div className="text-sm text-gray-500">Loading campaign metrics...</div>
              ) : campaignPerformance?.campaign_performance?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaignPerformance.campaign_performance.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="font-medium text-gray-900 text-sm">{item.campaign_type || 'Campaign'}</div>
                      <div className="mt-1 text-xs text-gray-600">
                        Sessions: {item.total_sessions} · Conversions: {item.conversions} · Rate: {item.conversion_rate}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No campaign performance data for the selected period.</p>
              )}
            </div>
            <MarketingPlanForm />
          </div>
          {/* Expandable Chat */}
          <ExpandableChat messages={messages} addMessage={addMessage} defaultExpanded={false} />
        </div>

        {/* Right Sidebar - Facilitator, Voice Controls, and Participants */}
        <div className="w-80 bg-gray-50 flex flex-col">
          {/* Facilitator */}
          {isFacilitatorPresent && <div className="p-3 border-b border-gray-200">
              <div className="h-48">
                <Facilitator isVisible={true} isVideoOff={isVideoOff} />
              </div>
            </div>}

          {/* Voice Controls */}
          <div className="p-3 border-b border-gray-200">
            <VoiceControls isListening={isListening} setIsListening={setIsListening} onTranscriptUpdate={handleTranscriptUpdate} transcript={transcript} setTranscript={setTranscript} addMessage={addMessage} />
          </div>

          {/* Participants */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 bg-gray-200 font-medium text-sm sticky top-0">
              <span>Participants ({participants.length})</span>
            </div>
            <Participants participants={participants} />
          </div>
        </div>
      </div>

      {/* Footer - Controls */}
      <div className="bg-gray-800 text-white p-4 flex justify-center items-center space-x-6">
        <button className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsMuted(!isMuted)}>
          <MicIcon size={20} />
        </button>
        <button className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsVideoOff(!isVideoOff)}>
          <VideoIcon size={20} />
        </button>
        <button className={`p-3 rounded-full ${isChatOpen ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setIsChatOpen(!isChatOpen)}>
          <MessageCircleIcon size={20} />
        </button>
        <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-500" onClick={() => setIsFacilitatorPresent(!isFacilitatorPresent)}>
          {isFacilitatorPresent ? 'Hide Facilitator' : 'Show Facilitator'}
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium">
          End Call
        </button>
      </div>
    </div>;
};