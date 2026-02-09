import { useNavigate } from 'react-router';
import { useState } from 'react';

type NavIntent = {
    regex: RegExp[];
    path: string;
    label: string;
};

// Define the "Brain" of the navigator
const INTENT_MAP: NavIntent[] = [
    {
        regex: [/dashboard/i, /home/i, /overview/i],
        path: '/command-center/dashboard',
        label: 'Dashboard'
    },
    {
        regex: [/crm/i, /customer/i, /sales/i],
        path: '/command-center/crm',
        label: 'CRM Dashboard'
    },
    {
        regex: [/service/i, /buy/i, /wizard/i, /shop/i],
        path: '/command-center/services/buy',
        label: 'Service Wizard'
    },
    {
        regex: [/ai/i, /brain/i, /hub/i, /monitor/i],
        path: '/command-center/ai',
        label: 'AI Hub'
    },
    {
        regex: [/setting/i, /config/i, /profile/i],
        path: '/command-center/settings',
        label: 'Settings'
    }
];

export function useNavCommander() {
    const navigate = useNavigate();
    const [lastAction, setLastAction] = useState<string | null>(null);

    const executeCommand = (text: string) => {
        // Simple Intent Parser
        const intent = INTENT_MAP.find(i => i.regex.some(r => r.test(text)));

        if (intent) {
            navigate(intent.path);
            setLastAction(`Navigated to ${intent.label}`);
            return { success: true, message: `Navigating to ${intent.label}...` };
        }

        // Fallback for "unknown" commands (in a real app, this would query an LLM)
        if (text.toLowerCase().includes('go to')) {
            return { success: false, message: "I'm not sure where that is. Try 'Go to CRM' or 'Go to Settings'." };
        }

        // Return null if no navigation intent detected (allow normal chat)
        return null;
    };

    return { executeCommand, lastAction };
}
