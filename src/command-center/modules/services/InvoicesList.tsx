import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Invoice } from '../../hooks/useServices';
import { useServices } from '../../hooks/useServices';

interface InvoicesListProps {
  invoices: Invoice[];
}

const statusConfig = {
  paid: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    label: 'Paid',
  },
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Pending',
  },
  overdue: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    label: 'Overdue',
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    label: 'Cancelled',
  },
};

export function InvoicesList({ invoices }: InvoicesListProps) {
  const { payInvoice, isLoading: isPaying } = useServices();

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await payInvoice(invoiceId);
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      // TODO: Show error toast
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-slate-400">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice, index) => {
        const status = statusConfig[invoice.status];
        const StatusIcon = status.icon;
        const isActionable = invoice.status === 'pending' || invoice.status === 'overdue';

        return (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {invoice.serviceName}
                      </h3>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                      Invoice #{invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      {invoice.paidDate && (
                        <span className="ml-2">
                          • Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {invoice.items.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {invoice.items.map((item, i) => (
                          <div key={i} className="text-sm text-gray-600 dark:text-slate-400">
                            {item.description} - ${item.total.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${invoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isActionable && (
                        <Button
                          onClick={() => handlePayInvoice(invoice.id)}
                          disabled={isPaying}
                          size="sm"
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

