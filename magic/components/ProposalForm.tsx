import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { quotesApi } from '../../src/services/crm/quotes-api';
import { customerApi, type Customer } from '../../src/services/crm/crm-api';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export const ProposalForm = ({
  onSaved,
  dealId,
}: {
  onSaved?: (quoteId: string) => void;
  dealId?: string;
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    projectTitle: '',
    notes: '',
    valid_until: '',
    items: [
      { description: '', quantity: 1, unit_price: 0 },
    ] as LineItem[],
  });

  useEffect(() => {
    let cancelled = false;
    setLoadingCustomers(true);
    customerApi
      .list({}, 1, 50)
      .then((res) => {
        const data = res.data ?? [];
        if (!cancelled && data.length) setCustomers(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCustomers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }
    const validItems = formData.items.filter((i) => i.description.trim());
    if (validItems.length === 0) {
      setError('Please add at least one line item');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const quote = await quotesApi.create({
        customer_id: formData.customer_id,
        deal_id: dealId,
        notes: formData.notes || undefined,
        valid_until: formData.valid_until || undefined,
        items: validItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });
      onSaved?.(quote.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Proposal</CardTitle>
          <CardDescription>Add line items and save as draft</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <select
              id="customer"
              value={formData.customer_id}
              onChange={(e) => handleChange('customer_id', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              disabled={loadingCustomers}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) => handleChange('projectTitle', e.target.value)}
              placeholder="e.g. Q1 Services Package"
            />
          </div>

          <div>
            <Label className="mb-2 block">Line Items *</Label>
            <div className="space-y-2">
              {formData.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    className="flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="Qty"
                    min={0.01}
                    step={0.01}
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(i, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    className="w-28"
                    placeholder="Unit price"
                    min={0}
                    step={0.01}
                    value={item.unit_price || ''}
                    onChange={(e) => handleItemChange(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                    disabled={formData.items.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Line Item
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => handleChange('valid_until', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
