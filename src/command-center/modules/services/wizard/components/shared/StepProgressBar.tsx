import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
    currentStep: number;
    totalSteps: number;
    onStepClick: (step: number) => void;
}

const STEPS = [
    'Outcome',
    'Service',
    'Configure',
    'Add-ons',
    'Suggest',
    'Review',
    'Checkout',
    'Done'
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep, totalSteps, onStepClick }) => {
    return (
        <div className="w-full py-4 px-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] relative">
                {/* Connecting Line - Background */}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />

                {/* Connecting Line - Progress */}
                <div
                    className="absolute top-4 left-0 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {STEPS.map((label, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    const isClickable = isCompleted;

                    return (
                        <div
                            key={stepNum}
                            className={`flex flex-col items-center gap-2 cursor-pointer ${!isClickable && !isCurrent ? 'pointer-events-none' : ''}`}
                            onClick={() => isClickable && onStepClick(stepNum)}
                        >
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                  ${isCompleted
                                        ? 'bg-indigo-500 border-indigo-500 text-white'
                                        : isCurrent
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_0_4px_rgba(99,102,241,0.3)] scale-110'
                                            : 'bg-white border-gray-300 text-gray-300'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <Check size={16} />
                                ) : (
                                    <span className={`text-xs font-bold ${isCurrent ? 'text-white' : ''}`}>
                                        {stepNum}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`
                  text-xs font-medium transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-indigo-600' : 'text-gray-400'}
                `}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
