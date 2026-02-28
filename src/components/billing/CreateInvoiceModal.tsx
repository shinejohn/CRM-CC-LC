import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";

export interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
    const [items, setItems] = useState([{ id: "1", desc: "", qty: 1, price: 0 }]);
    const [customer, setCustomer] = useState("");
    const [dueDate, setDueDate] = useState("");

    if (!isOpen) return null;

    const handleAddItem = () => setItems([...items, { id: Date.now().toString(), desc: "", qty: 1, price: 0 }]);

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            onSuccess?.();
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--nexus-bg-page)] rounded-2xl shadow-2xl border border-[var(--nexus-card-border)] m-4 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--nexus-divider)] bg-[var(--nexus-bg-page)]/95 backdrop-blur-sm">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--nexus-text-primary)]">Create New Invoice</h2>
                        <p className="text-sm text-[var(--nexus-text-secondary)]">Fill in the details to generate an invoice.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="customer">Customer ID/Name</Label>
                                <Input
                                    id="customer"
                                    placeholder="Search customer..."
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="date">Due Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
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
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                                required
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Input
                                                type="number"
                                                min="1"
                                                defaultValue={1}
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)] cursor-text"
                                                required
                                            />
                                        </div>
                                        <div className="w-28 space-y-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Price"
                                                className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2.5 rounded-lg shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
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

                <div className="sticky bottom-0 z-10 flex justify-end gap-3 px-6 py-4 border-t border-[var(--nexus-divider)] bg-[var(--nexus-bg-page)]/95 backdrop-blur-sm rounded-b-2xl">
                    <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-[var(--nexus-bg-secondary)]">Cancel</Button>
                    <Button type="submit" form="invoice-form" className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0">
                        Generate Invoice
                    </Button>
                </div>
            </div>
        </div>
    );
}
