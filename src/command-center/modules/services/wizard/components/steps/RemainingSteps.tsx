import React from 'react';

interface StepProps {
    onNext: () => void;
    onBack: () => void;
    [key: string]: any;
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

export const CheckoutStep: React.FC<StepProps> = ({ onNext, onBack }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
        <p>Payment Form (Placeholder)</p>
        <div className="flex justify-between pt-8 border-t"><button onClick={onBack} className="btn-secondary">Back</button><button onClick={onNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Complete Purchase</button></div>
    </div>
);

export const ConfirmationStep: React.FC<StepProps> = ({ onComplete }) => (
    <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold text-green-600">You're All Set!</h2>
        <p>Order Confirmed (Placeholder)</p>
        <button onClick={onComplete} className="bg-indigo-600 text-white px-8 py-3 rounded-lg mt-8">Go to Command Center</button>
    </div>
);
