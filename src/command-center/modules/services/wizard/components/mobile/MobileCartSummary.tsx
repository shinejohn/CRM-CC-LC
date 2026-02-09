import React, { useState } from 'react';
import { ShoppingCart, ChevronUp, ChevronDown, X } from 'lucide-react';
import { CartItem } from '../../types';
import { PriceDisplay } from '../shared';

interface MobileCartSummaryProps {
    items: CartItem[];
    currentStep: number;
}

export const MobileCartSummary: React.FC<MobileCartSummaryProps> = ({ items, currentStep }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (items.length === 0) return null;

    // Calculate totals
    const monthlyTotal = items
        .filter(i => i.billingFrequency === 'monthly')
        .reduce((sum, i) => sum + i.price, 0);

    const oneTimeTotal = items
        .filter(i => i.billingFrequency === 'one-time')
        .reduce((sum, i) => sum + i.price, 0);

    return (
        <>
            {/* Sticky Footer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden z-50">
                <div className="flex items-center justify-between p-4">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="relative">
                            <ShoppingCart className="text-indigo-600" size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {items.length}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">
                                Total: <PriceDisplay amount={monthlyTotal} frequency="monthly" minimal />
                                {oneTimeTotal > 0 && <span className="text-gray-500 text-xs ml-1">(+${oneTimeTotal} one-time)</span>}
                            </p>
                            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                {isOpen ? 'Hide details' : 'View details'}
                                {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </p>
                        </div>
                    </div>

                    <button
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform"
                        onClick={() => {
                            // This would typically trigger the "Next" action from the parent, 
                            // but for now strictly visual as per scope. Parent handles main nav.
                            // Ideally this button mimics the main "Continue" button action.
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>

            {/* Expanded Details Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)}>
                    <div
                        className="absolute bottom-[72px] left-0 right-0 bg-white rounded-t-xl p-4 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-gray-900">Cart Summary</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={`${item.serviceId}-${idx}`} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{item.serviceName}</p>
                                        <p className="text-xs text-gray-500 capitalize">{item.billingFrequency}</p>
                                    </div>
                                    <div className="font-semibold text-sm text-gray-900">
                                        ${item.price}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Monthly Recurring</span>
                                <span className="font-bold text-indigo-600">${monthlyTotal}/mo</span>
                            </div>
                            {oneTimeTotal > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">One-time Due</span>
                                    <span className="font-bold text-gray-900">${oneTimeTotal}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
