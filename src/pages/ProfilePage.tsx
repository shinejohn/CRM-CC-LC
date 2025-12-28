import React, { useState } from 'react';
import { NavigationMenu } from '../components/NavigationMenu';
import { FileExplorer } from '../components/FileExplorer';
import { UserIcon, SettingsIcon, BellIcon, KeyIcon, LogOutIcon, CameraIcon, EditIcon, SaveIcon, MailIcon, PhoneIcon, GlobeIcon, ClockIcon, FolderIcon, VideoIcon, FileIcon, BriefcaseIcon } from 'lucide-react';
export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  // TODO: Connect to real API endpoint for user data
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    location: '',
    timezone: '',
    bio: '',
    profilePicture: ''
  });
  const [formData, setFormData] = useState({
    ...userData
  });
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSave = () => {
    setUserData({
      ...formData
    });
    setIsEditing(false);
  };
  const handleCancel = () => {
    setFormData({
      ...userData
    });
    setIsEditing(false);
  };
  // TODO: Connect to real API endpoint for activity data
  const activityData: Array<{ id: number; type: string; title: string; date: string; duration?: string }> = [];
  return <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My Profile</h1>
        <div className="flex space-x-2 items-center">
          <button className="p-2 rounded-full hover:bg-gray-700">
            <BellIcon size={20} />
          </button>
          <NavigationMenu />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-64">
              <div className="bg-white shadow rounded-lg overflow-hidden sticky top-8">
                <div className="p-6 text-center">
                  <div className="relative inline-block">
                    <img src={userData.profilePicture} alt="Profile" className="h-24 w-24 rounded-full mx-auto object-cover" />
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full">
                      <CameraIcon size={16} />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-bold">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {userData.role} at {userData.company}
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <nav className="flex flex-col">
                    <button className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setActiveTab('profile')}>
                      <UserIcon size={18} className="mr-3" />
                      Profile Information
                    </button>
                    <button className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'files' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setActiveTab('files')}>
                      <FolderIcon size={18} className="mr-3" />
                      My Files
                    </button>
                    <button className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'activity' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setActiveTab('activity')}>
                      <ClockIcon size={18} className="mr-3" />
                      Recent Activity
                    </button>
                    <button className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setActiveTab('settings')}>
                      <SettingsIcon size={18} className="mr-3" />
                      Account Settings
                    </button>
                    <button className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setActiveTab('security')}>
                      <KeyIcon size={18} className="mr-3" />
                      Security
                    </button>
                  </nav>
                </div>
                <div className="p-6 border-t border-gray-200">
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                    <LogOutIcon size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
            {/* Main content */}
            <div className="flex-1">
              {activeTab === 'profile' && <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">Profile Information</h2>
                    {isEditing ? <div className="flex space-x-2">
                        <button onClick={handleSave} className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm flex items-center">
                          <SaveIcon size={14} className="mr-1" />
                          Save
                        </button>
                        <button onClick={handleCancel} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm">
                          Cancel
                        </button>
                      </div> : <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center">
                        <EditIcon size={14} className="mr-1" />
                        Edit
                      </button>}
                  </div>
                  <div className="p-6">
                    {isEditing ? <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First name
                            </label>
                            <div className="mt-1">
                              <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last name
                            </label>
                            <div className="mt-1">
                              <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="mt-1">
                              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <div className="mt-1">
                              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                              Company
                            </label>
                            <div className="mt-1">
                              <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                              Job title
                            </label>
                            <div className="mt-1">
                              <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                              Location
                            </label>
                            <div className="mt-1">
                              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                              Timezone
                            </label>
                            <div className="mt-1">
                              <select id="timezone" name="timezone" value={formData.timezone} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                                <option>Pacific Time (PT)</option>
                                <option>Mountain Time (MT)</option>
                                <option>Central Time (CT)</option>
                                <option>Eastern Time (ET)</option>
                              </select>
                            </div>
                          </div>
                          <div className="sm:col-span-6">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                              Bio
                            </label>
                            <div className="mt-1">
                              <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              Brief description for your profile.
                            </p>
                          </div>
                        </div>
                      </div> : <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Personal Information
                          </h3>
                          <dl className="mt-2 divide-y divide-gray-200">
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <MailIcon size={16} className="mr-2" />
                                Email
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.email}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <PhoneIcon size={16} className="mr-2" />
                                Phone
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.phone}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <BriefcaseIcon size={16} className="mr-2" />
                                Company
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.company}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <UserIcon size={16} className="mr-2" />
                                Job title
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.role}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <GlobeIcon size={16} className="mr-2" />
                                Location
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.location}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <ClockIcon size={16} className="mr-2" />
                                Timezone
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {userData.timezone}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Bio
                          </h3>
                          <div className="mt-2 text-sm text-gray-900">
                            <p>{userData.bio}</p>
                          </div>
                        </div>
                      </div>}
                  </div>
                </div>}
              {activeTab === 'files' && <div className="h-[calc(100vh-200px)]">
                  <FileExplorer isPersonal={true} />
                </div>}
              {activeTab === 'activity' && <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium">Recent Activity</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {activityData.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>No recent activity. Connect to API to view activity data.</p>
                      </div>
                    ) : (
                      activityData.map(activity => <div key={activity.id} className="p-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${activity.type === 'call' ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {activity.type === 'call' ? <VideoIcon size={16} className={`${activity.type === 'call' ? 'text-green-600' : 'text-blue-600'}`} /> : <FileIcon size={16} className="text-blue-600" />}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">
                                {activity.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {activity.date}
                              </p>
                            </div>
                            {activity.duration && <p className="mt-1 text-sm text-gray-500">
                                Duration: {activity.duration}
                              </p>}
                          </div>
                        </div>
                      </div>)
                    )}
                  </div>
                </div>}
              {activeTab === 'settings' && <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium">Account Settings</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-500">
                      Account settings content will go here.
                    </p>
                  </div>
                </div>}
              {activeTab === 'security' && <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium">Security</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-500">
                      Security settings content will go here.
                    </p>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};