import React from 'react';
import { Mail, MousePointer, ExternalLink, ArrowUpRight } from 'lucide-react';
interface EmailAdServiceViewProps {
  service: any;
}
export function EmailAdServiceView({
  service
}: EmailAdServiceViewProps) {
  return <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
          <div className="text-blue-600 mb-2">
            <Mail className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-slate-900">24.8%</div>
          <div className="text-sm text-slate-600 font-medium">
            Average Open Rate
          </div>
          <div className="text-xs text-blue-600 mt-2 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> 2.4% vs industry avg
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
          <div className="text-purple-600 mb-2">
            <MousePointer className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-slate-900">4.2%</div>
          <div className="text-sm text-slate-600 font-medium">
            Click-Through Rate
          </div>
          <div className="text-xs text-purple-600 mt-2 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> 1.1% vs industry avg
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
          <div className="text-green-600 mb-2">
            <ExternalLink className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-slate-900">1,205</div>
          <div className="text-sm text-slate-600 font-medium">Total Clicks</div>
          <div className="text-xs text-green-600 mt-2 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +154 this week
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Campaigns
        </h3>
        {[{
        subject: 'October Newsletter - Top Stories',
        sent: 'Oct 15, 2023',
        open: '28%',
        click: '5.2%',
        status: 'Sent'
      }, {
        subject: 'Special Offer: 50% Off Annual Plans',
        sent: 'Oct 10, 2023',
        open: '22%',
        click: '3.8%',
        status: 'Sent'
      }, {
        subject: 'Community Highlights & Events',
        sent: 'Oct 01, 2023',
        open: '25%',
        click: '4.1%',
        status: 'Sent'
      }].map((campaign, i) => <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {campaign.status}
                </span>
                <span className="text-xs text-slate-500">{campaign.sent}</span>
              </div>
              <h4 className="font-medium text-slate-900 mt-1">
                {campaign.subject}
              </h4>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm font-bold text-slate-900">
                  {campaign.open}
                </div>
                <div className="text-xs text-slate-500">Open Rate</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-slate-900">
                  {campaign.click}
                </div>
                <div className="text-xs text-slate-500">Click Rate</div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Report
              </button>
            </div>
          </div>)}
      </div>
    </div>;
}