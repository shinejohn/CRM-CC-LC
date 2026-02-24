import { ArrowRight, Wallet, Target, List, Eye, Megaphone, Calendar, Tag, Ticket, Scale } from 'lucide-react';

export function CommerceHubPage() {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            {/* Header */}
            <header className="flex-none px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Promote & Advertise
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-medium tracking-wide flex items-center gap-1.5 border border-blue-200 dark:border-blue-800">
                                <Target className="w-3.5 h-3.5" />
                                Community Sponsor
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage all your paid promotions, listings, and campaigns.
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide uppercase">Spend This Month</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">$247.50</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide uppercase">Active Campaigns</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">2</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <List className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide uppercase">Active Listings</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">3</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 mb-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <Eye className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide uppercase">Impressions</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">12,450</div>
                    </div>
                </div>

                {/* Quick Create Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Create</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <button className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all shadow-sm group">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm text-center">Ad Campaign</span>
                        </button>
                        <button className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all shadow-sm group">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm text-center">Announcement</span>
                        </button>
                        <button className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all shadow-sm group">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                                <Tag className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm text-center">Classified</span>
                        </button>
                        <button className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-amber-500 hover:ring-1 hover:ring-amber-500 transition-all shadow-sm group">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-3">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm text-center">Coupon</span>
                        </button>
                        <button className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-slate-500 hover:ring-1 hover:ring-slate-500 transition-all shadow-sm group">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform mb-3">
                                <Scale className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm text-center">Legal Notice</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Campaigns List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Campaigns</h2>
                            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">Summer Promotion 2026</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Running until Sep 1
                                    </span>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                    Ad Campaign
                                </span>
                            </div>

                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Spend: $145.00</span>
                                    <span className="text-gray-900 dark:text-white font-medium">Budget: $500.00</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '29%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">Clearwater Job Posting</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Expires in 14 days
                                    </span>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                    Classified
                                </span>
                            </div>
                            <div className="mt-5 flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Featured Placement</span>
                                <span className="text-gray-900 dark:text-white font-medium">$19.99 paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Spend Breakdown */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Spend Breakdown</h2>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
                            {/* Very simple mock chart visualization */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="20" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="20" strokeDasharray="145 251" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="50 251" strokeDashoffset="-145" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="52.5 251" strokeDashoffset="-195" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">$247.50</span>
                                        <span className="text-xs text-gray-500">Total</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                        <span className="text-gray-600 dark:text-gray-400">Ad Campaigns</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">$145.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                        <span className="text-gray-600 dark:text-gray-400">Classifieds</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">$50.00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                        <span className="text-gray-600 dark:text-gray-400">Coupons</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">$52.50</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
