import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, FileText, UserPlus, ListTodo, MessageCircle, BoxIcon } from 'lucide-react';
interface QuickActionProps {
  icon: BoxIcon;
  label: string;
  onClick?: () => void;
}
const actions: QuickActionProps[] = [{
  icon: Mail,
  label: 'Send Campaign'
}, {
  icon: Calendar,
  label: 'Schedule Meeting'
}, {
  icon: FileText,
  label: 'Create Invoice'
}, {
  icon: UserPlus,
  label: 'Add Customer'
}, {
  icon: ListTodo,
  label: 'Create Task'
}, {
  icon: MessageCircle,
  label: 'Start Chat'
}];
export function QuickActionsBar() {
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action, index) => <motion.button key={action.label} whileHover={{
      scale: 1.02,
      y: -2
    }} whileTap={{
      scale: 0.98
    }} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition-colors group shadow-sm">
          <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors">
            <action.icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
            {action.label}
          </span>
        </motion.button>)}
    </div>;
}