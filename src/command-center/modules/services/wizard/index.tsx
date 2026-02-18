import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { WizardState, CartItem, ServiceDefinition } from './types';
import { StepProgressBar, CartSidebar } from './components/shared';
import { OutcomeSelectorStep } from './components/steps/OutcomeSelectorStep';
import { ServiceSelectorStep } from './components/steps/ServiceSelectorStep';
import { ServiceConfiguratorStep } from './components/steps/ServiceConfiguratorStep';
// Import placeholders for now
import { AddOnsSelectorStep, ComplementarySuggestionsStep, QuoteReviewStep, CheckoutStep, ConfirmationStep } from './components/steps/RemainingSteps';
import { MobileCartSummary } from './components/mobile/MobileCartSummary';

export const ServicePurchaseWizardPage: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<WizardState>({
        currentStep: 1,
        selectedOutcome: null,
        selectedServices: [],
        selectedAddOns: [],
        complementaryServices: [],
        configuration: {},
        bundleRecommendation: null,
        upgradeToBundle: false,
        promoCode: null,
        paymentMethod: null
    });

    // Mock Account Manager & SMB Data (In a real app, this would come from context/API)
    const accountManager = {
        name: 'Sarah',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=random',
        specialty: 'Growth Specialist'
    };

    const smb = {
        id: 'smb-123',
        name: 'Main Street Coffee',
        businessType: 'Restaurant',
        profileCompletion: 85,
        category: 'Restaurants'
    };

    const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 8) }));
    const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
    const goToStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

    const handleOutcomeSelect = (outcomeId: string) => {
        setState(prev => ({ ...prev, selectedOutcome: outcomeId }));
        // We don't auto advance, user clicks continue.
    };

    const handleAddService = (service: ServiceDefinition) => {
        const newItem: CartItem = {
            serviceId: service.id,
            serviceName: service.name,
            publication: service.publication,
            price: service.price,
            billingFrequency: service.frequency,
            quantity: 1,
            isAddOn: false
        };
        setState(prev => ({ ...prev, selectedServices: [...prev.selectedServices, newItem] }));
    };

    const handleRemoveService = (serviceId: string) => {
        setState(prev => ({ ...prev, selectedServices: prev.selectedServices.filter(s => s.serviceId !== serviceId) }));
    };

    const handleUpdateConfig = (serviceId: string, config: any) => {
        setState(prev => ({
            ...prev,
            configuration: { ...prev.configuration, [serviceId]: config }
        }));
    };

    const renderCurrentStep = () => {
        switch (state.currentStep) {
            case 1:
                return (
                    <OutcomeSelectorStep
                        selectedOutcome={state.selectedOutcome}
                        onSelectOutcome={handleOutcomeSelect}
                        onNext={nextStep}
                        accountManager={accountManager}
                        businessType={smb.businessType}
                    />
                );
            case 2:
                return (
                    <ServiceSelectorStep
                        selectedOutcomeId={state.selectedOutcome!}
                        selectedServices={state.selectedServices}
                        onAddService={handleAddService}
                        onRemoveService={handleRemoveService}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <ServiceConfiguratorStep
                        selectedServices={state.selectedServices}
                        onUpdateConfig={handleUpdateConfig}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 4:
                return <AddOnsSelectorStep onNext={nextStep} onBack={prevStep} />;
            case 5:
                return <ComplementarySuggestionsStep onNext={nextStep} onBack={prevStep} />;
            case 6:
                return <QuoteReviewStep onNext={nextStep} onBack={prevStep} cartItems={state.selectedServices} />;
            case 7:
                return (
                    <CheckoutStep
                        onNext={nextStep}
                        onBack={prevStep}
                        cartItems={[...state.selectedServices, ...state.selectedAddOns]}
                        customerEmail=""
                        customerName=""
                    />
                );
            case 8:
                return <ConfirmationStep onComplete={() => navigate('/command-center')} onNext={() => undefined} onBack={() => undefined} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/command-center')} className="text-gray-500 hover:text-gray-900 font-medium">
                        ← Back to Command Center
                    </button>
                </div>
                <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <img src={accountManager.avatar} alt={accountManager.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <span className="text-xs text-indigo-500 font-bold block">AI ASSISTANT</span>
                        <span className="text-sm font-medium text-indigo-900">{accountManager.name} is here to help 💬</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b shadow-sm sticky top-[72px] z-40">
                <StepProgressBar
                    currentStep={state.currentStep}
                    totalSteps={8}
                    onStepClick={goToStep}
                />
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-8 items-start">
                {/* Main Step Content */}
                <div className="flex-1">
                    {renderCurrentStep()}
                </div>

                {/* Sidebar (Cart) */}
                {state.currentStep > 1 && state.currentStep < 8 && (
                    <>
                        <div className="w-80 shrink-0 hidden lg:block">
                            <CartSidebar items={[...state.selectedServices, ...state.selectedAddOns]} currentStep={state.currentStep} />
                        </div>
                        <MobileCartSummary items={[...state.selectedServices, ...state.selectedAddOns]} currentStep={state.currentStep} />
                    </>
                )}
            </main>
        </div>
    );
};
