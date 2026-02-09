import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle } from 'lucide-react';
interface ServicesListProps {
  services: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}
export function ServicesList({
  services,
  selectedId,
  onSelect
}: ServicesListProps) {
  return <div className="space-y-3">
      {services.map((service, idx) => <motion.button key={service.id} initial={{
      opacity: 0,
      x: -20
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      delay: idx * 0.05
    }} onClick={() => onSelect(service.id)} className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
            ${selectedId === service.id ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}`}>
          {/* Active Indicator Strip */}
          {selectedId === service.id && <motion.div layoutId="activeStrip" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${selectedId === service.id ? 'bg-white' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                <service.icon className={`w-5 h-5 ${selectedId === service.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${selectedId === service.id ? 'text-blue-900' : 'text-gray-900'}`}>
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {service.typeLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {service.status === 'issue' && <AlertCircle className="w-4 h-4 text-red-500" />}
              <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-green-500' : service.status === 'pending' ? 'bg-yellow-500' : service.status === 'issue' ? 'bg-red-500' : 'bg-gray-300'}`} />
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === service.id ? 'text-blue-500 translate-x-1' : 'text-gray-300'}`} />
            </div>
          </div>
        </motion.button>)}
    </div>;
}