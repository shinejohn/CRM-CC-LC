import React, { useState, useEffect } from 'react';
import { SparklesIcon, CheckCircleIcon, ClockIcon, PlusCircleIcon, HeartIcon } from 'lucide-react';
import { VoiceControls } from '../components/VoiceControls';
interface AIModeHubProps {
  onNavigate: (path: string) => void;
  /** When in customer context, pass for AI to use full business profile */
  customerId?: string | null;
}
interface Message {
  sender: string;
  text: string;
  isAI: boolean;
}
interface AIEmployee {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  status: 'free' | 'paid';
  price?: string;
  accentColor: string;
}
export const AIModeHub = ({
  onNavigate,
  customerId,
}: AIModeHubProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    sender: 'Jessica',
    text: 'Welcome to your AI Team! Leonard, Sara, and David are free and part of your team for life. Leonard will train everyone and get them loving our system! The others can help take your business to the next level. Would you like me to introduce everyone?',
    isAI: true
  }]);
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };
  const [personalityId, setPersonalityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    fetch(`${API_BASE}/personalities`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data ?? data ?? [];
        const p = Array.isArray(list) ? list.find((x: { is_active?: boolean }) => x.is_active !== false) ?? list[0] : null;
        if (p?.id) setPersonalityId(p.id);
      })
      .catch(() => {});
  }, []);

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || isLoading) return;

    addMessage({ sender: 'You', text, isAI: false });
    setMessageInput('');
    setIsLoading(true);

    const pid = personalityId;
    if (!pid) {
      addMessage({ sender: 'Jessica', text: 'AI is not configured. Please set up personalities in settings.', isAI: true });
      setIsLoading(false);
      return;
    }

    try {
      const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const convCtx = [...messages, { sender: 'You', text, isAI: false }].slice(-10).map((m: { sender?: string; text: string; isAI?: boolean }) => ({ role: m.isAI ? 'assistant' : 'user', content: m.text }));
      const body: Record<string, unknown> = { message: text, conversation_context: convCtx };
      if (customerId) body.customer_id = customerId;
      const res = await fetch(`${API_BASE}/personalities/${pid}/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const responseText = data?.data?.response ?? data?.response ?? 'Sorry, I could not get a response.';
      addMessage({ sender: 'Jessica', text: responseText, isAI: true });
    } catch {
      addMessage({ sender: 'Jessica', text: 'Sorry, I could not get a response. Please try again.', isAI: true });
    } finally {
      setIsLoading(false);
    }
  };
  const [aiEmployeesFromApi, setAiEmployeesFromApi] = useState<AIEmployee[]>([]);

  useEffect(() => {
    const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    fetch(`${API_BASE}/personalities`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data ?? data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          setAiEmployeesFromApi(
            list.map((p: { id: string; name?: string; identity?: string; description?: string; persona_description?: string }) => ({
              id: p.id,
              name: p.identity ?? p.name ?? 'AI Assistant',
              title: p.persona_description?.split('.')[0] ?? 'AI Employee',
              description: p.description ?? p.persona_description ?? '',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.identity ?? p.name ?? 'AI')}&background=6366f1&color=fff`,
              status: 'free' as const,
              accentColor: 'indigo',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const aiEmployees: AIEmployee[] = aiEmployeesFromApi.length > 0 ? aiEmployeesFromApi : [{
    id: 'leonard',
    name: 'Leonard',
    title: 'Learning Coordinator',
    description: 'Trains your team and gets them loving our system. Creates easy-to-follow guides and makes sure everyone succeeds.',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'free',
    accentColor: 'indigo'
  }, {
    id: 'david',
    name: 'David',
    title: 'Business Strategist',
    description: 'Analyzes your market, suggests campaigns, and creates marketing plans tailored to your business goals.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'free',
    accentColor: 'purple'
  }, {
    id: 'sara',
    name: 'Sara',
    title: 'Content Platform Specialist',
    description: 'Helps you leverage the entire community! Manages your content strategy and maximizes engagement across all platforms.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'free',
    accentColor: 'violet'
  }, {
    id: 'marcus',
    name: 'Marcus',
    title: 'Social Media Manager',
    description: 'Creates and distributes content across social media platforms. Keeps your business visible and engaging with your community.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$79/month',
    accentColor: 'orange'
  }, {
    id: 'steve',
    name: 'Steve',
    title: 'Inside Sales',
    description: 'Manages inbound leads, qualifies prospects, and nurtures relationships to close deals from your existing pipeline.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$99/month',
    accentColor: 'sky'
  }, {
    id: 'clara',
    name: 'Clara',
    title: 'Outbound Sales',
    description: 'Proactively reaches out to potential customers, generates new leads, and expands your sales opportunities.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$99/month',
    accentColor: 'rose'
  }, {
    id: 'elena',
    name: 'Elena',
    title: 'Community Outreach Specialist',
    description: 'Reaches out to your community via email, SMS, and calls. Builds relationships and drives engagement.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$49/month',
    accentColor: 'pink'
  }, {
    id: 'mia',
    name: 'Mia',
    title: 'Receptionist',
    description: "Answers calls, handles customer inquiries, and provides professional phone support when you can't.",
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$39/month',
    accentColor: 'blue'
  }, {
    id: 'sophia',
    name: 'Sophia',
    title: 'Appointment Coordinator',
    description: 'Schedules appointments, sends confirmations, and manages your calendar to keep your business running smoothly.',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$39/month',
    accentColor: 'teal'
  }, {
    id: 'james',
    name: 'James',
    title: 'Analytics Manager',
    description: "Tracks your performance across all platforms, generates reports, and surfaces insights you'd miss.",
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$29/month',
    accentColor: 'green'
  }, {
    id: 'rachel',
    name: 'Rachel',
    title: 'Dispatcher',
    description: 'Coordinates service calls, manages technician schedules, and ensures efficient routing for your field team.',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$49/month',
    accentColor: 'red'
  }, {
    id: 'carlos',
    name: 'Carlos',
    title: 'Confirmation Specialist',
    description: 'Sends appointment reminders, confirms bookings, and reduces no-shows with timely follow-ups.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
    status: 'paid',
    price: '$34/month',
    accentColor: 'yellow'
  }];
  const getStatusBadge = (status: string) => {
    if (status === 'free') {
      return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <HeartIcon size={16} className="mr-1.5 fill-current" />
          FREE - Part of Your Team for Life!
        </span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <PlusCircleIcon size={16} className="mr-1.5" />
          Add to Team
        </span>;
    }
  };
  const getButtonStyle = (status: string) => {
    if (status === 'free') {
      return 'bg-green-600 text-white hover:bg-green-700';
    } else {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };
  const getButtonText = (status: string, name: string) => {
    if (status === 'free') {
      return 'Start Working with ' + name;
    } else {
      return 'Add ' + name + ' to Team';
    }
  };
  const freeCount = aiEmployees.filter(e => e.status === 'free').length;
  const paidCount = aiEmployees.filter(e => e.status === 'paid').length;
  return <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your AI Team
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Meet the AI employees ready to help grow your business
          </p>
          <p className="text-sm text-gray-500">
            {freeCount} AI employees free for life (including your trainer!) •{' '}
            {paidCount} available to add
          </p>
        </div>

        {/* AI Team Grid */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
            {aiEmployees.map(employee => <div key={employee.id} className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-xl transition-all flex flex-col items-center text-center ${employee.status === 'free' ? 'border-green-200 hover:border-green-400' : 'border-gray-200 hover:border-blue-300'}`}>
                {/* Avatar with Status Indicator */}
                <div className="relative mb-4">
                  <img src={employee.avatar} alt={employee.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white shadow-md ${employee.status === 'free' ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>

                {/* Name and Title - BIGGER */}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {employee.name}
                </h3>
                <p className="text-base font-semibold text-gray-600 mb-4">
                  {employee.title}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                  {employee.description}
                </p>

                {/* Status Badge */}
                <div className="mb-4">{getStatusBadge(employee.status)}</div>

                {/* Action Button */}
                <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${getButtonStyle(employee.status)}`}>
                  {getButtonText(employee.status, employee.name)}
                </button>

                {/* Price (for paid employees) */}
                {employee.price && <p className="text-sm font-medium text-gray-600 mt-3">
                    {employee.price}
                  </p>}
              </div>)}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white border-t border-gray-200 px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Meet Your Team
              </h3>
              <p className="text-sm text-gray-600">
                Each AI employee has their own personality and expertise
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Give Direction
              </h3>
              <p className="text-sm text-gray-600">
                Tell them what you need in plain English
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Watch Them Work
              </h3>
              <p className="text-sm text-gray-600">
                They handle the tasks while you focus on your business
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-gray-50 px-8 py-8 mb-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-700 italic mb-3 text-base">
              "Leonard made it so easy to get started - he trained my whole team
              in a day! Then Sara and David took over and now my marketing runs
              itself. Best investment I've made."
            </p>
            <p className="text-sm text-gray-500 font-medium">
              — Local Restaurant Owner
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - AI Account Manager (Jessica) */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Jessica's Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-center text-center mb-4">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=500&q=80" alt="Jessica - AI Account Manager" className="w-44 h-56 rounded-xl object-cover mb-4 shadow-md" />
            <div className="flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Hi, I'm Jessica!
            </h3>
            <p className="text-sm text-gray-600 mb-2">AI Account Manager</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Your Guide
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => <div key={index} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.isAI ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>)}

          {/* Quick Response Buttons */}
          {messages.length === 1 && <div className="space-y-2 mt-4">
              <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Yes, introduce everyone
              </button>
              <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Tell me about the free team members
              </button>
              <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                What can the paid team do?
              </button>
            </div>}
        </div>

        {/* Voice Controls */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <VoiceControls isListening={isListening} setIsListening={setIsListening} onTranscriptUpdate={handleTranscriptUpdate} transcript={transcript} setTranscript={setTranscript} addMessage={addMessage} />
        </div>

        {/* Quick Start Section */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-medium mb-3">
            Quick Start
          </p>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
              <SparklesIcon size={16} className="mr-2" />
              Start with free team members
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
              <CheckCircleIcon size={16} className="mr-2" />
              See what's included
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
              <PlusCircleIcon size={16} className="mr-2" />
              Explore paid options
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input type="text" placeholder="Type a message..." value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-transparent text-sm focus:outline-none" />
            <button onClick={handleSendMessage} className="ml-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </div>;
};