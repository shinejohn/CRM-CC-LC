import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Award, Gift, TrendingUp, Users, DollarSign } from 'lucide-react';
export function LoyaltyProgramPage() {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ⭐ Loyalty Program
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span>Type: Points & Tiers</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-emerald-600 font-medium">Status: Active</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>Members: 423</span>
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
          <Edit className="w-4 h-4" /> Edit Program Rules
        </button>
      </div>

      {/* Program Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Program Performance (Last 30 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">New Members</p>
            <p className="text-2xl font-bold text-slate-900 text-emerald-600">
              +45
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Active Members</p>
            <p className="text-2xl font-bold text-slate-900">
              312{' '}
              <span className="text-sm font-normal text-slate-500">(74%)</span>
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Rewards Redeemed</p>
            <p className="text-2xl font-bold text-slate-900">
              47{' '}
              <span className="text-sm font-normal text-slate-500">($470)</span>
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Member Revenue</p>
            <p className="text-2xl font-bold text-slate-900">$12,400</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-800 font-medium flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insight: Members spend 2.3x more than non-members on average
          </p>
        </div>
      </div>

      {/* Tier Structure */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Tier Structure
          </h3>
          <button className="text-xs font-medium text-blue-600 hover:underline">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{
          name: 'Bronze',
          icon: '🥉',
          req: '1-2 visits',
          members: 245,
          benefits: ['Earn 1 point per $1', 'Birthday reward']
        }, {
          name: 'Silver',
          icon: '🥈',
          req: '3-5 visits',
          members: 112,
          benefits: ['Earn 1.5 points per $1', '5% off all visits', 'Birthday reward']
        }, {
          name: 'Gold',
          icon: '🥇',
          req: '6-10 visits',
          members: 48,
          benefits: ['Earn 2 points per $1', '10% off all visits', 'Birthday reward + appetizer']
        }, {
          name: 'VIP',
          icon: '💎',
          req: '11+ visits',
          members: 18,
          benefits: ['Earn 2.5 points per $1', '10% off + priority', 'Birthday reward + dessert', 'Exclusive events']
        }].map((tier, i) => <div key={i} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{tier.name}</h4>
                    <p className="text-xs text-slate-500">{tier.req}</p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {tier.members} members
                </span>
              </div>
              <ul className="space-y-1">
                {tier.benefits.map((benefit, j) => <li key={j} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    {benefit}
                  </li>)}
              </ul>
            </div>)}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Available Rewards
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {[{
          name: 'Free Dessert',
          cost: '50 points',
          redeemed: 23
        }, {
          name: 'Free Appetizer',
          cost: '100 points',
          redeemed: 12
        }, {
          name: '$10 Off Next Visit',
          cost: '150 points',
          redeemed: 8
        }, {
          name: 'Free Entrée',
          cost: '300 points',
          redeemed: 4
        }].map((reward, i) => <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded text-purple-600">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{reward.name}</p>
                  <p className="text-sm text-slate-500">{reward.cost}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  Redeemed: {reward.redeemed} times
                </span>
                <button className="text-xs font-medium text-blue-600 hover:underline">
                  Edit
                </button>
              </div>
            </div>)}
        </div>
      </div>
    </motion.div>;
}