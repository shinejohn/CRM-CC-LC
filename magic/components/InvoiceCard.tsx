import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreVertical, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
interface InvoiceCardProps {
  id: string;
  client: string;
  amount: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid' | 'partial';
  date: string;
  daysOverdue?: number;
  onClick?: () => void;
}
export function InvoiceCard({
  id,
  client,
  amount,
  status,
  date,
  daysOverdue,
  onClick
}: InvoiceCardProps) {
  const statusConfig = {
    draft: {
      color: 'border-l-slate-400',
      variant: 'secondary' as const,
      label: 'Draft',
      icon: FileText,
      action: 'Send'
    },
    sent: {
      color: 'border-l-blue-500',
      variant: 'default' as const,
      label: 'Sent',
      icon: Send,
      action: 'Remind'
    },
    overdue: {
      color: 'border-l-red-500',
      variant: 'destructive' as const,
      label: 'Overdue',
      icon: AlertCircle,
      action: 'Remind'
    },
    paid: {
      color: 'border-l-emerald-500',
      variant: 'success' as const,
      label: 'Paid',
      icon: CheckCircle2,
      action: 'View'
    },
    partial: {
      color: 'border-l-amber-500',
      variant: 'warning' as const,
      label: 'Partial',
      icon: Clock,
      action: 'View'
    }
  }[status];
  const StatusIcon = statusConfig.icon;
  return <motion.div whileHover={{
    y: -2
  }} transition={{
    duration: 0.2
  }} onClick={onClick} className="cursor-pointer">
      <Card className={`overflow-hidden group border-l-4 ${statusConfig.color}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-900 text-sm">{id}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Invoice</DropdownMenuItem>
                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-slate-600 mb-3 font-medium truncate">
            {client}
          </p>

          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-900">{amount}</span>
            {daysOverdue ? <Badge variant="destructive" className="text-xs">
                {daysOverdue} days overdue
              </Badge> : <span className="text-xs text-slate-500">{date}</span>}
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={e => {
          e.stopPropagation();
          // Handle action
        }}>
            <StatusIcon className="w-3 h-3 mr-2" />
            {statusConfig.action}
          </Button>
        </CardContent>
      </Card>
    </motion.div>;
}