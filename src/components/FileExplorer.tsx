import React, { useState } from 'react';
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon, DownloadIcon, PlusIcon, TrashIcon, FileTextIcon, FileImageIcon, FileAudioIcon, FileVideoIcon, StarIcon, CalendarIcon, MoreHorizontalIcon, FolderPlusIcon, XIcon } from 'lucide-react';
export const FileExplorer = ({
  isPersonal = false
}) => {
  const [expandedFolders, setExpandedFolders] = useState({
    recordings: true,
    transcripts: true,
    presentations: false,
    reports: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const getFileIcon = fileName => {
    if (fileName.endsWith('.txt') || fileName.endsWith('.pdf')) {
      return <FileTextIcon size={16} className="text-blue-500" />;
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) {
      return <FileImageIcon size={16} className="text-green-500" />;
    } else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav')) {
      return <FileAudioIcon size={16} className="text-yellow-500" />;
    } else if (fileName.endsWith('.mp4') || fileName.endsWith('.avi')) {
      return <FileVideoIcon size={16} className="text-red-500" />;
    } else {
      return <FileIcon size={16} className="text-gray-500" />;
    }
  };
  const toggleFolder = folder => {
    setExpandedFolders({
      ...expandedFolders,
      [folder]: !expandedFolders[folder]
    });
  };
  const handleFileClick = file => {
    setSelectedFile(file);
  };
  const handleFileAction = (file, action) => {
    setShowDropdown(null);
    if (action === 'download') {
      // Simulate file download
      alert(`Downloading ${file.name}`);
    } else if (action === 'delete') {
      // Simulate file deletion
      alert(`Deleting ${file.name}`);
    } else if (action === 'star') {
      // Simulate starring a file
      alert(`Marking ${file.name} as favorite`);
    }
  };
  const toggleDropdown = fileId => {
    if (showDropdown === fileId) {
      setShowDropdown(null);
    } else {
      setShowDropdown(fileId);
    }
  };
  // Sample file structure
  const fileStructure = {
    recordings: [{
      id: 1,
      name: 'team-meeting-2023-06-15.mp4',
      size: '45.2 MB',
      date: '2023-06-15',
      type: 'video'
    }, {
      id: 2,
      name: 'client-presentation-2023-06-10.mp4',
      size: '32.7 MB',
      date: '2023-06-10',
      type: 'video'
    }, {
      id: 3,
      name: 'product-demo-2023-06-05.mp4',
      size: '28.4 MB',
      date: '2023-06-05',
      type: 'video'
    }],
    transcripts: [{
      id: 4,
      name: 'team-meeting-transcript-2023-06-15.txt',
      size: '24 KB',
      date: '2023-06-15',
      type: 'text'
    }, {
      id: 5,
      name: 'client-presentation-transcript-2023-06-10.txt',
      size: '18 KB',
      date: '2023-06-10',
      type: 'text'
    }, {
      id: 6,
      name: 'product-demo-transcript-2023-06-05.txt',
      size: '15 KB',
      date: '2023-06-05',
      type: 'text'
    }],
    presentations: [{
      id: 7,
      name: 'quarterly-review.pdf',
      size: '3.2 MB',
      date: '2023-06-01',
      type: 'document'
    }, {
      id: 8,
      name: 'marketing-strategy.pdf',
      size: '2.8 MB',
      date: '2023-05-20',
      type: 'document'
    }],
    reports: [{
      id: 9,
      name: 'analytics-report-may.pdf',
      size: '1.8 MB',
      date: '2023-06-02',
      type: 'document'
    }, {
      id: 10,
      name: 'user-feedback-summary.txt',
      size: '45 KB',
      date: '2023-05-28',
      type: 'text'
    }]
  };
  return <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-medium">
          {isPersonal ? 'My Files' : 'Shared Files'}
        </h2>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center text-sm">
            <FolderPlusIcon size={16} className="mr-1" />
            New Folder
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center text-sm">
            <PlusIcon size={16} className="mr-1" />
            Upload
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Folders sidebar */}
        <div className="w-1/4 border-r border-gray-200 overflow-y-auto p-2 bg-gray-50">
          <div className="space-y-1">
            {Object.keys(fileStructure).map(folder => <div key={folder} className="select-none">
                <div className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => toggleFolder(folder)}>
                  {expandedFolders[folder] ? <ChevronDownIcon size={16} className="text-gray-500 mr-1" /> : <ChevronRightIcon size={16} className="text-gray-500 mr-1" />}
                  <FolderIcon size={16} className={`mr-2 ${expandedFolders[folder] ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="text-sm capitalize">{folder}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {fileStructure[folder].length}
                  </span>
                </div>
              </div>)}
          </div>
        </div>
        {/* Files list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {Object.keys(fileStructure).map(folder => <div key={folder} className={`mb-4 ${!expandedFolders[folder] && 'hidden'}`}>
                <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {folder}
                </h3>
                <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2 text-xs font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500">
                          Size
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500">
                          Date
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileStructure[folder].map(file => <tr key={file.id} className={`border-t border-gray-100 hover:bg-gray-50 ${selectedFile?.id === file.id ? 'bg-blue-50' : ''}`} onClick={() => handleFileClick(file)}>
                          <td className="px-4 py-3 flex items-center">
                            {getFileIcon(file.name)}
                            <span className="ml-2 text-sm">{file.name}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {file.size}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {file.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2 relative">
                              <button className="p-1 text-gray-500 hover:bg-gray-100 rounded" onClick={e => {
                          e.stopPropagation();
                          handleFileAction(file, 'download');
                        }}>
                                <DownloadIcon size={16} />
                              </button>
                              <button className="p-1 text-gray-500 hover:bg-gray-100 rounded" onClick={e => {
                          e.stopPropagation();
                          toggleDropdown(file.id);
                        }}>
                                <MoreHorizontalIcon size={16} />
                              </button>
                              {showDropdown === file.id && <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md z-10 w-40 py-1 border border-gray-200">
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center" onClick={e => {
                            e.stopPropagation();
                            handleFileAction(file, 'star');
                          }}>
                                    <StarIcon size={14} className="mr-2" />
                                    Add to favorites
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center" onClick={e => {
                            e.stopPropagation();
                            handleFileAction(file, 'delete');
                          }}>
                                    <TrashIcon size={14} className="mr-2" />
                                    Delete
                                  </button>
                                </div>}
                            </div>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>)}
          </div>
        </div>
        {/* File preview (if a file is selected) */}
        {selectedFile && <div className="w-1/3 border-l border-gray-200 p-4 bg-gray-50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">File Details</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedFile(null)}>
                  <XIcon size={18} />
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex-1">
                <div className="flex justify-center mb-4 p-8 bg-gray-50 rounded-md">
                  {selectedFile.type === 'video' ? <FileVideoIcon size={64} className="text-red-500" /> : selectedFile.type === 'text' ? <FileTextIcon size={64} className="text-blue-500" /> : <FileIcon size={64} className="text-gray-500" />}
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="text-sm">{selectedFile.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Size</h4>
                    <p className="text-sm">{selectedFile.size}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="text-sm">{selectedFile.date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Type</h4>
                    <p className="text-sm capitalize">{selectedFile.type}</p>
                  </div>
                </div>
                <div className="mt-6 flex space-x-2">
                  <button className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm flex items-center" onClick={() => handleFileAction(selectedFile, 'download')}>
                    <DownloadIcon size={14} className="mr-2" />
                    Download
                  </button>
                  <button className="px-3 py-2 bg-red-500 text-white rounded-md text-sm flex items-center" onClick={() => handleFileAction(selectedFile, 'delete')}>
                    <TrashIcon size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};