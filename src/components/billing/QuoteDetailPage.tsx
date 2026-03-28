import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Download, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export const QuoteDetailPage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/crm/quotes">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quote QT-2026-001</h1>
              <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>
            </div>
            <p className="text-gray-500 mt-1">Prepared for Acme Corp on Apr 12, 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Convert to Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/25 text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">Website Re-design Premium Package</p>
                      <p className="text-slate-500 text-xs mt-1">Includes mobile optimization and new CMS setup.</p>
                    </td>
                    <td className="px-6 py-4 text-right">1</td>
                    <td className="px-6 py-4 text-right">$3,500.00</td>
                    <td className="px-6 py-4 text-right font-medium">$3,500.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">Annual Hosting and Support</p>
                    </td>
                    <td className="px-6 py-4 text-right">1</td>
                    <td className="px-6 py-4 text-right">$1,000.00</td>
                    <td className="px-6 py-4 text-right font-medium">$1,000.00</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end">
                <div className="w-[300px] space-y-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>$4,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-3 border-t">
                    <span>Total</span>
                    <span>$4,500.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-lg">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                Quote is valid for 30 days from issued date.
                50% deposit required to commence work.
                Final payment due net 15 days upon completion.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-lg">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Acme Corp</p>
                <p className="text-slate-500">123 Business Rd., Suite 100</p>
                <p className="text-slate-500">Metropolis, NY 10001</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-slate-500 mb-1">Attention:</p>
                <p className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                  John Doe
                </p>
                <p className="text-indigo-600 hover:underline flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" /> john.doe@acmecorp.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
