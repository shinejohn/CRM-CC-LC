import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Star, Clock, Award, CheckCircle2, Circle, FileText } from 'lucide-react';
export function CourseDetailPage({
  onBack,
  onStartLesson
}: {
  onBack: () => void;
  onStartLesson: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Learning Center
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        📚 Getting the Most from Sarah
      </h1>

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white ml-1" />
            </div>
            <span className="absolute bottom-3 right-3 text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
              Preview
            </span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>15 minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Beginner</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>4.9 (127 ratings)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-900">
                  Your Progress
                </span>
                <span className="text-slate-500">60% Complete</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[60%]" />
              </div>
            </div>

            <button onClick={onStartLesson} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Continue Course - Lesson 4
            </button>
          </div>
        </div>
      </div>

      {/* About This Course */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          About This Course
        </h3>
        <p className="text-slate-700 mb-6 leading-relaxed">
          Learn how to configure Sarah, your AI Marketing Manager, to maximize
          your marketing results. This course covers email campaigns, social
          media, content strategy, and measuring ROI.
        </p>

        <h4 className="font-bold text-slate-900 mb-3">What You'll Learn:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["Configure Sarah's communication style", 'Set up effective email campaigns', 'Optimize send times and frequency', 'Read and act on marketing reports', 'Integrate with your social media accounts'].map((item, i) => <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              {item}
            </div>)}
        </div>
      </div>

      {/* Course Curriculum */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Course Curriculum
        </h3>
        {/* Mock curriculum commented out - wire to GET /v1/content/{id} API */}
        <div className="space-y-1">
          {[].map((lesson: { title: string; duration: string; status: string }, i: number) => <div key={i} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${lesson.status === 'in-progress' ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                {lesson.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : lesson.status === 'in-progress' ? <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> : <Circle className="w-5 h-5 text-slate-300" />}
                <span className={`font-medium ${lesson.status === 'completed' ? 'text-slate-500' : 'text-slate-900'}`}>
                  Lesson {i + 1}: {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  {lesson.duration}
                </span>
                {lesson.status === 'in-progress' && <button onClick={onStartLesson} className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>}
              </div>
            </div>)}

          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 p-3 text-slate-500">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Quiz: Test Your Knowledge</span>
            </div>
            <div className="flex items-center gap-3 p-3 text-slate-500">
              <Award className="w-5 h-5" />
              <span className="font-medium">
                Certificate: Sarah Marketing Specialist
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Reviews
        </h3>
        {/* Mock reviews commented out */}
        <div className="space-y-6">
          {[].map((review: { author: string; date: string; rating: number; text: string }, i: number) => <div key={i} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />)}
              </div>
              <p className="text-slate-700 italic mb-2">"{review.text}"</p>
              <p className="text-xs text-slate-500">
                - {review.author}, {review.date}
              </p>
            </div>)}
        </div>
        <button className="mt-6 text-sm font-medium text-blue-600 hover:underline">
          Read All 127 Reviews →
        </button>
      </div>
    </motion.div>;
}