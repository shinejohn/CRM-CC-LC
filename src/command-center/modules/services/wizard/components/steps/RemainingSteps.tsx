import React, { useState } from 'react';
import { orderApi } from '@/services/learning/order-api';
import type { CartItem } from '../types';

interface StepProps {
    onNext: () => void;
    onBack: () => void;
    [key: string]: any;
}

interface CheckoutStepProps extends StepProps {
    cartItems?: CartItem[];
    customerEmail?: string;
    customerName?: string;
}

export const AddOnsSelectorStep: React.FC<StepProps> = ({ onNext, onBack }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Enhance your services</h2>
        <p>Select add-ons (Placeholder)</p>
        <div className="flex justify-between pt-8 border-t"><button onClick={onBack} className="btn-secondary">Back</button><button onClick={onNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Continue</button></div>
    </div>
);

export const ComplementarySuggestionsStep: React.FC<StepProps> = ({ onNext, onBack }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Suggested for you</h2>
        <p>AI Suggestions (Placeholder)</p>
        <div className="flex justify-between pt-8 border-t"><button onClick={onBack} className="btn-secondary">Back</button><button onClick={onNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Continue</button></div>
    </div>
);

export const QuoteReviewStep: React.FC<StepProps> = ({ onNext, onBack }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Review Your Quote</h2>
        <p>Quote Summary (Placeholder)</p>
        <div className="flex justify-between pt-8 border-t"><button onClick={onBack} className="btn-secondary">Back</button><button onClick={onNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Proceed to Checkout</button></div>
    </div>
);

export const CheckoutStep: React.FC<CheckoutStepProps> = ({
    onNext,
    onBack,
    cartItems = [],
    customerEmail: initialEmail = '',
    customerName: initialName = '',
}) => {
    const [email, setEmail] = useState(initialEmail);
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            setError('No services selected. Please go back and add services.');
            return;
        }
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.checkout({
                services: cartItems.map((item) => ({
                    service_id: item.serviceId,
                    quantity: item.quantity,
                })),
                customer_email: email.trim(),
                customer_name: name.trim() || undefined,
            });

            if (response.url) {
                window.location.href = response.url;
            } else {
                setError('Checkout failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
            <p className="text-gray-600">Enter your details and proceed to secure payment via Stripe.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        id="checkout-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name (optional)
                    </label>
                    <input
                        id="checkout-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-between pt-8 border-t border-gray-200">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Processing...
                        </>
                    ) : (
                        'Proceed to Payment'
                    )}
                </button>
            </div>
        </div>
    );
};

export const ConfirmationStep: React.FC<StepProps> = ({ onComplete }) => (
    <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold text-green-600">You're All Set!</h2>
        <p>Order Confirmed (Placeholder)</p>
        <button onClick={onComplete} className="bg-indigo-600 text-white px-8 py-3 rounded-lg mt-8">Go to Command Center</button>
    </div>
);
