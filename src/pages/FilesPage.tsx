import React, { useState } from 'react';
import { FileExplorer } from '../components/FileExplorer';
import { NavigationMenu } from '../components/NavigationMenu';
import { FolderIcon, FolderOpenIcon, SearchIcon, FilterIcon, SortAscIcon, GridIcon, ListIcon } from 'lucide-react';
export const FilesPage = () => {
  const [activeTab, setActiveTab] = useState('my-files');
  const [searchQuery, setSearchQuery] = useState('');
  return <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Files & Documents</h1>
        <div className="flex space-x-2 items-center">
          <div className="relative">
            <input type="text" placeholder="Search files..." className="px-3 py-1 pl-8 bg-gray-700 rounded-md text-white placeholder-gray-400 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <SearchIcon size={16} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
          <NavigationMenu />
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-files' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('my-files')}>
              <div className="flex items-center">
                <FolderIcon size={16} className="mr-2" />
                My Files
              </div>
            </button>
            <button className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'shared' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab('shared')}>
              <div className="flex items-center">
                <FolderOpenIcon size={16} className="mr-2" />
                Shared with Me
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4 max-w-7xl mx-auto w-full">
        {/* Filters and View Options */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button className="flex items-center text-sm text-gray-600 px-3 py-1.5 bg-white border border-gray-300 rounded-md">
                <FilterIcon size={14} className="mr-2" />
                Filter
              </button>
            </div>
            <div className="flex items-center">
              <button className="flex items-center text-sm text-gray-600 px-3 py-1.5 bg-white border border-gray-300 rounded-md">
                <SortAscIcon size={14} className="mr-2" />
                Sort
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 bg-white border border-gray-300 rounded-md">
              <GridIcon size={16} />
            </button>
            <button className="p-2 text-gray-600 bg-white border border-gray-300 rounded-md">
              <ListIcon size={16} />
            </button>
          </div>
        </div>
        {/* File Explorer */}
        <div className="h-[calc(100vh-200px)]">
          <FileExplorer isPersonal={activeTab === 'my-files'} />
        </div>
      </div>
    </div>;
};