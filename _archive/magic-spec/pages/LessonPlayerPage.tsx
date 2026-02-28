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
        {/* Mock courses commented out - wire to GET /v1/content API */}
        <div className="text-center py-12 text-slate-500">
          No courses available. Wire to content API to load real courses.
        </div>
      </motion.div>
    </motion.div>;
}