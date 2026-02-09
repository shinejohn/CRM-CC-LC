import React from 'react';
import { CartItem } from '../../types';

interface ServiceConfiguratorStepProps {
    selectedServices: CartItem[];
    onUpdateConfig: (serviceId: string, config: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export const ServiceConfiguratorStep: React.FC<ServiceConfiguratorStepProps> = ({
    selectedServices,
    onUpdateConfig,
    onNext,
    onBack
}) => {
    // Simplification: We'll just assume default config for now and let user proceed
    // In a real implementation, we'd iterate through services and show forms

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configure Services</h2>
            <p>Configure your selected services here. (Placeholder implementation)</p>

            <div className="space-y-4">
                {selectedServices.map(service => (
                    <div key={service.serviceId} className="p-4 border rounded-lg bg-white">
                        <h3 className="font-bold">{service.serviceName}</h3>
                        <p className="text-sm text-gray-600">Configuration options would go here.</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-200">
                <button onClick={onBack} className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100">Back</button>
                <button onClick={onNext} className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-lg font-bold">Continue</button>
            </div>
        </div>
    );
};
