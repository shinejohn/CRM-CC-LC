import React, { useEffect, useState, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, Maximize, MessageSquare, BookOpen, CheckCircle, Clock, TrendingUp, Sparkles, Send } from 'lucide-react';
interface LearningTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  views: number;
  completionRate: number;
  tags: string[];
  sections: LessonSection[];
  relatedTopics: string[];
}
interface LessonSection {
  id: string;
  title: string;
  duration: string;
  content: string;
}
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
// Mock data commented out - wire to GET /v1/content/{slug} API
const LEARNING_TOPICS: Record<string, LearningTopic> = {};
const RELATED_TOPICS_DATA: Record<string, { id: string; title: string; thumbnail: string; duration: string }> = {};
interface LearningLessonPageProps {
  topicId: string;
  onBack: () => void;
  onNavigateToTopic: (topicId: string) => void;
}
export function LearningLessonPage({
  topicId,
  onBack,
  onNavigateToTopic
}: LearningLessonPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topic = LEARNING_TOPICS[topicId];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  if (!topic) {
    return <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Topic not found
          </h2>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
            Return to Learning Center
          </button>
        </div>
      </div>;
  }
  const currentSectionData = topic.sections[currentSection];
  const relatedTopics = topic.relatedTopics.map(id => RELATED_TOPICS_DATA[id]).filter(Boolean);
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAITyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Great question about "${inputValue}"! Let me help clarify that. ${currentSectionData.title} covers this in detail. The key point is that AI can automate this process while maintaining quality and personalization.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    }, 2000);
  };
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-600 font-medium">
                  {topic.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">{topic.duration}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                {topic.title}
              </h1>
            </div>
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setShowChat(!showChat)} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${showChat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <MessageSquare size={18} />
              Ask Questions
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lesson Area */}
        <div className="flex-1 flex flex-col">
          {/* Video/Presentation Area */}
          <div className="bg-slate-900 aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8 max-w-3xl">
                <motion.div key={currentSection} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="text-blue-400" size={24} />
                    <span className="text-sm font-medium text-blue-400">
                      AI Instructor
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {currentSectionData.title}
                  </h2>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {currentSectionData.content}
                  </p>
                </motion.div>

                {!isPlaying && <motion.button whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }} onClick={() => setIsPlaying(true)} className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xl">
                    <Play size={32} className="text-white ml-1" />
                  </motion.button>}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0} className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30">
                    <SkipBack size={20} />
                  </motion.button>
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </motion.button>
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} onClick={() => setCurrentSection(Math.min(topic.sections.length - 1, currentSection + 1))} disabled={currentSection === topic.sections.length - 1} className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30">
                    <SkipForward size={20} />
                  </motion.button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    Section {currentSection + 1} of {topic.sections.length}
                  </span>
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Volume2 size={20} />
                  </motion.button>
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Maximize size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="bg-white border-t border-slate-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-slate-900 mb-4">
              Lesson Sections
            </h3>
            <div className="space-y-2">
              {topic.sections.map((section, index) => <motion.button key={section.id} whileHover={{
              x: 4
            }} onClick={() => setCurrentSection(index)} className={`w-full text-left p-4 rounded-lg transition-all ${index === currentSection ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${index < currentSection ? 'bg-emerald-500' : index === currentSection ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      {index < currentSection ? <CheckCircle size={16} className="text-white" /> : <span className="text-white text-sm font-medium">
                          {index + 1}
                        </span>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">
                        {section.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock size={12} />
                        {section.duration}
                      </div>
                    </div>
                  </div>
                </motion.button>)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-slate-200 bg-white flex flex-col">
          <AnimatePresence mode="wait">
            {showChat ? <ChatPanel key="chat" messages={messages} inputValue={inputValue} isAITyping={isAITyping} onInputChange={setInputValue} onSendMessage={handleSendMessage} messagesEndRef={messagesEndRef} /> : <RelatedTopics key="related" topics={relatedTopics} onNavigate={onNavigateToTopic} />}
          </AnimatePresence>
        </div>
      </div>
    </div>;
}
// Chat Panel Component
function ChatPanel({
  messages,
  inputValue,
  isAITyping,
  onInputChange,
  onSendMessage,
  messagesEndRef
}: {
  messages: Message[];
  inputValue: string;
  isAITyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
  return <motion.div initial={{
    opacity: 0,
    x: 20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 20
  }} className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" />
          Ask the AI Instructor
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Get instant answers to your questions
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <div className="text-center py-8">
            <Sparkles size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-600">
              Ask me anything about this lesson!
            </p>
          </div>}

        {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>)}

        {isAITyping && <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0
            }} className="w-2 h-2 bg-slate-400 rounded-full" />
                <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.2
            }} className="w-2 h-2 bg-slate-400 rounded-full" />
                <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.4
            }} className="w-2 h-2 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input type="text" value={inputValue} onChange={e => onInputChange(e.target.value)} onKeyPress={e => e.key === 'Enter' && onSendMessage()} placeholder="Ask a question..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <motion.button whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} onClick={onSendMessage} disabled={!inputValue.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>;
}
// Related Topics Component
function RelatedTopics({
  topics,
  onNavigate
}: {
  topics: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
  }[];
  onNavigate: (topicId: string) => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    x: 20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 20
  }} className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-600" />
          Related Topics
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Continue your learning journey
        </p>
      </div>

      <div className="p-4 space-y-4">
        {topics.map((topic, index) => <motion.div key={topic.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} whileHover={{
        y: -2
      }} onClick={() => onNavigate(topic.id)} className="bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all group">
            <div className="relative h-32 bg-slate-900">
              <img src={topic.thumbnail} alt={topic.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play size={20} className="text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white rounded text-xs font-medium flex items-center gap-1">
                <Clock size={10} />
                {topic.duration}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                {topic.title}
              </h4>
            </div>
          </motion.div>)}
      </div>
    </motion.div>;
}