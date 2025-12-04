import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, RotateCcw, Maximize2, Users, TrendingUp, Clock, DollarSign, CheckCircle, Star, Zap, Shield, Phone, Mail, Calendar, ArrowRight, Building, Utensils, Wrench, Home, Briefcase, Heart } from 'lucide-react';

// ============================================
// SAMPLE PRESENTATION DATA (JSON-DRIVEN)
// ============================================
const samplePresentation = {
  presentationId: "lp-001-restaurant-owner",
  meta: {
    title: "AI Employees for Your Restaurant",
    targetAudience: "Restaurant Owners",
    theme: "blue" // blue, green, purple, orange
  },
  presenter: {
    name: "Sarah",
    role: "AI Account Manager",
    avatarStyle: "professional-female"
  },
  slides: [
    {
      id: 1,
      component: "HeroSlide",
      content: {
        badge: "FOR RESTAURANT OWNERS",
        headline: "Your Restaurant Deserves",
        headlineAccent: "an AI Team",
        subheadline: "24/7 Reservations • Automated Marketing • Perfect Customer Service",
        backgroundGradient: "from-blue-900 via-blue-800 to-indigo-900",
        icon: "Utensils"
      },
      narration: "Hi, I'm Sarah, your AI Account Manager. I'm excited to show you how AI employees can transform your restaurant's operations. In just a few minutes, I'll walk you through exactly what we can do for you—and why hundreds of restaurant owners are already using Fibonacco."
    },
    {
      id: 2,
      component: "ProblemSlide",
      content: {
        headline: "Sound Familiar?",
        subheadline: "The daily struggles every restaurant owner faces",
        problems: [
          { icon: "Phone", title: "Missed Calls", description: "Losing reservations when you can't answer the phone" },
          { icon: "Clock", title: "No Time", description: "Too busy cooking to post on social media" },
          { icon: "Users", title: "Staff Turnover", description: "Training new hosts every few months" },
          { icon: "DollarSign", title: "No-Shows", description: "Empty tables eating into your profits" }
        ]
      },
      narration: "Let me ask you something—does this sound familiar? You're in the middle of a dinner rush, the phone's ringing, and you know that every missed call could be a lost reservation. You haven't posted on Instagram in weeks. Your best host just quit. And last Saturday, you had three no-shows. This isn't sustainable."
    },
    {
      id: 3,
      component: "SolutionSlide",
      content: {
        headline: "Meet Your AI Team",
        subheadline: "Employees that never sleep, never quit, never complain",
        solutions: [
          { icon: "Phone", title: "AI Receptionist", description: "Answers every call, 24/7. Books reservations, answers questions, sends confirmations.", color: "blue" },
          { icon: "TrendingUp", title: "AI Marketing Manager", description: "Posts to social media daily. Creates promotions. Responds to reviews.", color: "green" },
          { icon: "Mail", title: "AI Customer Service", description: "Handles emails, sends reminders, reduces no-shows by 60%.", color: "purple" }
        ]
      },
      narration: "Now imagine this instead: An AI receptionist who answers every single call—even at 2 AM. An AI marketing manager posting beautiful content to your social media every day. An AI customer service rep who sends reservation reminders and has cut no-shows by sixty percent for our clients. This is your new team."
    },
    {
      id: 4,
      component: "StatsSlide",
      content: {
        headline: "The Numbers Don't Lie",
        stats: [
          { value: "$99", label: "per month", sublabel: "vs $45,000/year employee", icon: "DollarSign" },
          { value: "24/7", label: "availability", sublabel: "Never calls in sick", icon: "Clock" },
          { value: "340%", label: "more visibility", sublabel: "Average reach increase", icon: "TrendingUp" },
          { value: "60%", label: "fewer no-shows", sublabel: "Smart reminders work", icon: "CheckCircle" }
        ]
      },
      narration: "Here's what really matters—the economics. For just ninety-nine dollars a month, you get capabilities that would cost forty-five thousand dollars a year in employee salary. Your AI team works twenty-four-seven. They never need a day off, never call in sick. Our restaurant clients see an average three hundred forty percent increase in local visibility, and no-shows drop by sixty percent."
    },
    {
      id: 5,
      component: "ComparisonSlide",
      content: {
        headline: "Before & After",
        before: {
          title: "Without Fibonacco",
          items: [
            "Missed calls = lost revenue",
            "Inconsistent social media",
            "Manual reservation tracking",
            "No review responses",
            "High staff training costs"
          ]
        },
        after: {
          title: "With Fibonacco",
          items: [
            "Every call answered instantly",
            "Daily posts, automatically",
            "Smart booking system",
            "AI-crafted review replies",
            "Zero training required"
          ]
        }
      },
      narration: "Let me paint the picture clearly. On the left, your restaurant without Fibonacco—missed calls turning into lost revenue, inconsistent social media presence, manual everything. On the right, your restaurant with AI employees—every call answered, daily social posts happening automatically, smart systems handling the details. It's night and day."
    },
    {
      id: 6,
      component: "ProcessSlide",
      content: {
        headline: "How It Works",
        subheadline: "Up and running in 48 hours",
        steps: [
          { number: "1", title: "Quick Setup", description: "15-minute onboarding call. We learn your business.", icon: "Calendar" },
          { number: "2", title: "AI Training", description: "We configure your AI team with your menu, hours, policies.", icon: "Zap" },
          { number: "3", title: "Go Live", description: "Your AI employees start working. You start relaxing.", icon: "CheckCircle" }
        ]
      },
      narration: "Getting started is simple. Step one: a quick fifteen-minute onboarding call where we learn about your restaurant. Step two: we configure your AI team with your specific menu, hours, and policies. Step three: your AI employees go live, and you can finally breathe. The whole process takes forty-eight hours or less."
    },
    {
      id: 7,
      component: "TestimonialSlide",
      content: {
        quote: "I was skeptical at first—AI for a family restaurant? But Sarah's team set everything up, and within a week, my phone anxiety was gone. The AI handles calls better than my last three hosts combined.",
        author: "Maria Gonzalez",
        title: "Owner, Casa Del Sol",
        location: "Tampa, FL",
        metric: { value: "+47%", label: "reservations in 3 months" }
      },
      narration: "Don't just take my word for it. Here's what Maria Gonzalez, owner of Casa Del Sol in Tampa, had to say. Quote: 'I was skeptical at first—AI for a family restaurant? But within a week, my phone anxiety was gone. The AI handles calls better than my last three hosts combined.' Maria saw a forty-seven percent increase in reservations in just three months."
    },
    {
      id: 8,
      component: "PricingSlide",
      content: {
        headline: "Simple, Transparent Pricing",
        price: "$99",
        period: "/month",
        description: "Everything you need to run a smarter restaurant",
        features: [
          "AI Receptionist (unlimited calls)",
          "AI Marketing Manager",
          "AI Customer Service",
          "Day.News local coverage",
          "Event calendar listings",
          "24/7 support"
        ],
        cta: "Start Free Trial",
        guarantee: "30-day money-back guarantee"
      },
      narration: "Our pricing is simple and transparent. Ninety-nine dollars per month gets you the complete AI team—receptionist, marketing manager, customer service—plus coverage in your local Day.News, event calendar listings, and twenty-four-seven support. And here's the thing: we offer a thirty-day money-back guarantee. If you're not completely satisfied, you pay nothing."
    },
    {
      id: 9,
      component: "CTASlide",
      content: {
        headline: "Ready to Transform Your Restaurant?",
        subheadline: "Join 500+ restaurant owners who've already made the switch",
        primaryCTA: { text: "Start Free Trial", icon: "ArrowRight" },
        secondaryCTA: { text: "Schedule a Demo", icon: "Calendar" },
        urgency: "Limited spots available for December onboarding"
      },
      narration: "So, are you ready to transform your restaurant? Over five hundred restaurant owners have already made the switch to Fibonacco. Click 'Start Free Trial' to begin today—no credit card required. Or if you'd like to chat first, schedule a demo call with me. I'd love to show you exactly how this would work for your specific restaurant. We have limited spots available for December onboarding, so don't wait."
    }
  ]
};

// ============================================
// ICON MAPPING
// ============================================
const iconMap = {
  Users, TrendingUp, Clock, DollarSign, CheckCircle, Star, Zap, Shield, 
  Phone, Mail, Calendar, ArrowRight, Building, Utensils, Wrench, Home, Briefcase, Heart
};

const getIcon = (iconName, className = "w-6 h-6") => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

// ============================================
// SLIDE COMPONENTS
// ============================================

// 1. HERO SLIDE - Opening impact
const HeroSlide = ({ content, isActive }) => (
  <div className={`relative w-full h-full bg-gradient-to-br ${content.backgroundGradient} overflow-hidden`}>
    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
    </div>
    
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
      backgroundSize: '50px 50px'
    }} />
    
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
      {/* Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 ${isActive ? 'animate-fade-in' : ''}`}>
        {getIcon(content.icon, "w-4 h-4 text-amber-400")}
        <span className="text-sm font-medium text-white/90 tracking-wide">{content.badge}</span>
      </div>
      
      {/* Headline */}
      <h1 className={`text-5xl md:text-6xl font-bold text-white mb-2 ${isActive ? 'animate-slide-up' : ''}`}>
        {content.headline}
      </h1>
      <h1 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-6 ${isActive ? 'animate-slide-up delay-100' : ''}`}>
        {content.headlineAccent}
      </h1>
      
      {/* Subheadline */}
      <p className={`text-xl text-blue-100/80 max-w-2xl ${isActive ? 'animate-fade-in delay-200' : ''}`}>
        {content.subheadline}
      </p>
      
      {/* Decorative icon */}
      <div className={`mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${isActive ? 'animate-bounce-in delay-300' : ''}`}>
        {getIcon(content.icon, "w-16 h-16 text-white")}
      </div>
    </div>
  </div>
);

// 2. PROBLEM SLIDE - Pain points
const ProblemSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex flex-col">
    {/* Header */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-white mb-2">{content.headline}</h2>
      <p className="text-slate-400">{content.subheadline}</p>
    </div>
    
    {/* Problem cards grid */}
    <div className="flex-1 grid grid-cols-2 gap-4">
      {content.problems.map((problem, index) => (
        <div 
          key={index}
          className={`relative group bg-gradient-to-br from-red-950/50 to-slate-800/50 rounded-2xl p-6 border border-red-900/30 hover:border-red-500/50 transition-all duration-300 ${isActive ? 'animate-fade-in' : ''}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Warning indicator */}
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {getIcon(problem.icon, "w-7 h-7 text-red-400")}
          </div>
          
          {/* Text */}
          <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{problem.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// 3. SOLUTION SLIDE - Features
const SolutionSlide = ({ content, isActive }) => {
  const colorStyles = {
    blue: { bg: 'from-blue-600 to-blue-700', light: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'from-emerald-600 to-emerald-700', light: 'bg-emerald-500/20', text: 'text-emerald-400' },
    purple: { bg: 'from-purple-600 to-purple-700', light: 'bg-purple-500/20', text: 'text-purple-400' }
  };
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">{content.headline}</h2>
        <p className="text-slate-600">{content.subheadline}</p>
      </div>
      
      {/* Solution cards */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {content.solutions.map((solution, index) => {
          const colors = colorStyles[solution.color] || colorStyles.blue;
          return (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 ${isActive ? 'animate-slide-up' : ''}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Colored top bar */}
              <div className={`h-2 bg-gradient-to-r ${colors.bg}`} />
              
              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${colors.light} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {getIcon(solution.icon, `w-8 h-8 ${colors.text}`)}
                </div>
                
                {/* Text */}
                <h3 className="text-xl font-bold text-slate-800 mb-3">{solution.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{solution.description}</p>
              </div>
              
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-t ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. STATS SLIDE - Data visualization
const StatsSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-8 flex flex-col">
    {/* Header */}
    <div className="text-center mb-10">
      <h2 className="text-4xl font-bold text-white">{content.headline}</h2>
    </div>
    
    {/* Stats grid */}
    <div className="flex-1 grid grid-cols-4 gap-6">
      {content.stats.map((stat, index) => (
        <div 
          key={index}
          className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex flex-col items-center justify-center text-center group hover:bg-white/20 transition-all ${isActive ? 'animate-scale-in' : ''}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            {getIcon(stat.icon, "w-6 h-6 text-amber-400")}
          </div>
          
          {/* Value */}
          <div className="text-4xl md:text-5xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">
            {stat.value}
          </div>
          
          {/* Label */}
          <div className="text-lg text-white/90 font-medium mb-2">{stat.label}</div>
          
          {/* Sublabel */}
          <div className="text-sm text-white/60">{stat.sublabel}</div>
        </div>
      ))}
    </div>
  </div>
);

// 5. COMPARISON SLIDE - Before/After
const ComparisonSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-slate-900 p-8 flex flex-col">
    {/* Header */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-white">{content.headline}</h2>
    </div>
    
    {/* Comparison panels */}
    <div className="flex-1 grid grid-cols-2 gap-4">
      {/* Before */}
      <div className={`bg-gradient-to-br from-red-950/80 to-slate-900 rounded-2xl p-6 border border-red-900/50 ${isActive ? 'animate-slide-right' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-xl">✕</span>
          </div>
          <h3 className="text-2xl font-bold text-red-400">{content.before.title}</h3>
        </div>
        <ul className="space-y-4">
          {content.before.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-300">
              <span className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-xs">✕</span>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* After */}
      <div className={`bg-gradient-to-br from-emerald-950/80 to-slate-900 rounded-2xl p-6 border border-emerald-900/50 ${isActive ? 'animate-slide-left' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">{content.after.title}</h3>
        </div>
        <ul className="space-y-4">
          {content.after.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-300">
              <span className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// 6. PROCESS SLIDE - Steps
const ProcessSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex flex-col">
    {/* Header */}
    <div className="text-center mb-10">
      <h2 className="text-4xl font-bold text-slate-800 mb-2">{content.headline}</h2>
      <p className="text-slate-600">{content.subheadline}</p>
    </div>
    
    {/* Steps */}
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-4">
        {content.steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step card */}
            <div className={`relative bg-white rounded-2xl shadow-xl p-6 w-64 group hover:-translate-y-2 transition-all ${isActive ? 'animate-fade-in' : ''}`} style={{ animationDelay: `${index * 200}ms` }}>
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 ml-4 group-hover:scale-110 transition-transform">
                {getIcon(step.icon, "w-7 h-7 text-blue-600")}
              </div>
              
              {/* Text */}
              <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm">{step.description}</p>
            </div>
            
            {/* Arrow */}
            {index < content.steps.length - 1 && (
              <ArrowRight className="w-8 h-8 text-blue-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

// 7. TESTIMONIAL SLIDE - Social proof
const TestimonialSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col items-center justify-center">
    {/* Quote marks */}
    <div className={`text-8xl text-blue-500/20 font-serif mb-4 ${isActive ? 'animate-fade-in' : ''}`}>"</div>
    
    {/* Quote */}
    <blockquote className={`text-2xl text-white/90 text-center max-w-3xl leading-relaxed mb-8 ${isActive ? 'animate-slide-up' : ''}`}>
      {content.quote}
    </blockquote>
    
    {/* Author */}
    <div className={`flex items-center gap-4 mb-8 ${isActive ? 'animate-fade-in delay-200' : ''}`}>
      {/* Avatar placeholder */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
        {content.author.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <div className="text-white font-semibold text-lg">{content.author}</div>
        <div className="text-slate-400">{content.title}</div>
        <div className="text-slate-500 text-sm">{content.location}</div>
      </div>
    </div>
    
    {/* Metric */}
    <div className={`bg-emerald-500/20 rounded-full px-6 py-3 border border-emerald-500/30 ${isActive ? 'animate-bounce-in delay-300' : ''}`}>
      <span className="text-emerald-400 font-bold text-2xl">{content.metric.value}</span>
      <span className="text-emerald-300/80 ml-2">{content.metric.label}</span>
    </div>
  </div>
);

// 8. PRICING SLIDE
const PricingSlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex flex-col items-center justify-center">
    {/* Header */}
    <h2 className={`text-4xl font-bold text-slate-800 mb-8 ${isActive ? 'animate-fade-in' : ''}`}>{content.headline}</h2>
    
    {/* Pricing card */}
    <div className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-blue-500 relative ${isActive ? 'animate-scale-in' : ''}`}>
      {/* Popular badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1 rounded-full text-sm font-medium">
        Most Popular
      </div>
      
      {/* Price */}
      <div className="text-center mb-6 pt-4">
        <div className="flex items-end justify-center gap-1">
          <span className="text-6xl font-bold text-slate-800">{content.price}</span>
          <span className="text-2xl text-slate-500 mb-2">{content.period}</span>
        </div>
        <p className="text-slate-600 mt-2">{content.description}</p>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-8">
        {content.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* CTA */}
      <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
        {content.cta}
      </button>
      
      {/* Guarantee */}
      <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
        <Shield className="w-4 h-4" />
        <span>{content.guarantee}</span>
      </div>
    </div>
  </div>
);

// 9. CTA SLIDE - Final call to action
const CTASlide = ({ content, isActive }) => (
  <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
    {/* Background effects */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
    </div>
    
    {/* Content */}
    <div className="relative z-10">
      <h2 className={`text-5xl font-bold text-white mb-4 ${isActive ? 'animate-slide-up' : ''}`}>
        {content.headline}
      </h2>
      <p className={`text-xl text-blue-100 mb-10 ${isActive ? 'animate-fade-in delay-100' : ''}`}>
        {content.subheadline}
      </p>
      
      {/* Buttons */}
      <div className={`flex items-center justify-center gap-4 mb-8 ${isActive ? 'animate-bounce-in delay-200' : ''}`}>
        <button className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all">
          {content.primaryCTA.text}
          {getIcon(content.primaryCTA.icon, "w-5 h-5")}
        </button>
        <button className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">
          {getIcon(content.secondaryCTA.icon, "w-5 h-5")}
          {content.secondaryCTA.text}
        </button>
      </div>
      
      {/* Urgency */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 ${isActive ? 'animate-fade-in delay-300' : ''}`}>
        <Clock className="w-4 h-4 text-amber-300" />
        <span className="text-amber-200 text-sm">{content.urgency}</span>
      </div>
    </div>
  </div>
);

// ============================================
// SLIDE COMPONENT MAPPING
// ============================================
const slideComponents = {
  HeroSlide,
  ProblemSlide,
  SolutionSlide,
  StatsSlide,
  ComparisonSlide,
  ProcessSlide,
  TestimonialSlide,
  PricingSlide,
  CTASlide
};

// ============================================
// AI PRESENTER COMPONENT
// ============================================
const AIPresenter = ({ presenter, narration, isPlaying }) => {
  const avatarGradients = {
    'professional-female': 'from-blue-500 to-indigo-600',
    'professional-male': 'from-slate-600 to-slate-700',
    'friendly-female': 'from-pink-500 to-rose-600',
    'friendly-male': 'from-emerald-500 to-teal-600'
  };
  
  return (
    <div className="bg-slate-900 border-t border-slate-700 p-4">
      <div className="flex items-start gap-4 max-w-4xl mx-auto">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradients[presenter.avatarStyle]} flex items-center justify-center text-white font-bold text-xl`}>
            {presenter.name[0]}
          </div>
          {/* Speaking indicator */}
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Info and narration */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">{presenter.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-sm">{presenter.role}</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {narration}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PRESENTATION PLAYER
// ============================================
export default function FibonaccoPresentationPlayer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const presentation = samplePresentation;
  const totalSlides = presentation.slides.length;
  const slide = presentation.slides[currentSlide];
  
  // Get the component for current slide
  const SlideComponent = slideComponents[slide.component];
  
  // Navigation
  const goToSlide = (index) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  };
  
  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);
  
  // Auto-advance when playing (simplified - would sync with audio in production)
  useEffect(() => {
    if (isPlaying && currentSlide < totalSlides - 1) {
      const timer = setTimeout(nextSlide, 8000); // 8 seconds per slide
      return () => clearTimeout(timer);
    }
    if (currentSlide === totalSlides - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentSlide]);
  
  // Speak narration (browser TTS for demo)
  useEffect(() => {
    if (isPlaying && !isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(slide.narration);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis?.cancel();
    }
    
    return () => window.speechSynthesis?.cancel();
  }, [currentSlide, isPlaying, isMuted]);
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{presentation.meta.title}</div>
            <div className="text-slate-400 text-xs">{presentation.meta.targetAudience}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowControls(!showControls)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Slide area */}
      <div className="relative aspect-video bg-slate-900">
        {SlideComponent && (
          <SlideComponent 
            content={slide.content} 
            isActive={true}
          />
        )}
        
        {/* Slide number overlay */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>
      
      {/* AI Presenter */}
      <AIPresenter 
        presenter={presentation.presenter}
        narration={slide.narration}
        isPlaying={isPlaying}
      />
      
      {/* Controls */}
      {showControls && (
        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-700">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {presentation.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-6 bg-blue-500' 
                    : index < currentSlide 
                      ? 'bg-blue-500/50' 
                      : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          
          {/* Main controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => goToSlide(0)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button 
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          
          {/* CTA */}
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
            Start Free Trial
          </button>
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.5s ease-out forwards; }
        .animate-slide-left { animation: slide-left 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
}
