import React, { useState, useCallback } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
  onAction?: (action: string, payload: Record<string, unknown>) => void;
}

function normalizeFields(raw: unknown): FormField[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      name: (r.name as string) ?? (r.field as string) ?? (r.label as string)?.toLowerCase().replace(/\s+/g, '_') ?? '',
      label: (r.label as string) ?? (r.field as string) ?? (r.name as string) ?? '',
      type: (r.type as FormField['type']) ?? 'text',
      required: typeof r.required === 'boolean' ? r.required : false,
      placeholder: r.placeholder as string | undefined,
      options: Array.isArray(r.options) ? (r.options as string[]) : undefined,
    };
  });
}

export const FormSlide: React.FC<FormSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
  onAction,
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    orange: 'bg-gradient-to-br from-orange-50 to-red-100',
  };

  const accentColors = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const focusRing = {
    blue: 'focus:ring-blue-500 focus:border-blue-500',
    green: 'focus:ring-emerald-500 focus:border-emerald-500',
    purple: 'focus:ring-purple-500 focus:border-purple-500',
    orange: 'focus:ring-orange-500 focus:border-orange-500',
  };

  const headline = (content.headline as string) ?? (content.title as string) ?? 'Tell Us About Your Business';
  const subheadline = content.subheadline as string | undefined;
  const fields = normalizeFields(content.fields);
  const submit_text = (content.submit_text as string) ?? (content.button_text as string) ?? 'Submit';
  const success_message = (content.success_message as string) ?? 'Thank you! We\'ll be in touch soon.';
  const success_headline = (content.success_headline as string) ?? 'Submitted Successfully';
  const submit_endpoint = content.submit_endpoint as string | undefined;
  const form_id = content.form_id as string | undefined;

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSubmitting(true);

      // Validate required fields
      for (const field of fields) {
        if (field.required && !values[field.name]?.trim()) {
          setError(`${field.label} is required.`);
          setSubmitting(false);
          return;
        }
      }

      // If there's a submit endpoint, call it
      if (submit_endpoint) {
        try {
          await apiClient.post(submit_endpoint, {
            form_id,
            data: values,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
          setError(msg);
          setSubmitting(false);
          return;
        }
      }

      // Notify parent via onAction
      onAction?.('form_submitted', {
        form_id,
        values,
        fields: fields.map((f) => f.name),
      });

      setSubmitted(true);
      setSubmitting(false);
    },
    [fields, values, submit_endpoint, form_id, onAction]
  );

  const renderField = (field: FormField, index: number) => {
    const commonClasses = `w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${focusRing[theme]} transition-colors`;

    return (
      <div
        key={field.name}
        className="animate-fade-in"
        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
      >
        <label htmlFor={`form-${field.name}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            id={`form-${field.name}`}
            name={field.name}
            rows={3}
            required={field.required}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={commonClasses}
          />
        ) : field.type === 'select' && field.options ? (
          <select
            id={`form-${field.name}`}
            name={field.name}
            required={field.required}
            value={values[field.name] ?? ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={commonClasses}
            aria-label={field.label}
          >
            <option value="">{field.placeholder ?? 'Select...'}</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`form-${field.name}`}
            type={field.type ?? 'text'}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={commonClasses}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-8 overflow-y-auto
        ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center animate-fade-in">
          {headline}
        </h2>
        {subheadline && (
          <p className="text-gray-600 text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {subheadline}
          </p>
        )}

        {submitted ? (
          <div className="text-center py-12 animate-fade-in">
            <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{success_headline}</h3>
            <p className="text-gray-600">{success_message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-xl animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="space-y-4">
              {fields.map((field, index) => renderField(field, index))}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 rounded-lg border border-red-200" role="alert">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`
                w-full mt-6 py-4 rounded-lg text-white font-bold text-lg
                ${accentColors[theme]} hover:opacity-90 transition-opacity
                disabled:opacity-50 shadow-lg
                flex items-center justify-center gap-2
              `}
            >
              <Send size={20} />
              {submitting ? 'Submitting...' : submit_text}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
