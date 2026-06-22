/**
 * Customer-detail related hooks.
 *
 * The backend exposes NO customer sub-resource routes (e.g. /customers/{id}/deals).
 * To show a customer's deals/quotes/invoices we use the filtered LIST endpoints,
 * each of which accepts a `customer_id` query param.
 */

import { useQuery } from '@tanstack/react-query';
import { dealsApi } from '../services/crm/deals-api';
import { quotesApi } from '../services/crm/quotes-api';
import { invoicesApi } from '../services/crm/invoices-api';

export const useCustomerDeals = (customerId: string) =>
  useQuery({
    queryKey: ['deals', { customer_id: customerId }],
    queryFn: () => dealsApi.list({ customer_id: customerId, per_page: 100 }),
    enabled: !!customerId,
  });

export const useCustomerQuotes = (customerId: string) =>
  useQuery({
    queryKey: ['quotes', { customer_id: customerId }],
    queryFn: () => quotesApi.list({ customer_id: customerId, per_page: 100 }),
    enabled: !!customerId,
  });

export const useCustomerInvoices = (customerId: string) =>
  useQuery({
    queryKey: ['invoices', { customer_id: customerId }],
    queryFn: () => invoicesApi.list({ customer_id: customerId, per_page: 100 }),
    enabled: !!customerId,
  });
