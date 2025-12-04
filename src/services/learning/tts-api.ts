// ============================================
// ELEVEN LABS TTS API SERVICE
// ============================================

import { apiClient } from './api-client';
import type { TTSJob, ElevenLabsVoice } from '@/types/learning';

export const ttsApi = {
  // Generate audio for a slide
  generateSlideAudio: async (
    text: string,
    voiceId: string,
    presentationId: string,
    slideId: number
  ): Promise<TTSJob> => {
    return apiClient.post<TTSJob>('/learning/presentations/tts/generate', {
      text,
      voice_id: voiceId,
      presentation_id: presentationId,
      slide_id: slideId,
      content_type: 'slide',
    });
  },

  // Get TTS job status
  getTTSJobStatus: async (jobId: string): Promise<TTSJob> => {
    return apiClient.get<TTSJob>(`/learning/presentations/tts/jobs/${jobId}`);
  },

  // List available voices
  getVoices: async (): Promise<ElevenLabsVoice[]> => {
    return apiClient.get<ElevenLabsVoice[]>('/learning/presentations/tts/voices');
  },

  // Generate audio for FAQ
  generateFAQAudio: async (faqId: string, voiceId: string): Promise<TTSJob> => {
    return apiClient.post<TTSJob>('/learning/presentations/tts/generate', {
      faq_id: faqId,
      voice_id: voiceId,
      content_type: 'faq',
    });
  },
};


