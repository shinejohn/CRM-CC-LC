import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  User,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';
import {
  listPersonalities,
  assignToCustomer,
  getCustomerPersonality,
  type AiPersonality,
  type PersonalityAssignment,
} from '@/services/personalities/personality-api';
import { listCustomers, type Customer, customerApi } from '@/services/crm/crm-api';

export const AIPersonalityAssignPage: React.FC = () => {
  const navigate = useNavigate();
  const [personalities, setPersonalities] = useState<AiPersonality[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [currentAssignment, setCurrentAssignment] = useState<PersonalityAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPersonalities();
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerPersonality();
    } else {
      setCurrentAssignment(null);
    }
  }, [selectedCustomer]);

  const loadPersonalities = async () => {
    try {
      const data = await listPersonalities({ is_active: true });
      setPersonalities(data);
    } catch (err) {
      console.error('Error loading personalities:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await listCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadCustomerPersonality = async () => {
    if (!selectedCustomer) return;
    
    try {
      const assignment = await getCustomerPersonality(selectedCustomer);
      setCurrentAssignment(assignment);
      if (assignment) {
        setSelectedPersonality(assignment.personality_id);
      }
    } catch (err) {
      console.error('Error loading customer personality:', err);
      setCurrentAssignment(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await assignToCustomer({
        customer_id: selectedCustomer,
        personality_id: selectedPersonality || undefined,
      });
      setSuccess(true);
      loadCustomerPersonality();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign personality');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customer = customers.find((c) => c.id === selectedCustomer);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/ai-personalities"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assign Personality</h1>
              <p className="text-gray-600 mt-1">Assign AI personalities to customers</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Personality assigned successfully</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Customer</h2>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCustomer === customer.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{customer.business_name}</div>
                  {customer.owner_name && (
                    <div className="text-sm text-gray-500">{customer.owner_name}</div>
                  )}
                  {customer.email && (
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Personality</h2>
            
            {currentAssignment && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Currently assigned: <strong>{currentAssignment.personality?.identity}</strong>
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                onClick={() => setSelectedPersonality('')}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedPersonality === ''
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">Auto-assign (Best Match)</div>
                <div className="text-sm text-gray-500">System will automatically select the best personality</div>
              </button>

              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedPersonality === personality.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{personality.name}</div>
                  <div className="text-sm text-gray-600">{personality.identity}</div>
                  {personality.description && (
                    <div className="text-sm text-gray-500 mt-1">{personality.description}</div>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    {personality.can_email && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Email</span>
                    )}
                    {personality.can_call && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Call</span>
                    )}
                    {personality.can_sms && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">SMS</span>
                    )}
                    {personality.can_chat && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Chat</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">{customer.business_name}</p>
              </div>
              {customer.industry_category && (
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium text-gray-900">{customer.industry_category}</p>
                </div>
              )}
              {customer.lead_score !== null && (
                <div>
                  <p className="text-sm text-gray-500">Lead Score</p>
                  <p className="font-medium text-gray-900">{customer.lead_score}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAssign}
            disabled={loading || !selectedCustomer}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <User className="h-5 w-5 mr-2" />
                Assign Personality
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
