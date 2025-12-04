import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FibonaccoPlayer } from '@/components/LearningCenter/Presentation/FibonaccoPlayer';
import { presentationApi } from '@/services/learning/presentation-api';
import type { Presentation } from '@/types/learning';

export const PresentationPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPresentation();
    }
  }, [id]);

  const loadPresentation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await presentationApi.getPresentation(id!);
      setPresentation(data);
    } catch (err) {
      console.error('Failed to load presentation:', err);
      setError('Failed to load presentation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || 'Presentation not found'}</p>
          <button
            onClick={() => navigate('/learning')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <FibonaccoPlayer
        presentation={presentation}
        autoPlay={false}
        onComplete={() => {
          // Handle completion
          console.log('Presentation completed');
        }}
      />
    </div>
  );
};


