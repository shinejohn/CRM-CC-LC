import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, Users, DollarSign, Gift, CheckCircle2, AlertCircle, Cake } from 'lucide-react';
interface LogVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function LogVisitModal({
  isOpen,
  onClose
}: LogVisitModalProps) {
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [awardPoints, setAwardPoints] = useState(true);
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">📝 Log Visit</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Guest Search */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Guest
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by name, phone, or email..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 py-1">
                  Quick Select:
                </span>
                <button onClick={() => setSelectedGuest('sarah')} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedGuest === 'sarah' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Sarah M. 💎
                </button>
                <button onClick={() => setSelectedGuest('mike')} className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  Mike T. 🥇
                </button>
                <button className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  + New Guest
                </button>
              </div>
            </div>

            {selectedGuest === 'sarah' && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">
                      Selected: Sarah Mitchell (💎 VIP)
                    </p>
                    <p className="text-sm text-slate-500">
                      Last visit: 8 days ago | Points: 340
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-bold">
                    <Cake className="w-3 h-3" /> Birthday in 2 days!
                  </div>
                </div>
              </motion.div>}

            {/* Visit Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase">
                  Visit Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase">
                  Party Size
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={partySize} onChange={e => setPartySize(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white">
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map(n => <option key={n} value={n}>
                        {n}
                      </option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500 uppercase">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase">
                Notes (Optional)
              </label>
              <textarea placeholder="Any special requests or notes about this visit..." className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none" />
            </div>

            {/* Loyalty Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={awardPoints} onChange={e => setAwardPoints(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">
                  Award loyalty points{' '}
                  {amount ? `(${Math.floor(Number(amount))} pts)` : ''}
                </span>
              </label>

              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-slate-400" />
                <select className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500">
                  <option value="">Select reward redeemed (optional)...</option>
                  <option value="dessert">Free Dessert (50 pts)</option>
                  <option value="appetizer">Free Appetizer (100 pts)</option>
                  <option value="discount">$10 Off (150 pts)</option>
                </select>
              </div>

              {selectedGuest === 'sarah' && <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-sm text-purple-800">
                    <Cake className="w-4 h-4" />
                    <span>It's Sarah's birthday! Free dessert available.</span>
                  </div>
                  <button className="text-xs font-bold text-purple-700 hover:underline">
                    Apply Reward
                  </button>
                </div>}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Log Visit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}