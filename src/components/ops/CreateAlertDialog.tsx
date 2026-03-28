import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, WifiHigh, ShieldAlert } from 'lucide-react';
import { apiClient } from '@/services/api';

export interface CreateAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateAlertDialog({ isOpen, onClose, onSuccess }: CreateAlertDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('info');
    const [targetArea, setTargetArea] = useState('All');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/alerts/dispatch', {
                title,
                description,
                severity,
                target_area: targetArea
            });
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Failed to dispatch alert", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--nexus-bg-page)] rounded-2xl shadow-2xl border border-[var(--nexus-card-border)] m-4 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--nexus-divider)] bg-[var(--nexus-bg-page)]/95 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--nexus-text-primary)]">Issue Emergency Alert</h2>
                            <p className="text-sm text-[var(--nexus-text-secondary)]">Broadcast a new alert to residents and platforms.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form id="alert-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Headline / Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Severe Weather Warning"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="font-bold text-lg bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Broadcast Message</Label>
                            <textarea
                                id="desc"
                                placeholder="Provide instructions or details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full min-h-[120px] rounded-md border p-3 bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)] focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity Level</Label>
                                <select 
                                    id="severity" 
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                >
                                    <option value="info">Info / Advisory</option>
                                    <option value="warning">Warning</option>
                                    <option value="critical">Critical Emergency</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Target Area</Label>
                                <Input
                                    id="area"
                                    placeholder="e.g. County-wide, Downtown"
                                    value={targetArea}
                                    onChange={(e) => setTargetArea(e.target.value)}
                                    className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t border-[var(--nexus-divider)] bg-[var(--nexus-bg-page)]/95 rounded-b-2xl">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="alert-form" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                        <WifiHigh className="w-4 h-4" />
                        {isSubmitting ? "Dispatching..." : "Dispatch Alert Now"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
