import React, { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ServicesList } from '../components/ServiceManagement/ServicesList';
import { ServiceDetailView } from '../components/ServiceManagement/ServiceDetailView';
import { ServiceActionModal } from '../components/ServiceManagement/ServiceActionModal';
import { FileText, Megaphone, Share2, Search, Mail, Layout, Plus, Filter, SlidersHorizontal } from 'lucide-react';
// Mock Data
const MOCK_SERVICES = [{
  id: '1',
  name: 'Thought Leadership Articles',
  type: 'article',
  typeLabel: 'Content Marketing',
  icon: FileText,
  status: 'active',
  lastUpdated: '2 hours ago',
  description: 'Monthly thought leadership articles written by industry experts to establish authority in your niche.',
  colorBg: 'bg-blue-100',
  colorText: 'text-blue-600',
  currentArticle: {
    title: 'The Future of AI in Enterprise',
    excerpt: 'Exploring how AI is reshaping corporate structures...'
  }
}, {
  id: '2',
  name: 'Google Ads Campaign',
  type: 'ads',
  typeLabel: 'Paid Advertising',
  icon: Megaphone,
  status: 'active',
  lastUpdated: '1 day ago',
  description: 'Managed PPC campaigns optimized for high conversion rates and maximum ROI.',
  colorBg: 'bg-purple-100',
  colorText: 'text-purple-600'
}, {
  id: '3',
  name: 'Social Media Management',
  type: 'social',
  typeLabel: 'Social Media',
  icon: Share2,
  status: 'issue',
  lastUpdated: '3 hours ago',
  description: 'Daily engagement and content posting across LinkedIn, Twitter, and Instagram.',
  colorBg: 'bg-pink-100',
  colorText: 'text-pink-600'
}, {
  id: '4',
  name: 'SEO Optimization',
  type: 'seo',
  typeLabel: 'Search Engine',
  icon: Search,
  status: 'pending',
  lastUpdated: '5 days ago',
  description: 'On-page and technical SEO improvements to boost organic rankings.',
  colorBg: 'bg-green-100',
  colorText: 'text-green-600'
}, {
  id: '5',
  name: 'Email Newsletter',
  type: 'email',
  typeLabel: 'Email Marketing',
  icon: Mail,
  status: 'active',
  lastUpdated: '1 week ago',
  description: 'Weekly curated newsletter sent to your subscriber base.',
  colorBg: 'bg-orange-100',
  colorText: 'text-orange-600'
}];
export function ServiceManagementPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(MOCK_SERVICES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'add' as 'add' | 'edit' | 'delete',
    title: '',
    data: null
  });
  const selectedService = MOCK_SERVICES.find(s => s.id === selectedServiceId);
  const handleAction = (action: string, item: any) => {
    console.log('Action triggered:', action, item);
    let config = {
      type: 'add' as const,
      title: 'Add New Item',
      data: null
    };
    switch (action) {
      case 'edit':
        config = {
          type: 'edit',
          title: 'Edit Item',
          data: item
        };
        break;
      case 'delete':
        config = {
          type: 'delete',
          title: 'Delete Item',
          data: item
        };
        break;
      case 'add':
        config = {
          type: 'add',
          title: 'Create New',
          data: null
        };
        break;
      default:
        // For other actions like 'view' or 'approve', we might just show a toast or handle differently
        // For now, we'll just open the modal as an example for edit/add
        if (action === 'settings') {
          config = {
            type: 'edit',
            title: 'Service Settings',
            data: item
          };
        } else {
          return; // Don't open modal for unhandled actions
        }
    }
    setModalConfig(config);
    setIsModalOpen(true);
  };
  return <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your active subscriptions, content, and campaigns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Panel: Service List */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-semibold text-gray-900">Your Services</h2>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" /> Sort
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
                <ServicesList services={MOCK_SERVICES} selectedId={selectedServiceId} onSelect={setSelectedServiceId} />
              </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden p-8">
                <ServiceDetailView service={selectedService} onAction={handleAction} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ServiceActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={data => {
      localStorage.setItem('cc_service_data', JSON.stringify(data));
      console.log('[API PUT] /api/v1/services', data);
      setIsModalOpen(false);
    }} type={modalConfig.type} title={modalConfig.title} initialData={modalConfig.data} />
    </AppShell>;
}