import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, MoreVertical, Play, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
interface JobCardProps {
  client: string;
  service: string;
  price: string;
  status: string;
  time?: string;
  address?: string;
  action: 'start' | 'complete' | 'invoice' | 'view';
  urgency?: 'high' | 'medium' | 'low';
  onClick?: () => void;
}
export function JobCard({
  client,
  service,
  price,
  status,
  time,
  address,
  action,
  urgency = 'low',
  onClick
}: JobCardProps) {
  const urgencyColor = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-amber-500',
    low: 'border-l-4 border-l-blue-500'
  }[urgency];
  const actionConfig = {
    start: {
      label: 'Start',
      icon: Play,
      variant: 'default' as const
    },
    complete: {
      label: 'Complete',
      icon: CheckCircle2,
      variant: 'default' as const
    },
    invoice: {
      label: 'Invoice',
      icon: FileText,
      variant: 'secondary' as const
    },
    view: {
      label: 'View',
      icon: FileText,
      variant: 'outline' as const
    }
  }[action];
  const ActionIcon = actionConfig.icon;
  return <motion.div whileHover={{
    y: -2
  }} transition={{
    duration: 0.2
  }} onClick={onClick} className="cursor-pointer">
      <Card className={`overflow-hidden group ${urgencyColor}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-900 text-sm">{client}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Job</DropdownMenuItem>
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuItem>Cancel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-slate-600 mb-3 font-medium">{service}</p>

          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-900">{price}</span>
            <Badge variant="secondary" className="text-xs">
              {status}
            </Badge>
          </div>

          {(time || address) && <div className="space-y-1 mb-3 pt-3 border-t border-slate-100">
              {time && <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{time}</span>
                </div>}
              {address && <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{address}</span>
                </div>}
            </div>}

          <Button variant={actionConfig.variant} size="sm" className="w-full" onClick={e => {
          e.stopPropagation();
          // Handle action
        }}>
            <ActionIcon className="w-3 h-3 mr-2" />
            {actionConfig.label}
          </Button>
        </CardContent>
      </Card>
    </motion.div>;
}