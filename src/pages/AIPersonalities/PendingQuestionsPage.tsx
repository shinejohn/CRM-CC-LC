import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, User, Bot, AlertTriangle, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router';

export const PendingQuestionsPage: React.FC = () => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>('PQ-101');
  const [response, setResponse] = useState('');

  // Mock pending questions data
  const pendingQuestions = [
    {
      id: 'PQ-101',
      customer: 'Sarah Jenkins',
      business: 'Jenkins Bakery',
      aiPersonality: 'Support Agent - Lily',
      question: 'Can I change my subscription billing date to the 15th of every month?',
      context: 'User tried to update billing in portal but encountered an error. AI policy does not cover custom billing dates without manager approval.',
      status: 'Open',
      urgency: 'Medium',
      timePending: '2 hours',
    },
    {
      id: 'PQ-102',
      customer: 'David Chen',
      business: 'TechStart Inc',
      aiPersonality: 'Technical Consultant - Marcus',
      question: 'How do I configure the API webhook for custom CRM events?',
      context: 'AI recognized query is outside its standard knowledge base boundaries for non-enterprise tiers.',
      status: 'Open',
      urgency: 'High',
      timePending: '30 mins',
    },
    {
      id: 'PQ-103',
      customer: 'Amanda Torres',
      business: 'Torres Legal',
      aiPersonality: 'Account Manager - Sofia',
      question: 'Is it possible to get a discount if we refer 3 other law firms?',
      context: 'AI flagged as negotiation request requiring human account manager intervention.',
      status: 'In Progress',
      urgency: 'Low',
      timePending: '1 day',
    }
  ];

  const activeQuestion = pendingQuestions.find(q => q.id === activeQuestionId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-orange-500" />
              Pending AI Questions
            </h1>
            <p className="text-gray-600 mt-1">Resolve escalated interactions that AI personalities could not handle.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/ai-personalities">
              <Button variant="outline">Back to Personalities</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
          
          {/* Left pane: Queue List */}
          <Card className="h-full flex flex-col shadow-sm lg:col-span-1">
            <CardHeader className="border-b pb-4 bg-white sticky top-0 z-10">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Escalation Queue</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">3 Pending</Badge>
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto divide-y bg-slate-50">
              {pendingQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-slate-100 ${activeQuestionId === q.id ? 'bg-white border-l-4 border-l-indigo-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{q.business}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {q.timePending}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">"{q.question}"</p>
                  <div className="flex justify-between items-center mt-3">
                    <Badge variant="outline" className={`text-xs ${q.urgency === 'High' ? 'text-red-700 border-red-200 bg-red-50' : q.urgency === 'Medium' ? 'text-orange-700 border-orange-200 bg-orange-50' : 'text-blue-700 border-blue-200 bg-blue-50'}`}>
                      {q.urgency} Priority
                    </Badge>
                    <span className="text-xs text-slate-500">{q.aiPersonality.split('-')[1]?.trim() || 'AI'}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Right pane: Resolution Workspace */}
          <Card className="h-full flex flex-col shadow-sm lg:col-span-2">
            {activeQuestion ? (
              <>
                <CardHeader className="border-b pb-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{activeQuestion.business} - {activeQuestion.customer}</h2>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span>Escalated from: <strong className="text-slate-700">{activeQuestion.aiPersonality}</strong></span>
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">Needs Review</Badge>
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
                  
                  {/* Context block */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" /> AI Escalation Context
                    </h3>
                    <p className="text-sm text-yellow-900">{activeQuestion.context}</p>
                  </div>

                  {/* Conversation Mock */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 max-w-[80%]">
                      <span className="text-xs text-slate-500 ml-1 font-medium">{activeQuestion.aiPersonality}</span>
                      <div className="bg-white border rounded-lg p-3 text-sm text-slate-700 shadow-sm rounded-tl-none">
                        Hello {activeQuestion.customer.split(' ')[0]}! I'm here to help you with your account today. How can I assist?
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 max-w-[80%] self-end ml-auto">
                      <span className="text-xs text-slate-500 mr-1 font-medium text-right">{activeQuestion.customer}</span>
                      <div className="bg-indigo-600 text-white rounded-lg p-3 text-sm shadow-sm rounded-tr-none">
                        {activeQuestion.question}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 max-w-[80%]">
                      <span className="text-xs text-slate-500 ml-1 font-medium">{activeQuestion.aiPersonality}</span>
                      <div className="bg-white border rounded-lg p-3 text-sm text-slate-700 shadow-sm rounded-tl-none italic text-slate-500">
                        I'm sorry, I'm unable to process that request directly. I have escalated this conversation to a human specialist who will review your account and get back to you shortly.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t bg-white p-4">
                  <div className="relative">
                    <Textarea 
                      placeholder="Type your response to the customer here..." 
                      className="min-h-[120px] pb-12 resize-none"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <Button variant="outline" size="sm" className="text-slate-600">
                         Save Internal Note
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <MessageSquare className="w-4 h-4" /> Send Response & Close
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark as Resolved (No Reply)
                    </Button>
                    <span className="text-xs text-slate-500">
                      Response will be sent via SMS/Email to {activeQuestion.customer}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center flex-col text-slate-400">
                <CheckCircle className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a question from the queue to start resolving.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
