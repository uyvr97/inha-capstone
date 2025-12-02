export interface ReceiptRequest {
  orderId: string;
  includeReceipt: boolean;
  orderType: 'takeout' | 'dinein';
  totalPrice: number;
  receiptUrl?: string;
  items: {
    name: string;
    quantity: number;
  }[];
  requestedAt: string;
}

export interface NfcSession {
  sessionId: string;
  orderId: string;
  receiptUrl: string;
  status: 'pending' | 'ready' | 'tagging' | 'completed' | 'expired' | 'failed';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface NfcSessionResponse {
  sessionId: string;
  status: string;
  expiresAt: string;
  message?: string;
}

export interface PN532Config {
  i2cBus: number;
  i2cAddress: number;
  readyTimeoutMs: number;
  taggingTimeoutMs: number;
  maxRetries: number;
}
