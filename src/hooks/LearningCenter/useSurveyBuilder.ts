import { useState, useEffect, useCallback } from 'react';
import { surveyApi } from '@/services/learning/survey-api';
import type { SurveySection, SurveyQuestion } from '@/types/learning';

export const useSurveyBuilder = () => {
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyApi.getSections();
      setSections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sections';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSection = useCallback(async (data: Partial<SurveySection>) => {
    setLoading(true);
    setError(null);
    try {
      const newSection = await surveyApi.createSection(data);
      setSections((prev) => [...prev, newSection]);
      return newSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create section';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSection = useCallback(async (id: string, data: Partial<SurveySection>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await surveyApi.updateSection(id, data);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSection = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await surveyApi.deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete section';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (data: Partial<SurveyQuestion>) => {
    setLoading(true);
    setError(null);
    try {
      const newQuestion = await surveyApi.createQuestion(data);
      // Reload sections to get updated questions
      await loadSections();
      return newQuestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSections]);

  const updateQuestion = useCallback(async (id: string, data: Partial<SurveyQuestion>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await surveyApi.updateQuestion(id, data);
      // Reload sections to get updated questions
      await loadSections();
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSections]);

  const deleteQuestion = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await surveyApi.deleteQuestion(id);
      // Reload sections to get updated questions
      await loadSections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSections]);

  return {
    sections,
    loading,
    error,
    loadSections,
    createSection,
    updateSection,
    deleteSection,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};


