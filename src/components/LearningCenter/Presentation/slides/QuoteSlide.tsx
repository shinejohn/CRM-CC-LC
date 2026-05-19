import React from 'react';
import { FileText, CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface QuoteLineItem {
  description: string;
  detail?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

interface QuoteSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
  onAction?: (action: string, payload: Record<string, unknown>) => void;
}

function normalizeLineItems(raw: unknown): QuoteLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      description: (r.description as string) ?? (r.name as string) ?? (r.product as string) ?? '',
      detail: (r.detail as string) ?? (r.note as string) ?? undefined,
      quantity: typeof r.quantity === 'number' ? r.quantity : (typeof r.qty === 'number' ? r.qty : 1),
      unit_price: typeof r.unit_price === 'number' ? r.unit_price : (typeof r.price === 'number' ? r.price : 0),
      total: typeof r.total === 'number' ? r.total : undefined,
    };
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export const QuoteSlide: React.FC<QuoteSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
  onAction,
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    orange: 'bg-gradient-to-br from-orange-50 to-red-100',
  };

  const accentColors = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const headline = (content.headline as string) ?? (content.title as string) ?? 'Your Quote';
  const quote_number = content.quote_number as string | undefined;
  const valid_until = content.valid_until as string | undefined;
  const prepared_for = content.prepared_for as string | undefined;
  const lineItems = normalizeLineItems(content.line_items ?? content.items);

  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.total ?? (item.quantity ?? 1) * (item.unit_price ?? 0);
    return sum + itemTotal;
  }, 0);

  const discount = typeof content.discount === 'number' ? content.discount : 0;
  const tax_rate = typeof content.tax_rate === 'number' ? content.tax_rate : 0;
  const tax = (subtotal - discount) * (tax_rate / 100);
  const total = subtotal - discount + tax;

  const guarantee = content.guarantee as string | undefined;
  const note = content.note as string | undefined;
  const accept_button_text = (content.accept_button_text as string) ?? 'Accept Quote';
  const quote_id = content.quote_id as string | undefined;

  const handleAccept = () => {
    onAction?.('accept_quote', {
      quote_id,
      quote_number,
      total,
      line_items: lineItems,
    });
  };

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-8 overflow-y-auto
        ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText size={32} className={textColors[theme]} />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{headline}</h2>
            </div>
            {prepared_for && (
              <p className="text-gray-600 ml-11">Prepared for {prepared_for}</p>
            )}
          </div>
          <div className="text-right">
            {quote_number && (
              <div className="text-sm text-gray-500 font-mono">{quote_number}</div>
            )}
            {valid_until && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Clock size={14} />
                <span>Valid until {valid_until}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-right">Qty</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((item, index) => {
                const itemTotal = item.total ?? (item.quantity ?? 1) * (item.unit_price ?? 0);
                return (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.description}</p>
                      {item.detail && (
                        <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700">{item.quantity ?? 1}</td>
                    <td className="px-4 py-4 text-right text-gray-700">{formatCurrency(item.unit_price ?? 0)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({tax_rate}%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span className={textColors[theme]}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        {guarantee && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
            <span>{guarantee}</span>
          </div>
        )}

        {/* Note */}
        {note && (
          <div className="mt-4 p-4 bg-white/80 rounded-lg border-l-4 border-blue-500 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <p className="text-gray-700 text-sm">{note}</p>
          </div>
        )}

        {/* Accept Button */}
        {onAction && (
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button
              type="button"
              onClick={handleAccept}
              className={`
                inline-flex items-center gap-2 px-8 py-4 rounded-lg
                ${accentColors[theme]} text-white font-semibold text-lg
                hover:opacity-90 transition-opacity shadow-lg
              `}
              aria-label={accept_button_text}
            >
              <DollarSign size={20} />
              {accept_button_text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
