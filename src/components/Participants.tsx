import React, { useState } from 'react';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, HandIcon, MoreVerticalIcon, UserMinusIcon } from 'lucide-react';
export const Participants = ({
  participants
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [participantStates, setParticipantStates] = useState(participants.reduce((acc, p) => ({
    ...acc,
    [p.id]: {
      isMuted: Math.random() > 0.5,
      isVideoOff: false,
      hasHandRaised: false
    }
  }), {}));
  const showAsList = participants.length > 3;
  const toggleMenu = id => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const toggleMute = id => {
    setParticipantStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMuted: !prev[id].isMuted
      }
    }));
    setOpenMenuId(null);
  };
  const toggleVideo = id => {
    setParticipantStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVideoOff: !prev[id].isVideoOff
      }
    }));
    setOpenMenuId(null);
  };
  const toggleHand = id => {
    setParticipantStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        hasHandRaised: !prev[id].hasHandRaised
      }
    }));
    setOpenMenuId(null);
  };
  const removeParticipant = id => {
    // In real app, this would remove the participant
    console.log('Remove participant:', id);
    setOpenMenuId(null);
  };
  if (showAsList) {
    return <div className="p-2 space-y-2">
        {participants.map(participant => {
        const state = participantStates[participant.id];
        return <div key={participant.id} className="bg-white rounded-lg shadow-sm p-2 flex items-center hover:shadow-md transition-shadow relative">
              <div className="relative">
                <img src={participant.image} alt={participant.name} className="w-10 h-10 rounded-md object-cover" />
                <div className="absolute bottom-0 right-0 bg-green-500 w-2 h-2 rounded-full border-2 border-white"></div>
                {state.hasHandRaised && <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                    <HandIcon size={10} className="text-white" />
                  </div>}
              </div>
              <div className="ml-2 flex-1">
                <p className="font-medium text-xs">{participant.name}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="flex items-center space-x-1">
                {state.isMuted ? <MicOffIcon size={14} className="text-red-500" /> : <MicIcon size={14} className="text-gray-600" />}
                {state.isVideoOff && <VideoOffIcon size={14} className="text-red-500" />}
                <button onClick={() => toggleMenu(participant.id)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVerticalIcon size={14} className="text-gray-600" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === participant.id && <div className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-40">
                  <button onClick={() => toggleMute(participant.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors">
                    {state.isMuted ? <MicIcon size={14} className="mr-2" /> : <MicOffIcon size={14} className="mr-2" />}
                    {state.isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button onClick={() => toggleVideo(participant.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors">
                    {state.isVideoOff ? <VideoIcon size={14} className="mr-2" /> : <VideoOffIcon size={14} className="mr-2" />}
                    {state.isVideoOff ? 'Turn on video' : 'Turn off video'}
                  </button>
                  <button onClick={() => toggleHand(participant.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors">
                    <HandIcon size={14} className="mr-2" />
                    {state.hasHandRaised ? 'Lower hand' : 'Raise hand'}
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button onClick={() => removeParticipant(participant.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center transition-colors rounded-b-lg">
                    <UserMinusIcon size={14} className="mr-2" />
                    Remove
                  </button>
                </div>}
            </div>;
      })}
      </div>;
  }
  // Grid view for 3 or fewer participants
  return <div className="p-2 grid grid-cols-1 gap-2">
      {participants.map(participant => {
      const state = participantStates[participant.id];
      return <div key={participant.id} className="bg-gray-900 rounded-lg overflow-hidden relative aspect-video group">
            <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              {participant.name}
              {state.hasHandRaised && <HandIcon size={12} className="ml-1 text-yellow-400" />}
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              {state.isMuted ? <div className="bg-red-500 bg-opacity-90 p-1 rounded">
                  <MicOffIcon size={14} className="text-white" />
                </div> : <div className="bg-black bg-opacity-60 p-1 rounded">
                  <MicIcon size={14} className="text-white" />
                </div>}
              {state.isVideoOff && <div className="bg-red-500 bg-opacity-90 p-1 rounded">
                  <VideoOffIcon size={14} className="text-white" />
                </div>}
            </div>

            {/* Controls overlay - shows on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button onClick={() => toggleMute(participant.id)} className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all" title={state.isMuted ? 'Unmute' : 'Mute'}>
                  {state.isMuted ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
                </button>
                <button onClick={() => toggleVideo(participant.id)} className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all" title={state.isVideoOff ? 'Turn on video' : 'Turn off video'}>
                  {state.isVideoOff ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
                </button>
                <button onClick={() => toggleHand(participant.id)} className={`p-2 rounded-full hover:bg-opacity-100 transition-all ${state.hasHandRaised ? 'bg-yellow-400 bg-opacity-90' : 'bg-white bg-opacity-90'}`} title={state.hasHandRaised ? 'Lower hand' : 'Raise hand'}>
                  <HandIcon size={16} className={state.hasHandRaised ? 'text-white' : 'text-gray-800'} />
                </button>
              </div>
            </div>
          </div>;
    })}
    </div>;
};