import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FilePlus, MoreHorizontal, Download, Eye, CornerUpRight } from 'lucide-react';

export const QuotesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Quotes Data
  const quotes = [
    { id: 'QT-2026-001', client: 'Acme Corp', amount: '$4,500.00', date: 'Apr 12, 2026', status: 'Accepted' },
    { id: 'QT-2026-002', client: 'Stark Industries', amount: '$12,000.00', date: 'May 05, 2026', status: 'Pending' },
    { id: 'QT-2026-003', client: 'Wayne Enterprises', amount: '$8,250.00', date: 'May 18, 2026', status: 'Draft' },
    { id: 'QT-2026-004', client: 'LexCorp', amount: '$1,500.00', date: 'May 22, 2026', status: 'Declined' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Accepted': return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      case 'Pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Draft': return <Badge variant="outline" className="text-gray-500 border-gray-300">Draft</Badge>;
      case 'Declined': return <Badge className="bg-red-100 text-red-800 border-red-200">Declined</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quotes</h1>
          <p className="text-gray-500 mt-1">Manage and track sent proposals and quotes.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <FilePlus className="w-4 h-4 mr-2" /> New Quote
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Recent Quotes</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search quotes by client or ID..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-y">
                <tr>
                  <th className="px-6 py-4 font-medium">Quote ID</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date Issued</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600">{quote.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{quote.client}</td>
                    <td className="px-6 py-4">{quote.amount}</td>
                    <td className="px-6 py-4 text-slate-500">{quote.date}</td>
                    <td className="px-6 py-4">{getStatusBadge(quote.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download PDF">
                          <Download className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Convert to Invoice" disabled={quote.status !== 'Accepted'}>
                          <CornerUpRight className={`w-4 h-4 ${quote.status === 'Accepted' ? 'text-indigo-600' : 'text-slate-300'}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
