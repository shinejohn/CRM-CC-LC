import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';
import { useBusinessMode } from '../contexts/BusinessModeContext';
export function BulkCustomerImportPage({
  onBack
}: {
  onBack: () => void;
}) {
  const {
    terminology
  } = useBusinessMode();
  const [importMethod, setImportMethod] = useState<'traditional' | 'ai'>('traditional');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate file processing
      setTimeout(() => {
        setPreviewData([{
          name: 'John Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          status: 'valid'
        }, {
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          phone: '(555) 234-5678',
          status: 'valid'
        }, {
          name: 'Mike Johnson',
          email: 'invalid-email',
          phone: '(555) 345-6789',
          status: 'error'
        }]);
        setShowPreview(true);
      }, 1500);
    }
  };
  const handleAiImport = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setPreviewData([{
        name: 'John Smith',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        status: 'valid'
      }, {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        phone: '(555) 234-5678',
        status: 'valid'
      }]);
      setShowPreview(true);
      setIsProcessing(false);
    }, 2000);
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {terminology.customers}
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          📥 Bulk Import {terminology.customers}
        </h1>
        <p className="text-slate-500 mt-1">
          Import multiple {terminology.customers.toLowerCase()} at once using
          CSV/Excel or AI
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => setImportMethod('traditional')} className={`p-6 rounded-xl border-2 transition-all ${importMethod === 'traditional' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${importMethod === 'traditional' ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <FileSpreadsheet className={`w-6 h-6 ${importMethod === 'traditional' ? 'text-blue-600' : 'text-slate-600'}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 mb-1">
                Traditional Upload
              </h3>
              <p className="text-sm text-slate-600">
                Upload CSV or Excel files with customer data. We'll validate and
                import the records.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-3 h-3" /> Supports CSV, XLS, XLSX
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => setImportMethod('ai')} className={`p-6 rounded-xl border-2 transition-all ${importMethod === 'ai' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${importMethod === 'ai' ? 'bg-purple-100' : 'bg-slate-100'}`}>
              <Sparkles className={`w-6 h-6 ${importMethod === 'ai' ? 'text-purple-600' : 'text-slate-600'}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                AI-Powered Import
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  NEW
                </span>
              </h3>
              <p className="text-sm text-slate-600">
                Paste any customer data and let AI organize and structure it
                automatically.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3 h-3" /> Smart field detection
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Traditional Upload */}
      <AnimatePresence mode="wait">
        {importMethod === 'traditional' && <motion.div key="traditional" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                Step 1: Download Template
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Start with our template to ensure your data is formatted
                correctly.
              </p>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Download CSV Template
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                Step 2: Upload Your File
              </h3>

              {!uploadedFile ? <label className="block">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-700 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-500">
                      CSV, XLS, or XLSX (max 10MB)
                    </p>
                  </div>
                  <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileUpload} className="hidden" />
                </label> : <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button onClick={() => {
              setUploadedFile(null);
              setShowPreview(false);
            }} className="text-slate-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>}
            </div>
          </motion.div>}

        {/* AI Import */}
        {importMethod === 'ai' && <motion.div key="ai" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">
                    How AI Import Works
                  </h3>
                  <p className="text-sm text-purple-700">
                    Simply paste your customer data in any format - from
                    spreadsheets, emails, notes, or lists. Our AI will
                    automatically detect and organize the information into the
                    correct fields.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="font-bold text-purple-900 mb-1">
                    ✓ Detects Names
                  </p>
                  <p className="text-purple-700">First, last, or full names</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="font-bold text-purple-900 mb-1">
                    ✓ Finds Contact Info
                  </p>
                  <p className="text-purple-700">Emails, phones, addresses</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="font-bold text-purple-900 mb-1">
                    ✓ Handles Any Format
                  </p>
                  <p className="text-purple-700">Tables, lists, paragraphs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                Paste Your Customer Data
              </h3>
              <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Example:&#10;&#10;John Smith - john@example.com - (555) 123-4567&#10;Sarah Chen, sarah@example.com, 555-234-5678&#10;Mike Johnson | mike@example.com | 555.345.6789&#10;&#10;Or paste from Excel, Google Sheets, or any other source..." className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono text-sm resize-none" />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500">
                  {aiInput.length > 0 ? `${aiInput.split('\n').filter(line => line.trim()).length} lines detected` : 'Paste your data above'}
                </p>
                <button onClick={handleAiImport} disabled={!aiInput.trim() || isProcessing} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </> : <>
                      <Sparkles className="w-4 h-4" /> Process with AI
                    </>}
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Preview & Validation */}
      <AnimatePresence>
        {showPreview && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                    Preview & Validation
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Review the imported data before adding to your database
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Ready to import</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {previewData.filter(d => d.status === 'valid').length}
                    </p>
                  </div>
                  {previewData.some(d => d.status === 'error') && <div className="text-right">
                      <p className="text-sm text-slate-500">Errors</p>
                      <p className="text-2xl font-bold text-red-600">
                        {previewData.filter(d => d.status === 'error').length}
                      </p>
                    </div>}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((row, i) => <tr key={i} className={row.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4">
                        {row.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {row.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {row.phone}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.status === 'error' && <button className="text-xs font-medium text-blue-600 hover:underline">
                            Fix
                          </button>}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-slate-600">
                    Send welcome emails
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-slate-600">
                    Add to marketing list
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Import{' '}
                  {previewData.filter(d => d.status === 'valid').length}{' '}
                  {terminology.customers}
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}