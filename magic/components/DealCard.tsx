import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Star, Calendar, User, Mail, Phone, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Button } from './ui/button';
interface DealCardProps {
  company: string;
  title: string;
  amount: string;
  probability: number;
  owner: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  nextAction: {
    type: 'call' | 'email' | 'meeting' | 'task';
    date: string;
    status: 'overdue' | 'today' | 'upcoming';
  };
  onClick?: () => void;
}
export function DealCard({
  company,
  title,
  amount,
  probability,
  owner,
  dueDate,
  priority,
  nextAction,
  onClick
}: DealCardProps) {
  const priorityColor = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500'
  }[priority];
  const actionIcon = {
    call: Phone,
    email: Mail,
    meeting: User,
    task: FileText
  }[nextAction.type];
  const actionVariant = {
    overdue: 'destructive' as const,
    today: 'warning' as const,
    upcoming: 'success' as const
  }[nextAction.status];
  const ActionIcon = actionIcon;
  return <motion.div whileHover={{
    y: -2
  }} transition={{
    duration: 0.2
  }} onClick={onClick} className="cursor-pointer">
      <Card className="overflow-hidden group">
        <div className={`h-1 w-full ${priorityColor}`} />
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-900 text-sm">{company}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                <DropdownMenuItem>Change Stage</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-slate-600 mb-3 font-medium">{title}</p>

          <div className="flex items-center gap-1 mb-3">
            {[...Array(3)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < (priority === 'high' ? 3 : priority === 'medium' ? 2 : 1) ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />)}
          </div>

          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="font-bold text-slate-900">{amount}</span>
            <span className="text-slate-500">{probability}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{
            width: `${probability}%`
          }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{dueDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{owner}</span>
            </div>
          </div>

          <Badge variant={actionVariant} className="w-full justify-start">
            <ActionIcon className="w-3 h-3 mr-2" />
            {nextAction.type.charAt(0).toUpperCase() + nextAction.type.slice(1)}{' '}
            • {nextAction.date}
          </Badge>
        </CardContent>

        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Send Email">
            <Mail className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Log Call">
            <Phone className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Schedule">
            <Calendar className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Create Invoice">
            <FileText className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>;
}