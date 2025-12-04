import React, { useState } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { FAQList } from '@/components/LearningCenter/FAQ/FAQList';
import { FAQEditor } from '@/components/LearningCenter/FAQ/FAQEditor';
import { FAQBulkImport } from '@/components/LearningCenter/FAQ/FAQBulkImport';

export const FAQIndexPage: React.FC = () => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFAQId, setEditorFAQId] = useState<string | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddFAQ = () => {
    setEditorFAQId(undefined);
    setEditorOpen(true);
  };

  const handleEditFAQ = (id: string) => {
    setEditorFAQId(id);
    setEditorOpen(true);
  };

  const handleViewFAQ = (id: string) => {
    // Navigate to FAQ detail view
    window.location.href = `/learning/faqs/${id}`;
  };

  const handleSave = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <LearningLayout
      title="FAQs"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'FAQs' },
      ]}
      actions={
        <>
          <button
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bulk Import
          </button>
        </>
      }
    >
      <FAQList
        key={refreshKey}
        onAddFAQ={handleAddFAQ}
        onEditFAQ={handleEditFAQ}
        onViewFAQ={handleViewFAQ}
      />

      {editorOpen && (
        <FAQEditor
          faqId={editorFAQId}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
        />
      )}

      {importOpen && (
        <FAQBulkImport
          onClose={() => setImportOpen(false)}
          onComplete={handleSave}
        />
      )}
    </LearningLayout>
  );
};

