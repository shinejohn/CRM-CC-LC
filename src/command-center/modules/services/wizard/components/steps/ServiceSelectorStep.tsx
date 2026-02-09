import React, { useState } from 'react';
import { Search, Filter, Info, Check, Plus } from 'lucide-react';
import { SERVICES, OUTCOMES, ServiceDefinition, CartItem } from '../../types';
import { PublicationBadge, PriceDisplay } from '../shared';

interface ServiceSelectorStepProps {
    selectedOutcomeId: string;
    selectedServices: CartItem[];
    onAddService: (service: ServiceDefinition) => void;
    onRemoveService: (serviceId: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export const ServiceSelectorStep: React.FC<ServiceSelectorStepProps> = ({
    selectedOutcomeId,
    selectedServices,
    onAddService,
    onRemoveService,
    onNext,
    onBack
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');

    const outcome = OUTCOMES.find(o => o.id === selectedOutcomeId);

    const filteredServices = SERVICES.filter(s => {
        // Filter by outcome
        if (!s.outcomes.includes(selectedOutcomeId) && selectedOutcomeId !== 'all') return false;

        // Filter by search
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Filter by type (Publication)
        if (filterType !== 'All' && s.publication !== filterType) return false;

        // Don't show add-ons in primary list
        if (s.isAddOnFor && s.isAddOnFor.length > 0) return false;

        return true;
    });

    const isSelected = (serviceId: string) => selectedServices.some(s => s.serviceId === serviceId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Choose services for "{outcome?.title}"
                    </h2>
                    <p className="text-gray-600">Select the services you'd like to configure.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Types</option>
                            <option value="DN">Daily News</option>
                            <option value="DTG">Directory</option>
                            <option value="GEC">Events</option>
                            <option value="Community">Community</option>
                        </select>
                        <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {filteredServices.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        We couldn't find any services matching "{searchQuery}" in {filterType}.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setFilterType('All'); }}
                        className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => {
                        const selected = isSelected(service.id);

                        return (
                            <div
                                key={service.id}
                                className={`
                    bg-white rounded-xl border-2 overflow-hidden transition-all duration-300
                    ${selected
                                        ? 'border-indigo-600 shadow-md transform -translate-y-1'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                                    }
                  `}
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <PublicationBadge publication={service.publication} />
                                        {service.badges?.includes('Popular') && (
                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                                        <p className="text-gray-600 text-sm h-10 line-clamp-2">{service.description}</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-end justify-between">
                                        <PriceDisplay amount={service.price} frequency={service.frequency} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                            Learn More
                                        </button>

                                        {selected ? (
                                            <button
                                                onClick={() => onRemoveService(service.id)}
                                                className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
                                            >
                                                <span className="group-hover:hidden flex items-center gap-1"><Check size={16} /> Added</span>
                                                <span className="hidden group-hover:inline">Remove</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onAddService(service)}
                                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex justify-between pt-8 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={selectedServices.length === 0}
                    className={`
            flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-semibold transition-all
            ${selectedServices.length > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    Confirm Services
                </button>
            </div>
        </div>
    );
};
