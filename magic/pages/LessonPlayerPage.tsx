import React, { useState, Children } from 'react';
import { motion } from 'framer-motion';
import { CourseCatalog } from '../components/CourseCatalog';
import { Play, Clock, Award, Star } from 'lucide-react';
interface LessonPlayerPageProps {
  onNavigate?: (page: string) => void;
}
export function LessonPlayerPage({
  onNavigate
}: LessonPlayerPageProps) {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Center</h1>
        <p className="text-slate-500">
          Master your AI tools and grow your business.
        </p>
      </div>

      {/* Featured Course */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4 fill-current" /> Featured Course
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Getting the Most from Sarah
              </h2>
              <p className="text-blue-100 mb-6 max-w-xl">
                Learn how to configure your AI Marketing Manager for maximum
                impact. Covers email campaigns, social media strategy, and ROI
                tracking.
              </p>
              <div className="flex flex-wrap gap-6 mb-8 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 15 minutes
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> Beginner Level
                </div>
              </div>
              <button onClick={() => onNavigate?.('course-detail')} className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Start Learning
              </button>
            </div>
            <div className="w-full md:w-1/3 aspect-video bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <Play className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Catalog */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-900 mb-6">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[{
          title: 'AI Automation Basics',
          duration: '20 min',
          level: 'Beginner',
          image: 'bg-emerald-100'
        }, {
          title: 'Advanced Customer Service',
          duration: '35 min',
          level: 'Intermediate',
          image: 'bg-purple-100'
        }, {
          title: 'Sales Funnel Mastery',
          duration: '45 min',
          level: 'Advanced',
          image: 'bg-amber-100'
        }, {
          title: 'Content Strategy 101',
          duration: '25 min',
          level: 'Beginner',
          image: 'bg-rose-100'
        }, {
          title: 'Understanding Analytics',
          duration: '30 min',
          level: 'Intermediate',
          image: 'bg-cyan-100'
        }, {
          title: 'Team Collaboration',
          duration: '15 min',
          level: 'Beginner',
          image: 'bg-indigo-100'
        }].map((course, i) => <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`h-40 ${course.image} flex items-center justify-center`}>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-slate-700 fill-current ml-0.5" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" /> {course.level}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </motion.div>
    </motion.div>;
}