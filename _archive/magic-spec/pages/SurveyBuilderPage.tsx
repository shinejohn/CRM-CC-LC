import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, GripVertical, Type, List, CheckSquare, Star, Calendar, Hash } from 'lucide-react';
interface SurveyBuilderPageProps {
  onBack: () => void;
  surveyId?: string;
}
interface Question {
  id: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'rating' | 'date' | 'number';
  question: string;
  options?: string[];
  required: boolean;
}
export function SurveyBuilderPage({
  onBack,
  surveyId
}: SurveyBuilderPageProps) {
  const [surveyTitle, setSurveyTitle] = useState('New Business Survey');
  const [surveyDescription, setSurveyDescription] = useState('Help us understand your business better');
  // Mock data commented out - wire to GET/POST /v1/survey/* API
  const [questions, setQuestions] = useState<Question[]>([]);
  const questionTypes = [{
    type: 'text',
    label: 'Text',
    icon: Type
  }, {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    icon: List
  }, {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare
  }, {
    type: 'rating',
    label: 'Rating',
    icon: Star
  }, {
    type: 'date',
    label: 'Date',
    icon: Calendar
  }, {
    type: 'number',
    label: 'Number',
    icon: Hash
  }];
  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: 'New question',
      required: false,
      ...(type === 'multiple-choice' || type === 'checkbox' ? {
        options: ['Option 1', 'Option 2']
      } : {})
    };
    setQuestions([...questions, newQuestion]);
  };
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? {
      ...q,
      ...updates
    } : q));
  };
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`]
        };
      }
      return q;
    }));
  };
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return {
          ...q,
          options: newOptions
        };
      }
      return q;
    }));
  };
  const deleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optionIndex)
        };
      }
      return q;
    }));
  };
  const getQuestionIcon = (type: Question['type']) => {
    const typeConfig = questionTypes.find(t => t.type === type);
    return typeConfig ? typeConfig.icon : Type;
  };
  return <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </button>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                Preview
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                Save Survey
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Survey Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <input type="text" value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} className="text-3xl font-bold text-slate-900 w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 -ml-2" placeholder="Survey Title" />
          <textarea value={surveyDescription} onChange={e => setSurveyDescription(e.target.value)} className="text-slate-600 w-full mt-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 -ml-2 resize-none" placeholder="Survey description" rows={2} />
        </motion.div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((question, index) => {
          const Icon = getQuestionIcon(question.type);
          return <motion.div key={question.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="cursor-move text-slate-400 mt-3">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <input type="text" value={question.question} onChange={e => updateQuestion(question.id, {
                      question: e.target.value
                    })} className="text-lg font-medium text-slate-900 w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 -ml-2" placeholder="Question text" />
                        <div className="flex items-center gap-4 mt-2">
                          <select value={question.type} onChange={e => updateQuestion(question.id, {
                        type: e.target.value as Question['type']
                      })} className="text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {questionTypes.map(type => <option key={type.type} value={type.type}>
                                {type.label}
                              </option>)}
                          </select>
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" checked={question.required} onChange={e => updateQuestion(question.id, {
                          required: e.target.checked
                        })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Required
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Options for multiple choice and checkbox */}
                    {(question.type === 'multiple-choice' || question.type === 'checkbox') && question.options && <div className="ml-14 space-y-2">
                          {question.options.map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                              <input type="text" value={option} onChange={e => updateOption(question.id, optionIndex, e.target.value)} className="flex-1 text-sm text-slate-700 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1" placeholder={`Option ${optionIndex + 1}`} />
                              {question.options!.length > 2 && <button onClick={() => deleteOption(question.id, optionIndex)} className="text-slate-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>}
                            </div>)}
                          <button onClick={() => addOption(question.id)} className="ml-6 text-sm text-blue-600 hover:text-blue-700 font-medium">
                            + Add option
                          </button>
                        </div>}

                    {/* Preview for other question types */}
                    {question.type === 'text' && <div className="ml-14">
                        <input type="text" disabled placeholder="Text answer" className="w-full border-b border-slate-200 py-2 text-sm text-slate-400" />
                      </div>}
                    {question.type === 'rating' && <div className="ml-14 flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-6 h-6 text-slate-300" />)}
                      </div>}
                    {question.type === 'date' && <div className="ml-14">
                        <input type="date" disabled className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400" />
                      </div>}
                    {question.type === 'number' && <div className="ml-14">
                        <input type="number" disabled placeholder="Number answer" className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400" />
                      </div>}
                  </div>

                  <button onClick={() => deleteQuestion(question.id)} className="text-slate-400 hover:text-red-600 transition-colors mt-3">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>;
        })}
        </div>

        {/* Add Question Menu */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Add Question
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {questionTypes.map(type => {
            const Icon = type.icon;
            return <button key={type.type} onClick={() => addQuestion(type.type as Question['type'])} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>;
          })}
          </div>
        </div>
      </div>
    </div>;
}