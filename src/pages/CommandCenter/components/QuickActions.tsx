import React from 'react';
import { Link } from 'react-router';
import { FileText, Megaphone, Calendar } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Link
        to="/command-center/content/create"
        className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Create Content</h3>
            <p className="text-sm text-gray-500">Generate articles, blogs, social posts</p>
          </div>
          <FileText className="h-8 w-8 text-indigo-600" />
        </div>
      </Link>
      <Link
        to="/command-center/ads/create"
        className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Create Ad</h3>
            <p className="text-sm text-gray-500">Generate ads for all platforms</p>
          </div>
          <Megaphone className="h-8 w-8 text-blue-600" />
        </div>
      </Link>
      <Link
        to="/command-center/publishing/calendar"
        className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Publishing Calendar</h3>
            <p className="text-sm text-gray-500">View scheduled content and ads</p>
          </div>
          <Calendar className="h-8 w-8 text-green-600" />
        </div>
      </Link>
    </div>
  );
};
