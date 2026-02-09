import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../../types';
import { PriceDisplay } from './PriceDisplay';

interface CartSidebarProps {
    items: CartItem[];
    currentStep: number;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ items, currentStep }) => {
    if (currentStep === 1) return null; // Hide on first step

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const bundleThreshold = 200; // Example threshold
    const isNearBundle = subtotal > 150 && subtotal < bundleThreshold;
    const isOverBundle = subtotal >= bundleThreshold;

    return (
        <div className="bg-white border rounded-lg shadow-sm sticky top-6">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Your Cart</h3>
            </div>

            <div className="p-4 space-y-4">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm italic text-center py-4">
                        Your cart is empty. Select services to get started.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={`${item.serviceId}-${index}`} className="flex justify-between items-start text-sm">
                                <div>
                                    <div className="font-medium text-gray-900">{item.serviceName}</div>
                                    {item.isAddOn && (
                                        <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-1.5 rounded mt-0.5">
                                            + Add-on
                                        </div>
                                    )}
                                </div>
                                <PriceDisplay
                                    amount={item.price * item.quantity}
                                    frequency={item.billingFrequency}
                                    size="sm"
                                    className="shrink-0"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t rounded-b-lg">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900">Subtotal</span>
                    <PriceDisplay amount={subtotal} frequency="monthly" size="lg" />
                </div>

                {isNearBundle && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
                        💡 <strong>Tip:</strong> You're close to unlocking bundle savings! Add ${(bundleThreshold - subtotal).toFixed(0)} more to save.
                    </div>
                )}

                {isOverBundle && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                        🎉 <strong>Great news!</strong> You qualify for bundle pricing. Check the review step for details.
                    </div>
                )}
            </div>
        </div>
    );
};
