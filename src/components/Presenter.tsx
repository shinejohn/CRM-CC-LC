import React from 'react';
import { UserIcon } from 'lucide-react';
export const Presenter = ({
  isVideoOff
}) => {
  return <div className="bg-gray-900 rounded-lg overflow-hidden flex-1 flex items-center justify-center relative">
      {isVideoOff ? <div className="flex flex-col items-center justify-center text-white">
          <div className="bg-gray-700 p-6 rounded-full mb-2">
            <UserIcon size={64} />
          </div>
          <p className="text-lg font-medium">AI Presenter</p>
        </div> : <>
          <img src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="AI Presenter" className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded text-white text-sm font-medium flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            AI Presenter
          </div>
        </>}
    </div>;
};