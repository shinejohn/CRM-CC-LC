import React from 'react';
import { Megaphone, BarChart3, MousePointer2, Eye, TrendingUp, PauseCircle, PlayCircle, MoreHorizontal } from 'lucide-react';
interface AdServiceViewProps {
  service: any;
  onAction: (action: string, item: any) => void;
}
export function AdServiceView({
  service,
  onAction
}: AdServiceViewProps) {
  const metrics = [{
    label: 'Impressions',
    value: '45.2k',
    change: '+12%',
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }, {
    label: 'Clicks',
    value: '1,205',
    change: '+5%',
    icon: MousePointer2,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  }, {
    label: 'CTR',
    value: '2.4%',
    change: '-1%',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50'
  }];
  return <div className="space-y-8">
      {/* Performance Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Overview
          </h3>
          <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric, idx) => <div key={metric.label} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${metric.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </div>)}
        </div>
      </section>

      {/* Active Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-500" />
            Active Campaigns
          </h3>
          <button onClick={() => onAction('add', {
          type: 'campaign'
        })} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + New Campaign
          </button>
        </div>

        <div className="space-y-4">
          {[{
          name: 'Fall Promotion 2024',
          status: 'active',
          budget: '$500/day',
          spend: '$3,420'
        }, {
          name: 'Brand Awareness Q4',
          status: 'paused',
          budget: '$200/day',
          spend: '$1,200'
        }].map((campaign, idx) => <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                    {/* Placeholder for ad creative */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                      Ad Creative Preview
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {campaign.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-500 mt-2">
                      <div>
                        Budget:{' '}
                        <span className="text-gray-900 font-medium">
                          {campaign.budget}
                        </span>
                      </div>
                      <div>
                        Total Spend:{' '}
                        <span className="text-gray-900 font-medium">
                          {campaign.spend}
                        </span>
                      </div>
                      <div>
                        Platform:{' '}
                        <span className="text-gray-900 font-medium">
                          Google Ads
                        </span>
                      </div>
                      <div>
                        Ends:{' '}
                        <span className="text-gray-900 font-medium">
                          Nov 30
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => onAction('toggle', campaign)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={campaign.status === 'active' ? 'Pause' : 'Resume'}>
                    {campaign.status === 'active' ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </button>
                  <button onClick={() => onAction('edit', campaign)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>)}
        </div>
      </section>
    </div>;
}