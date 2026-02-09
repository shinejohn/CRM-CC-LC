import React from 'react';
import { Clock, Mail, Phone, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineItem {
  id: string;
  type: 'email' | 'phone' | 'sms' | 'note' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
}

interface CustomerTimelineProps {
  timeline: TimelineItem[];
}

const typeIcons = {
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  note: FileText,
  meeting: Clock,
};

const typeColors = {
  email: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  phone: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  sms: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  note: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  meeting: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export function CustomerTimeline({ timeline }: CustomerTimelineProps) {
  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500 dark:text-slate-400">
          No timeline events yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item) => {
        const Icon = typeIcons[item.type];
        return (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${typeColors[item.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

