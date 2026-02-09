import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit2, Camera, Save, X, Check, Crown, LayoutDashboard, Home, Linkedin, Twitter, Github, Instagram, Facebook, Globe, CheckSquare, Building2, Users, Plus, UserCheck, Upload, Settings, Sparkles, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  isHumanAssistant?: boolean;
}
interface ProfilePageProps {
  onOpenSetup?: () => void;
  onNavigateToSubscribe?: () => void;
  onNavigateToConfigurator?: () => void;
}
export function ProfilePage({
  onOpenSetup,
  onNavigateToSubscribe,
  onNavigateToConfigurator
}: ProfilePageProps) {
  const {
    isDarkMode
  } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false); // Track if business is configured
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    company: 'ABC Home Services',
    role: 'Business Owner',
    bio: 'Running a successful home services business with Urpa Command Center. Focused on efficiency, customer satisfaction, and team coordination.',
    joinDate: 'January 2024',
    taskManagerName: '@johndoe',
    profileImage: '',
    avatarInitials: 'JD',
    socialLinks: {
      linkedin: 'linkedin.com/in/johndoe',
      twitter: 'twitter.com/johndoe',
      github: 'github.com/johndoe',
      instagram: 'instagram.com/johndoe',
      facebook: 'facebook.com/johndoe',
      website: 'johndoe.com'
    },
    business: {
      name: 'ABC Home Services',
      logo: '',
      industry: 'Home Services',
      size: '10-50 employees',
      founded: '2020',
      website: 'abchomeservices.com',
      email: 'contact@abchomeservices.com',
      phone: '+1 (555) 987-6543',
      address: '456 Business Ave, Suite 100, New York, NY 10002',
      description: 'Professional home services company providing quality solutions to residential and commercial clients.'
    }
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{
    id: '1',
    name: 'Sarah Johnson',
    role: 'Executive Assistant',
    email: 'sarah@abchomeservices.com',
    avatar: 'SJ',
    isHumanAssistant: true
  }, {
    id: '2',
    name: 'Mike Chen',
    role: 'Operations Manager',
    email: 'mike@abchomeservices.com',
    avatar: 'MC'
  }, {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Customer Success',
    email: 'emily@abchomeservices.com',
    avatar: 'ER'
  }]);
  const stats = [{
    label: 'Tasks Completed',
    value: '1,247',
    icon: Check,
    color: 'text-emerald-400'
  }, {
    label: 'Active Services',
    value: '24',
    icon: Briefcase,
    color: 'text-blue-400'
  }, {
    label: 'Team Members',
    value: '12',
    icon: Users,
    color: 'text-cyan-400'
  }, {
    label: 'Days Active',
    value: '89',
    icon: Calendar,
    color: 'text-amber-400'
  }];
  const socialNetworks = [{
    key: 'linkedin',
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'text-blue-500'
  }, {
    key: 'twitter',
    icon: Twitter,
    label: 'Twitter',
    color: 'text-sky-400'
  }, {
    key: 'github',
    icon: Github,
    label: 'GitHub',
    color: 'text-slate-300'
  }, {
    key: 'instagram',
    icon: Instagram,
    label: 'Instagram',
    color: 'text-pink-500'
  }, {
    key: 'facebook',
    icon: Facebook,
    label: 'Facebook',
    color: 'text-blue-600'
  }, {
    key: 'website',
    icon: Globe,
    label: 'Website',
    color: 'text-cyan-400'
  }];
  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving profile:', profileData);
  };
  const handleImageUpload = (type: 'profile' | 'avatar' | 'businessLogo') => {
    console.log(`Uploading ${type} image...`);
  };
  const handleUpgradePlan = () => {
    if (onNavigateToSubscribe) {
      onNavigateToSubscribe();
    } else {
      console.log('Navigate to subscribe page');
    }
  };
  return <div className={`min-h-screen w-full ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} py-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Logo Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Urpa
            </span>
          </div>
          <p className="text-cyan-500 text-base font-semibold tracking-wide">
            Command Center
          </p>
        </motion.div>

        {/* Header Card */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 shadow-xl overflow-hidden mb-6`}>
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 relative">
            <button className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
              {/* Profile Image & Avatar */}
              <div className="flex gap-4">
                {/* Main Profile Image */}
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold border-4 ${isDarkMode ? 'border-slate-800' : 'border-white'} shadow-xl overflow-hidden`}>
                    {profileData.profileImage ? <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" /> : profileData.avatarInitials}
                  </div>
                  <button onClick={() => handleImageUpload('profile')} className="absolute bottom-2 right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative group">
                  <div className={`w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 ${isDarkMode ? 'border-slate-800' : 'border-white'} shadow-xl`}>
                    {profileData.avatarInitials}
                  </div>
                  <button onClick={() => handleImageUpload('avatar')} className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors shadow-lg">
                    <Camera className="h-3 w-3" />
                  </button>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-center mt-1`}>
                    Avatar
                  </p>
                </div>
              </div>

              {/* Name & Actions */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                      {profileData.name}
                    </h1>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                      {profileData.role} at {profileData.company}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Professional Plan
                      </div>
                      <div className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-700'} text-xs font-bold flex items-center gap-1`}>
                        <CheckSquare className="h-3 w-3" />
                        {profileData.taskManagerName}
                      </div>
                    </div>
                  </div>
                  <motion.button whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${isEditing ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' : isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {isEditing ? <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </> : <>
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </>}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return <motion.div key={stat.label} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2 + idx * 0.05
              }} className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50 border-blue-200'} border-2`}>
                    <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {stat.label}
                    </p>
                  </motion.div>;
            })}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Profile Information */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3
          }} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <User className="h-5 w-5" />
                  Personal Profile
                </h2>
                {isEditing && <button onClick={() => setIsEditing(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>
                    <X className="h-5 w-5" />
                  </button>}
              </div>

              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Bio
                  </label>
                  {isEditing ? <textarea value={profileData.bio} onChange={e => setProfileData({
                  ...profileData,
                  bio: e.target.value
                })} rows={3} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      {profileData.bio}
                    </p>}
                </div>

                {/* Task Manager Name */}
                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    <CheckSquare className="inline h-4 w-4 mr-1" />
                    Task Manager Username
                  </label>
                  {isEditing ? <input type="text" value={profileData.taskManagerName} onChange={e => setProfileData({
                  ...profileData,
                  taskManagerName: e.target.value
                })} placeholder="@username" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      {profileData.taskManagerName}
                    </p>}
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    {isEditing ? <input type="email" value={profileData.email} onChange={e => setProfileData({
                    ...profileData,
                    email: e.target.value
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.email}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone
                    </label>
                    {isEditing ? <input type="tel" value={profileData.phone} onChange={e => setProfileData({
                    ...profileData,
                    phone: e.target.value
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.phone}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <MapPin className="inline h-4 w-4 mr-1" />
                      City, State
                    </label>
                    {isEditing ? <input type="text" value={profileData.location} onChange={e => setProfileData({
                    ...profileData,
                    location: e.target.value
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.location}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Briefcase className="inline h-4 w-4 mr-1" />
                      Role
                    </label>
                    {isEditing ? <input type="text" value={profileData.role} onChange={e => setProfileData({
                    ...profileData,
                    role: e.target.value
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.role}
                      </p>}
                  </div>
                </div>

                {/* Physical Address */}
                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    <Home className="inline h-4 w-4 mr-1" />
                    Physical Address
                  </label>
                  {isEditing ? <input type="text" value={profileData.address} onChange={e => setProfileData({
                  ...profileData,
                  address: e.target.value
                })} placeholder="Street address, apartment, city, state, zip" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      {profileData.address}
                    </p>}
                </div>
              </div>
            </motion.div>

            {/* Business Profile */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.4
          }} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Building2 className="h-5 w-5" />
                  Business Profile
                </h2>
              </div>

              {/* Business Configurator CTA - Prominent placement */}
              {!isConfigured && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className={`mb-6 p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'} relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          🎯 Unlock Your Custom Experience
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                          Tell us how your business operates and we'll customize
                          your dashboard, AI recommendations, and features to
                          match your workflow perfectly.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Smart Features
                          </span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Get tools that match your business type
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            AI Recommendations
                          </span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Personalized automation suggestions
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="h-4 w-4 text-blue-500" />
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Custom Dashboard
                          </span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Widgets tailored to your operations
                        </p>
                      </div>
                    </div>

                    <motion.button whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => {
                  if (onNavigateToConfigurator) {
                    onNavigateToConfigurator();
                  } else {
                    console.log('Navigate to Business Configurator');
                  }
                }} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all">
                      <Sparkles className="h-5 w-5" />
                      Configure Your Business Now
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>

                    <p className={`text-xs text-center mt-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      ⏱️ Takes only 2-3 minutes • Change anytime in Settings
                    </p>
                  </div>
                </motion.div>}

              {/* Business Logo */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3`}>
                  Business Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className={`w-24 h-24 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold border-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} shadow-lg overflow-hidden`}>
                      {profileData.business.logo ? <img src={profileData.business.logo} alt="Business Logo" className="w-full h-full object-cover" /> : <Building2 className="h-10 w-10" />}
                    </div>
                    <button onClick={() => handleImageUpload('businessLogo')} className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg">
                      <Camera className="h-3 w-3" />
                    </button>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Upload your company logo
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
                      Recommended: 500x500px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      Company Name
                    </label>
                    {isEditing ? <input type="text" value={profileData.business.name} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      name: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.name}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      Industry
                    </label>
                    {isEditing ? <input type="text" value={profileData.business.industry} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      industry: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.industry}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      Company Size
                    </label>
                    {isEditing ? <input type="text" value={profileData.business.size} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      size: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.size}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      Founded
                    </label>
                    {isEditing ? <input type="text" value={profileData.business.founded} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      founded: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.founded}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Globe className="inline h-4 w-4 mr-1" />
                      Website
                    </label>
                    {isEditing ? <input type="text" value={profileData.business.website} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      website: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <a href={`https://${profileData.business.website}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                        {profileData.business.website}
                      </a>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Mail className="inline h-4 w-4 mr-1" />
                      Business Email
                    </label>
                    {isEditing ? <input type="email" value={profileData.business.email} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      email: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.email}
                      </p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      <Phone className="inline h-4 w-4 mr-1" />
                      Business Phone
                    </label>
                    {isEditing ? <input type="tel" value={profileData.business.phone} onChange={e => setProfileData({
                    ...profileData,
                    business: {
                      ...profileData.business,
                      phone: e.target.value
                    }
                  })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                        {profileData.business.phone}
                      </p>}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    <Home className="inline h-4 w-4 mr-1" />
                    Business Address
                  </label>
                  {isEditing ? <input type="text" value={profileData.business.address} onChange={e => setProfileData({
                  ...profileData,
                  business: {
                    ...profileData.business,
                    address: e.target.value
                  }
                })} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      {profileData.business.address}
                    </p>}
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    Company Description
                  </label>
                  {isEditing ? <textarea value={profileData.business.description} onChange={e => setProfileData({
                  ...profileData,
                  business: {
                    ...profileData.business,
                    description: e.target.value
                  }
                })} rows={3} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none`} /> : <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      {profileData.business.description}
                    </p>}
                </div>
              </div>
            </motion.div>

            {/* Team Members */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.5
          }} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Users className="h-5 w-5" />
                  Team Members
                </h2>
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white transition-colors text-sm font-semibold shadow-lg">
                  <Plus className="h-4 w-4" />
                  Add Member
                </motion.button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member, idx) => <motion.div key={member.id} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.6 + idx * 0.05
              }} className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-blue-50 border-blue-200 hover:border-blue-300'} border-2 transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {member.name}
                          </p>
                          {member.isHumanAssistant && <div className={`px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'} text-xs font-bold flex items-center gap-1`}>
                              <UserCheck className="h-3 w-3" />
                              Human Assistant
                            </div>}
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {member.role}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'} transition-colors`}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </motion.div>)}
              </div>
            </motion.div>

            {/* Social Networks */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.6
          }} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-8`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>
                Social Networks
              </h2>
              <div className="space-y-4">
                {socialNetworks.map(social => {
                const Icon = social.icon;
                return <div key={social.key}>
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                        <Icon className={`inline h-4 w-4 mr-1 ${social.color}`} />
                        {social.label}
                      </label>
                      {isEditing ? <input type="text" value={profileData.socialLinks[social.key as keyof typeof profileData.socialLinks]} onChange={e => setProfileData({
                    ...profileData,
                    socialLinks: {
                      ...profileData.socialLinks,
                      [social.key]: e.target.value
                    }
                  })} placeholder={`${social.label.toLowerCase()}.com/username`} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} /> : <a href={`https://${profileData.socialLinks[social.key as keyof typeof profileData.socialLinks]}`} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}>
                          {profileData.socialLinks[social.key as keyof typeof profileData.socialLinks]}
                        </a>}
                    </div>;
              })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.4
        }} className="space-y-6">
            {/* Account Info */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
                Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Member since
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {profileData.joinDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Plan
                  </span>
                  <span className="text-sm font-semibold text-blue-500">
                    Professional
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </span>
                  <span className="text-sm font-semibold text-emerald-500">
                    Active
                  </span>
                </div>
              </div>

              <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={handleUpgradePlan} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                <Crown className="h-5 w-5" />
                Upgrade Plan
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Integration Setup Button */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Integrations
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Manage your connections
                  </p>
                </div>
              </div>

              <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={onOpenSetup} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="h-5 w-5" />
                Configure Integrations
              </motion.button>

              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-3 text-center`}>
                Set up email, contacts, messaging, and more
              </p>
            </div>

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl border-2 p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition-colors`}>
                  Change Password
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition-colors`}>
                  Privacy Settings
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition-colors`}>
                  Download Data
                </button>
                <button className={`w-full text-left px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'} transition-colors`}>
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}