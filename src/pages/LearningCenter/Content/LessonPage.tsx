/**
 * Content Lesson Page - Renders lesson with slides and tracks view progress
 * Wires to GET /v1/content/{slug} and POST /v1/content/{slug}/track/*
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FibonaccoPlayer } from '@/components/LearningCenter/Presentation/FibonaccoPlayer';
import { contentApi, type Content } from '@/services/learning/content-api';
import type { Presentation } from '@/types/learning';

function contentToPresentation(content: Content): Presentation {
  const slides = (content.slides ?? []).map((s, i) => ({
    id: s.id ?? i + 1,
    component: (s.component as Presentation['slides'][0]['component']) ?? 'HeroSlide',
    content: {
      headline: s.headline,
      subheadline: s.subheadline,
      content: s.content,
      ...s,
    },
    narration: s.content,
  }));

  return {
    id: content.slug,
    presentation_id: String(content.id),
    title: content.title,
    description: content.article_body?.slice(0, 200),
    meta: {
      title: content.title,
      duration: content.duration_seconds,
      slideCount: slides.length,
      audioBaseUrl: content.audio_base_url,
      theme: 'blue',
    },
    presenter: {
      id: 'instructor',
      name: 'AI Instructor',
      role: 'Learning',
      personality: 'helpful',
      communication_style: 'educational',
    },
    slides,
    theme: { primaryColor: '#6366f1', secondaryColor: '#10b981' },
  };
}

export const ContentLessonPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [lastSlideIndex, setLastSlideIndex] = useState(0);

  const loadContent = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await contentApi.getContentBySlug(slug);
      setContent(data);
      const { view_id } = await contentApi.trackStart(slug, {
        source_url: window.location.href,
      });
      setViewId(view_id);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSlideChange = useCallback(
    (slideIndex: number) => {
      if (!slug || viewId == null || slideIndex <= lastSlideIndex) return;
      setLastSlideIndex(slideIndex);
      contentApi.trackSlide(slug, { view_id: viewId, slide_number: slideIndex + 1 }).catch(console.error);
    },
    [slug, viewId, lastSlideIndex]
  );

  const handleComplete = useCallback(async () => {
    if (!slug || viewId == null) return;
    try {
      await contentApi.trackComplete(slug, {
        view_id: viewId,
        time_on_page_seconds: Math.round((Date.now() - (window as any).__contentStartTime) / 1000),
      });
    } catch (e) {
      console.error('Track complete failed:', e);
    }
  }, [slug, viewId]);

  useEffect(() => {
    (window as any).__contentStartTime = Date.now();
    return () => {
      if (slug && viewId != null) {
        contentApi.trackComplete(slug, { view_id: viewId }).catch(() => {});
      }
    };
  }, [slug, viewId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate('/learning')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Learning Center
          </button>
        </div>
      </div>
    );
  }

  const presentation = contentToPresentation(content);

  return (
    <div className="w-full min-h-screen bg-gray-900 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <FibonaccoPlayer
        presentation={presentation}
        autoPlay={false}
        onComplete={handleComplete}
        onSlideChange={handleSlideChange}
      />
    </div>
  );
};
