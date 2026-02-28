import React from 'react';
import { Tag, RefreshCw, Clock, BarChart3 } from 'lucide-react';
interface CouponServiceViewProps {
  service: any;
}
export function CouponServiceView({
  service
}: CouponServiceViewProps) {
  return <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Active Coupons
          </div>
          <div className="text-2xl font-bold text-slate-900">4</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Redemptions
          </div>
          <div className="text-2xl font-bold text-slate-900">843</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Conversion Rate
          </div>
          <div className="text-2xl font-bold text-slate-900">12.5%</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Revenue Gen
          </div>
          <div className="text-2xl font-bold text-slate-900">$4.2k</div>
        </div>
      </div>

      {/* Active Coupons List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Active Campaigns</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[{
          name: 'Summer Sale 20%',
          code: 'SUMMER20',
          used: 450,
          total: 1000,
          expires: '2 days'
        }, {
          name: 'New Customer Welcome',
          code: 'WELCOME10',
          used: 120,
          total: 500,
          expires: '15 days'
        }, {
          name: 'Flash Deal',
          code: 'FLASH50',
          used: 45,
          total: 50,
          expires: '4 hours'
        }].map((coupon, i) => <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{coupon.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <code className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-600 border border-slate-200">
                      {coupon.code}
                    </code>
                    <span className="text-sm text-slate-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Expires in{' '}
                      {coupon.expires}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">
                  {coupon.used} / {coupon.total} used
                </div>
                <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{
                width: `${coupon.used / coupon.total * 100}%`
              }} />
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}