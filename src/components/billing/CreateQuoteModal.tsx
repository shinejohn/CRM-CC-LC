import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import { apiClient } from "@/services/api";

export interface CreateQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateQuoteModal({ isOpen, onClose, onSuccess }: CreateQuoteModalProps) {
    const [items, setItems] = useState([{ id: "1", description: "", quantity: 1, unit_price: 0 }]);
    const [customer, setCustomer] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleAddItem = () => setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unit_price: 0 }]);

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: string, field: string, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/billing/quotes', {
                customer_id: customer, // Ideally this is a select dropdown value
                valid_until: validUntil,
                items: items.map(i => ({
                    description: i.description,
                    quantity: Number(i.quantity),
                    unit_price: Number(i.unit_price)
                }))
            });
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Failed to create quote", error);
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
                    <div>
                        <h2 className="text-lg font-bold text-[var(--nexus-text-primary)]">Create New Quote</h2>
                        <p className="text-sm text-[var(--nexus-text-secondary)]">Generate a new custom quote.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form id="quote-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer ID/Name</Label>
                                <Input
                                    id="customer"
                                    placeholder="Enter customer ID..."
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Valid Until</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[var(--tw-invert)]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[var(--nexus-divider)]">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-[var(--nexus-text-primary)]">Line Items</h4>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)]">
                                    <Plus className="w-4 h-4 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-start">
                                        <div className="flex-1 space-y-1">
                                            <Input
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                                required
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                                required
                                            />
                                        </div>
                                        <div className="w-28 space-y-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Price"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t border-[var(--nexus-divider)] bg-[var(--nexus-bg-page)]/95 rounded-b-2xl">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="quote-form" disabled={isSubmitting} className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)]">
                        {isSubmitting ? "Generating..." : "Generate Quote"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
