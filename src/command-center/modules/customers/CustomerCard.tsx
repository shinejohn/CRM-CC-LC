import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Phone, Mail, Building, TrendingUp,
  TrendingDown, MoreVertical, Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer, CustomerStage } from '@/types/command-center';

interface CustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onDelete?: (id: string) => void;
}

const stageColors: Record<CustomerStage, string> = {
  lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  prospect: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  advocate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  churned: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function CustomerCard({ customer, isSelected, onSelect, onDelete }: CustomerCardProps) {
  const navigate = useNavigate();

  const engagementColor = customer.engagementScore >= 70
    ? 'text-green-500'
    : customer.engagementScore >= 40
    ? 'text-yellow-500'
    : 'text-red-500';

  const TrendIcon = customer.engagementScore >= 50 ? TrendingUp : TrendingDown;

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card
        className={`
          cursor-pointer hover:shadow-lg transition-all
          ${isSelected ? 'ring-2 ring-purple-500' : ''}
        `}
        onClick={() => navigate(`/command-center/customers/${customer.id}`)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {customer.name}
                </h3>
                {customer.company && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {customer.company}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => navigate(`/command-center/customers/${customer.id}`)}>
                  View Details
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(customer.id);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-2">
              <Mail className="w-3 h-3 text-gray-400" />
              {customer.email}
            </p>
            {customer.phone && (
              <p className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                {customer.phone}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
            <Badge className={stageColors[customer.stage]}>
              {customer.stage}
            </Badge>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${engagementColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{customer.engagementScore}</span>
              </div>
              {customer.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

