// ============================================
// PUBLIC QUOTES API — token-gated, unauthenticated
// Customer-facing proposal links (no auth header).
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';

export interface PublicQuoteItem {
  description: string;
  quantity: number;
  unit_price: string | number;
  total: string | number;
}

export interface PublicQuote {
  quote_number: string;
  status: string;
  subtotal: string | number;
  tax: string | number;
  tax_rate: string | number;
  discount: string | number;
  total: string | number;
  valid_until: string | null;
  sent_at: string | null;
  is_expired: boolean;
  notes: string | null;
  business_name: string | null;
  items: PublicQuoteItem[];
}

export interface PublicQuoteResponse {
  data: PublicQuote;
}

export interface PublicQuoteAcceptResponse {
  data: PublicQuote;
  invoice_id: string | null;
}

export class PublicQuoteApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PublicQuoteApiError';
    this.status = status;
  }
}

async function parseError(response: Response): Promise<never> {
  let message = response.statusText;
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // ignore non-JSON bodies
  }
  throw new PublicQuoteApiError(message, response.status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as T;
}

export const publicQuotesApi = {
  get: (token: string): Promise<PublicQuoteResponse> =>
    request<PublicQuoteResponse>(`/v1/public/quotes/${encodeURIComponent(token)}`, {
      method: 'GET',
    }),

  accept: (token: string): Promise<PublicQuoteAcceptResponse> =>
    request<PublicQuoteAcceptResponse>(
      `/v1/public/quotes/${encodeURIComponent(token)}/accept`,
      { method: 'POST' }
    ),

  decline: (token: string, reason?: string): Promise<PublicQuoteResponse> =>
    request<PublicQuoteResponse>(
      `/v1/public/quotes/${encodeURIComponent(token)}/decline`,
      {
        method: 'POST',
        body: JSON.stringify(reason ? { reason } : {}),
      }
    ),
};
