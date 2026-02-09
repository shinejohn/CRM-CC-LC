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
const LEARNING_TOPICS: Record<string, LearningTopic> = {
  'ai-customer-service': {
    id: 'ai-customer-service',
    title: 'AI-Powered Customer Service: Transform Your Support',
    description: 'Learn how AI can handle customer inquiries 24/7, reduce response times, and improve satisfaction scores.',
    category: 'Customer Service',
    duration: '12 min',
    difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
    views: 1247,
    completionRate: 89,
    tags: ['Customer Service', 'Automation', 'Chatbots'],
    sections: [{
      id: 'intro',
      title: 'Introduction to AI Customer Service',
      duration: '3 min',
      content: "Welcome! In this lesson, we'll explore how AI is revolutionizing customer service for small and medium businesses. You'll see real examples and learn practical applications you can implement today."
    }, {
      id: 'chatbots',
      title: 'AI Chatbots: Your 24/7 Support Team',
      duration: '4 min',
      content: "AI chatbots can handle common customer questions instantly, any time of day. We'll show you how they work, what they can do, and how to set one up for your business."
    }, {
      id: 'sentiment',
      title: 'Understanding Customer Sentiment',
      duration: '3 min',
      content: 'AI can analyze customer messages to detect frustration, satisfaction, or urgency. This helps you prioritize responses and provide better service.'
    }, {
      id: 'implementation',
      title: 'Getting Started with AI Support',
      duration: '2 min',
      content: "Ready to implement? We'll walk through the simple steps to add AI customer service to your business, including tools, setup, and best practices."
    }],
    relatedTopics: ['ai-email-automation', 'ai-sentiment-analysis', 'ai-crm-integration']
  },
  'ai-marketing-automation': {
    id: 'ai-marketing-automation',
    title: 'Marketing Automation with AI: From Leads to Customers',
    description: 'Discover how AI can personalize marketing campaigns, optimize ad spend, and nurture leads automatically.',
    category: 'Marketing',
    duration: '15 min',
    difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    views: 2103,
    completionRate: 92,
    tags: ['Marketing', 'Lead Generation', 'Personalization'],
    sections: [{
      id: 'intro',
      title: 'The Power of AI in Marketing',
      duration: '3 min',
      content: 'AI is transforming how businesses market themselves. Learn how automation can save time while improving results.'
    }, {
      id: 'personalization',
      title: 'Personalized Campaigns at Scale',
      duration: '5 min',
      content: 'See how AI personalizes messages for each customer based on their behavior, preferences, and history.'
    }, {
      id: 'optimization',
      title: 'AI-Driven Campaign Optimization',
      duration: '4 min',
      content: 'AI continuously tests and optimizes your campaigns to improve performance and reduce costs.'
    }, {
      id: 'implementation',
      title: 'Building Your First AI Campaign',
      duration: '3 min',
      content: 'Step-by-step guide to creating your first AI-powered marketing campaign.'
    }],
    relatedTopics: ['ai-content-generation', 'ai-social-media', 'ai-email-campaigns']
  },
  'ai-data-insights': {
    id: 'ai-data-insights',
    title: 'Turn Data into Decisions: AI Analytics for SMBs',
    description: 'See how AI analyzes your business data to uncover trends, predict outcomes, and recommend actions.',
    category: 'Analytics',
    duration: '10 min',
    difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    views: 892,
    completionRate: 85,
    tags: ['Analytics', 'Data Science', 'Reporting'],
    sections: [{
      id: 'intro',
      title: 'Why AI Analytics Matter',
      duration: '2 min',
      content: 'Your business generates data every day. AI can turn that data into actionable insights.'
    }, {
      id: 'patterns',
      title: 'Discovering Hidden Patterns',
      duration: '4 min',
      content: 'AI finds patterns in your data that humans might miss, revealing opportunities and risks.'
    }, {
      id: 'predictions',
      title: 'Predictive Analytics',
      duration: '3 min',
      content: 'Learn how AI predicts future trends, customer behavior, and business outcomes.'
    }, {
      id: 'action',
      title: 'From Insights to Action',
      duration: '1 min',
      content: 'How to use AI recommendations to make better business decisions.'
    }],
    relatedTopics: ['ai-predictive-analytics', 'ai-dashboards', 'ai-forecasting']
  }
};
const RELATED_TOPICS_DATA: Record<string, {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}> = {
  'ai-email-automation': {
    id: 'ai-email-automation',
    title: 'Email Automation: Nurture Leads on Autopilot',
    thumbnail: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400',
    duration: '8 min'
  },
  'ai-sentiment-analysis': {
    id: 'ai-sentiment-analysis',
    title: 'Sentiment Analysis: Understand Customer Emotions',
    thumbnail: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
    duration: '6 min'
  },
  'ai-crm-integration': {
    id: 'ai-crm-integration',
    title: 'AI + CRM: Smarter Customer Relationships',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    duration: '10 min'
  },
  'ai-content-generation': {
    id: 'ai-content-generation',
    title: 'AI Content Creation: Blog Posts & Social Media',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400',
    duration: '18 min'
  },
  'ai-social-media': {
    id: 'ai-social-media',
    title: 'Social Media Automation with AI',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    duration: '12 min'
  },
  'ai-email-campaigns': {
    id: 'ai-email-campaigns',
    title: 'AI-Powered Email Campaigns That Convert',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
    duration: '14 min'
  }
};
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