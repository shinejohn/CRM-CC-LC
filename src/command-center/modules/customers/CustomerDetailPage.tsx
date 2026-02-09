import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Mail, Building, Clock, Edit,
  TrendingUp, Activity, FileText, Megaphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EngagementScoreCard } from './EngagementScoreCard';
import { CustomerTimeline } from './CustomerTimeline';
import { EditCustomerModal } from './EditCustomerModal';
import { useCustomer } from '../../hooks/useCustomers';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { customer, timeline, isLoading, error, refreshCustomer } = useCustomer(id!);

  if (isLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Customer not found'}</p>
        <Button variant="outline" onClick={() => navigate('/command-center/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/command-center/customers')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{customer.stage}</Badge>
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Contact Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={customer.email} />
                  {customer.phone && (
                    <InfoRow icon={Phone} label="Phone" value={customer.phone} />
                  )}
                  {customer.company && (
                    <InfoRow icon={Building} label="Company" value={customer.company} />
                  )}
                  {customer.lastInteraction && (
                    <InfoRow
                      icon={Clock}
                      label="Last Interaction"
                      value={new Date(customer.lastInteraction).toLocaleDateString()}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                    No notes yet. Add your first note.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <CustomerTimeline timeline={timeline} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No content sent to this customer yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No campaigns for this customer yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Scores & Quick Actions */}
        <div className="space-y-6">
          <EngagementScoreCard
            score={customer.engagementScore}
            predictiveScore={customer.predictiveScore}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Create Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Megaphone className="w-4 h-4 mr-2" />
                Add to Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal - Note: updateCustomer function should be passed from parent or hook */}
      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            refreshCustomer();
          }}
          updateCustomer={async (id, data) => {
            // Import and use the API service directly
            const { apiService } = await import('../../services/api.service');
            const response = await apiService.put(`/v1/customers/${id}`, data);
            if (response.success && response.data) {
              refreshCustomer();
              return response.data;
            }
            throw new Error(response.error?.message || 'Failed to update customer');
          }}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    </div>
  );
}

