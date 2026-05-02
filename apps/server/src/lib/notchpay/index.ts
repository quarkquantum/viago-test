/**
 * NotchPay SDK - Local SDK for NotchPay API integration
 *
 * This SDK provides typed methods for interacting with the NotchPay API,
 * handling authentication, and providing consistent error handling.
 */

import { env } from '@/env';

// ============================================================================
// Types
// ============================================================================

export type NotchPayConfig = {
  publicKey: string;
  privateKey?: string;
  hashKey?: string;
  apiUrl: string;
};

export type NotchPayCustomer = {
  name: string;
  email: string;
  phone?: string;
};

export type InitPaymentParams = {
  amount: number;
  currency?: string;
  reference: string;
  description?: string;
  callback?: string;
  customer: NotchPayCustomer;
  metadata?: Record<string, unknown>;
};

export type NotchPayPayment = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'canceled' | 'expired';
  customer: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
};

export type InitPaymentResponse = {
  status: string;
  message: string;
  transaction: NotchPayPayment;
  authorization_url: string;
};

export type GetPaymentResponse = {
  status: string;
  message: string;
  transaction: NotchPayPayment;
};

export type ListPaymentsResponse = {
  status: string;
  message: string;
  transactions: NotchPayPayment[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
};

export type CreateAccountParams = {
  type: 'standard' | 'express' | 'custom';
  business_profile?: {
    name?: string;
    url?: string;
    category?: string;
  };
  email: string;
  phone?: string;
  metadata?: Record<string, unknown>;
};

export type NotchPayAccount = {
  id: string;
  email: string;
  phone?: string;
  type: string;
  status: string;
  business_profile?: {
    name?: string;
    url?: string;
    category?: string;
  };
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type CreateAccountResponse = {
  status: string;
  message: string;
  account: NotchPayAccount;
};

export type InitTransferParams = {
  amount: number;
  currency?: string;
  reference: string;
  recipient: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type NotchPayTransfer = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  recipient: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type InitTransferResponse = {
  status: string;
  message: string;
  transfer: NotchPayTransfer;
};

export class NotchPayError extends Error {
  statusCode: number;
  response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'NotchPayError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// ============================================================================
// SDK Class
// ============================================================================

export class NotchPaySDK {
  private readonly config: NotchPayConfig;

  constructor(config?: Partial<NotchPayConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || env.NOTCH_PAY_API_URL,
      hashKey: config?.hashKey || env.NOTCH_PAY_HASH_KEY,
      privateKey: config?.privateKey || env.NOTCH_PAY_PRIVATE_KEY,
      publicKey: config?.publicKey || env.NOTCH_PAY_PUBLIC_KEY,
    };
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
      usePrivateKey?: boolean;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, usePrivateKey = false } = options;

    const headers: Record<string, string> = {
      Authorization: this.config.publicKey,
      'Content-Type': 'application/json',
    };

    if (usePrivateKey && this.config.privateKey) {
      headers['X-Grant'] = this.config.privateKey;
    }

    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers,
      method,
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new NotchPayError(data.message || 'NotchPay API request failed', response.status, data);
    }

    return data as T;
  }

  // ==========================================================================
  // Payments
  // ==========================================================================

  /**
   * Initialize a new payment
   */
  initPayment(params: InitPaymentParams): Promise<InitPaymentResponse> {
    return this.request<InitPaymentResponse>('/payments', {
      body: {
        amount: params.amount,
        callback: params.callback,
        currency: params.currency || 'XAF',
        customer: params.customer,
        description: params.description,
        metadata: params.metadata,
        reference: params.reference,
      },
      method: 'POST',
    });
  }

  /**
   * Get a payment by reference
   */
  getPayment(reference: string): Promise<GetPaymentResponse> {
    return this.request<GetPaymentResponse>(`/payments/${reference}`);
  }

  /**
   * List all payments
   */
  listPayments(params?: { page?: number; perPage?: number }): Promise<ListPaymentsResponse> {
    const query = new URLSearchParams();
    if (params?.page) {
      query.set('page', String(params.page));
    }
    if (params?.perPage) {
      query.set('perPage', String(params.perPage));
    }
    const queryString = query.toString();
    return this.request<ListPaymentsResponse>(`/payments${queryString ? `?${queryString}` : ''}`);
  }

  // ==========================================================================
  // Accounts (Connected Accounts)
  // ==========================================================================

  /**
   * Create a connected account
   */
  createAccount(params: CreateAccountParams): Promise<CreateAccountResponse> {
    return this.request<CreateAccountResponse>('/accounts', {
      body: params,
      method: 'POST',
    });
  }

  /**
   * Get an account by ID
   */
  getAccount(accountId: string): Promise<{ status: string; account: NotchPayAccount }> {
    return this.request<{ status: string; account: NotchPayAccount }>(`/accounts/${accountId}`);
  }

  // ==========================================================================
  // Transfers
  // ==========================================================================

  /**
   * Initiate a transfer (requires private key)
   */
  initTransfer(params: InitTransferParams): Promise<InitTransferResponse> {
    return this.request<InitTransferResponse>('/transfers', {
      body: {
        amount: params.amount,
        currency: params.currency || 'XAF',
        description: params.description,
        metadata: params.metadata,
        recipient: params.recipient,
        reference: params.reference,
      },
      method: 'POST',
      usePrivateKey: true,
    });
  }

  /**
   * Get a transfer by reference
   */
  getTransfer(reference: string): Promise<{ status: string; transfer: NotchPayTransfer }> {
    return this.request<{ status: string; transfer: NotchPayTransfer }>(`/transfers/${reference}`);
  }

  // ==========================================================================
  // Webhooks
  // ==========================================================================

  /**
   * Verify webhook signature using HMAC SHA256
   */
  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    if (!this.config.hashKey) {
      return false;
    }

    const crypto = require('node:crypto');
    const hmac = crypto.createHmac('sha256', this.config.hashKey);
    const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      // TimingSafeEqual throws if buffers have different lengths
      return false;
    }
  }
}

// ============================================================================
// Default Instance
// ============================================================================

/**
 * Default NotchPay SDK instance using environment configuration
 */
export const notchpay = new NotchPaySDK();
