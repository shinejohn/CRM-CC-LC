import React, { useState } from 'react';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ServiceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  type: 'add' | 'edit' | 'delete';
  title: string;
}
export function ServiceActionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  type,
  title
}: ServiceActionModalProps) {
  const [formData, setFormData] = useState(initialData || {});
  if (!isOpen) return null;
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div initial={{
          scale: 0.95,
          opacity: 0,
          y: 20
        }} animate={{
          scale: 1,
          opacity: 1,
          y: 0
        }} exit={{
          scale: 0.95,
          opacity: 0,
          y: 20
        }} className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {type === 'delete' ? <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Are you sure?</p>
                      <p className="text-gray-500 text-sm mt-1">
                        This action cannot be undone. This will permanently
                        delete this item.
                      </p>
                    </div>
                  </div> : <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title / Name
                      </label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter title..." defaultValue={initialData?.title} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description / Content
                      </label>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]" placeholder="Enter details..." defaultValue={initialData?.description} />
                    </div>
                    {type === 'edit' && <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                          Changes will be reflected immediately in the service
                          dashboard.
                        </p>
                      </div>}
                  </div>}
              </div>

              <div className="p-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => {
              onSave(formData);
              onClose();
            }} className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 ${type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {type === 'delete' ? <>
                      <Trash2 className="w-4 h-4" /> Delete
                    </> : <>
                      <Save className="w-4 h-4" />{' '}
                      {type === 'add' ? 'Create' : 'Save Changes'}
                    </>}
                </button>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}