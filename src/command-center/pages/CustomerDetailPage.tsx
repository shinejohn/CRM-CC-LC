import React from 'react';
import { CustomerDetailPage as CustomerDetailModule } from '../modules/customers';

export default function CustomerDetailPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <CustomerDetailModule />
    </div>
  );
}

