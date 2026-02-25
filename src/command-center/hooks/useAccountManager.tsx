import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
    timestamp: Date;
}

interface AccountManagerContextType {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    messages: Message[];
    sendMessage: (content: string, zone?: string) => void;
    activeTasks: Task[];
    addTask: (title: string) => void;
    updateTask: (id: string, status: Task['status']) => void;
}

const AccountManagerContext = createContext<AccountManagerContextType | undefined>(undefined);

export function AccountManagerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi John! I'm Sarah, your Account Manager AI. I'm here to help you manage your Command Center. What would you like to do today?",
            timestamp: new Date()
        }
    ]);
    const [activeTasks, setActiveTasks] = useState<Task[]>([]);

    const toggle = () => setIsOpen(prev => !prev);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    const addTask = (title: string) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            status: 'pending',
            timestamp: new Date()
        };
        setActiveTasks(prev => [...prev, newTask]);

        // Simulate task progress
        setTimeout(() => updateTask(newTask.id, 'in-progress'), 1500);
        setTimeout(() => updateTask(newTask.id, 'completed'), 4000);
    };

    const updateTask = (id: string, status: Task['status']) => {
        setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const sendMessage = (content: string, zone?: string) => {
        const userMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role: 'user',
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // Simulate AI response based on content
        setTimeout(() => {
            const lower = content.toLowerCase();
            let response = "I can definitely help with that! Let me get that sorted for you.";

            if (lower.includes('article') || lower.includes('content')) {
                response = "I'll start drafting that content right away. You'll see it appear in your Active Tasks.";
                addTask(`Draft content: ${content.substring(0, 20)}...`);
            } else if (lower.includes('event')) {
                response = "Setting up a new event campaign. I'll need a few more details, but I've started the foundation.";
                addTask("Create event framework");
            } else if (lower.includes('analytics') || lower.includes('report')) {
                response = "Pulling the latest metric reports for this zone...";
                addTask("Generate analytics report");
            } else if (lower.includes('upsell') || lower.includes('upgrade')) {
                response = "UPSELL_TRIGGER";
            }

            const aiMsg: Message = {
                id: Math.random().toString(36).substr(2, 9),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <AccountManagerContext.Provider value={{
            isOpen, toggle, open, close, messages, sendMessage, activeTasks, addTask, updateTask
        }}>
            {children}
        </AccountManagerContext.Provider>
    );
}

export function useAccountManager() {
    const context = useContext(AccountManagerContext);
    if (context === undefined) {
        throw new Error('useAccountManager must be used within an AccountManagerProvider');
    }
    return context;
}
