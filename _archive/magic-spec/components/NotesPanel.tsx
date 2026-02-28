import React, { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
interface NoteItem {
  category: string;
  items: string[];
}
interface NotesPanelProps {
  notes: NoteItem[];
}
export const NotesPanel = ({
  notes
}: NotesPanelProps) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  return <div className="h-full flex flex-col">
      <div className="p-3 bg-gray-200 font-medium flex justify-between items-center">
        <span>Meeting Notes</span>
        <button onClick={() => setIsAddingCategory(true)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <PlusIcon size={16} className="mr-1" /> Add Category
        </button>
      </div>

      {isAddingCategory && <div className="p-3 bg-blue-50 flex items-center">
          <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm" placeholder="New category name" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <button className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => {
        setIsAddingCategory(false);
        setNewCategory('');
      }}>
            Add
          </button>
          <button className="ml-2 text-gray-500" onClick={() => {
        setIsAddingCategory(false);
        setNewCategory('');
      }}>
            <XIcon size={16} />
          </button>
        </div>}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {notes.map((note, index) => <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 font-medium border-b border-gray-200">
              {note.category}
            </div>
            <ul className="p-3 space-y-2">
              {note.items.map((item, itemIndex) => <li key={itemIndex} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                  <span className="text-sm">{item}</span>
                </li>)}
              <li className="pt-2">
                <button className="text-blue-500 text-sm flex items-center">
                  <PlusIcon size={16} className="mr-1" /> Add item
                </button>
              </li>
            </ul>
          </div>)}
      </div>
    </div>;
};