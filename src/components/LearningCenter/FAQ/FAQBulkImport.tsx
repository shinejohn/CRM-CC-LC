import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, XCircle, Download, X } from 'lucide-react';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import { parseFile, type ParseResult } from '@/utils/file-parser';

interface FAQBulkImportProps {
  onClose: () => void;
  onComplete: () => void;
}

interface ImportResult {
  imported: number;
  errors: string[];
  warnings: string[];
}

export const FAQBulkImport: React.FC<FAQBulkImportProps> = ({
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [validation, setValidation] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleParseFile(selectedFile);
    }
  };

  const handleParseFile = async (file: File) => {
    setParseError(null);
    setImporting(true);
    
    try {
      const result = await parseFile(file);
      
      if (result.errors.length > 0) {
        setParseError(result.errors.join('; '));
        return;
      }

      if (result.rows.length === 0) {
        setParseError('No rows found in file');
        return;
      }

      setParsedData(result);
      setAvailableColumns(result.columns);

      // Auto-detect common column names
      const autoMapping: Record<string, string> = {};
      const lowercaseColumns = result.columns.map((col) => col.toLowerCase());
      
      const questionIndex = lowercaseColumns.findIndex((col) =>
        col.includes('question') || col.includes('q:')
      );
      if (questionIndex !== -1) {
        autoMapping.question = result.columns[questionIndex];
      }

      const answerIndex = lowercaseColumns.findIndex((col) =>
        col.includes('answer') || col.includes('a:')
      );
      if (answerIndex !== -1) {
        autoMapping.answer = result.columns[answerIndex];
      }

      const categoryIndex = lowercaseColumns.findIndex((col) =>
        col.includes('category') || col.includes('cat')
      );
      if (categoryIndex !== -1) {
        autoMapping.category = result.columns[categoryIndex];
      }

      setColumnMapping(autoMapping);

      // Show preview (first 5 rows)
      setPreview(result.rows.slice(0, 5));
      setStep(2);
    } catch (error) {
      setParseError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const result = await knowledgeApi.bulkImportFAQs(file, {
        generate_embeddings: true,
        skip_duplicates: true,
        send_to_validation: true,
      });
      setValidation(result);
      setStep(3);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validation) return;
    setImporting(true);
    setStep(4);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
            onClose();
          }, 1000);
          return 100;
        }
        return p + 2;
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Bulk Import FAQs</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 1: Upload File
                </h3>
                <div
                  className="
                    border-2 border-dashed border-gray-300 rounded-lg p-12
                    text-center hover:border-indigo-400 transition-colors cursor-pointer
                  "
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {importing ? (
                    <div className="py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-600">Parsing file...</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Drop CSV or JSON file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported: .csv, .json
                      </p>
                      {parseError && (
                        <p className="text-sm text-red-600 mt-2">{parseError}</p>
                      )}
                    </>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={importing}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <Download size={16} />
                  Download Template: CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <Download size={16} />
                  Download Template: JSON
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 2: Map Columns
                </h3>
                <div className="space-y-3">
                  {/* Question Mapping */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Column
                      </label>
                      <select
                        value={columnMapping.question || ''}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, question: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select column...</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FAQ Field *
                      </label>
                      <input
                        type="text"
                        value="Question"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Answer Mapping */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Column
                      </label>
                      <select
                        value={columnMapping.answer || ''}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, answer: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select column...</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FAQ Field *
                      </label>
                      <input
                        type="text"
                        value="Answer"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Category Mapping (Optional) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Column (Optional)
                      </label>
                      <select
                        value={columnMapping.category || ''}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">None</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FAQ Field
                      </label>
                      <input
                        type="text"
                        value="Category"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Preview (first 5 rows)
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Question
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Answer
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Category
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {preview.map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">
                              {columnMapping.question ? row[columnMapping.question] || '(empty)' : '-'}
                            </td>
                            <td className="px-3 py-2">
                              {columnMapping.answer ? row[columnMapping.answer] || '(empty)' : '-'}
                            </td>
                            <td className="px-3 py-2">
                              {columnMapping.category ? row[columnMapping.category] || '-' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setStep(1);
                      setParseError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleValidate}
                    disabled={!columnMapping.question || !columnMapping.answer}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Validate & Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && validation && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 3: Validation Results
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span className="text-emerald-700 font-medium">
                      {validation.imported} valid rows ready to import
                    </span>
                  </div>
                  {validation.warnings && validation.warnings.length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle size={20} className="text-amber-600" />
                      <span className="text-amber-700">
                        {validation.warnings.length} rows with warnings
                      </span>
                    </div>
                  )}
                  {validation.errors && validation.errors.length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle size={20} className="text-red-600" />
                      <span className="text-red-700">
                        {validation.errors.length} rows with errors (will be skipped)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-gray-700">
                      Generate embeddings after import
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-gray-700">
                      Skip duplicates (match by question text)
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-gray-700">
                      Send to validation queue
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Import {validation.imported} FAQs
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 4: Importing FAQs...
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {progress}% complete
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

