import axios from "axios";
import type { CartItem, OrderSubmissionMeta, ReceiptIntentPayload } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_ENDPOINT = BASE_URL ? `${BASE_URL}/create` : "/create";
const NFC_SERVICE_URL = import.meta.env.VITE_NFC_SERVICE_URL ?? BASE_URL;
const RECEIPT_BASE_URL =
  import.meta.env.VITE_RECEIPT_BASE_URL ??
  BASE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "");

interface OrderPayload {
  store_name: string;
  payment_time: string;
  order_type: "takeout" | "dinein";
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
  tax: number;
  total: number;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}

interface OrderResponseBody {
  orderId?: string;
  order_id?: string;
  receiptUrl?: string;
  receipt_url?: string;
  [key: string]: unknown;
}

interface NfcSessionResponse {
  sessionId?: string;
  status?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

const normalizeOrderMeta = (
  response: OrderResponseBody | undefined,
  fallbackTimestamp: string
): OrderSubmissionMeta => {
  const normalizedOrderId =
    response?.orderId ?? response?.order_id ?? `local-${fallbackTimestamp}`;
  const normalizedReceiptUrl =
    response?.receiptUrl ??
    response?.receipt_url ??
    `${RECEIPT_BASE_URL}/receipts/${normalizedOrderId}`;

  return {
    orderId: normalizedOrderId,
    receiptUrl: normalizedReceiptUrl,
  };
};

export const sendOrderData = async (
  cartItems: CartItem[],
  totalPrice: number,
  orderType: "takeout" | "dinein"
): Promise<ApiResult<OrderSubmissionMeta>> => {
  const paymentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  const payload: OrderPayload = {
    store_name: "집장인들",
    payment_time: paymentTime,
    order_type: orderType,
    items: cartItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
    })),
    // 세금 대충 10%로 설정
    tax: Math.round(totalPrice * 0.1),
    total: totalPrice,
  };

  try {
    console.log("API Request:", payload);
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API Response:", response.data);

    const meta = normalizeOrderMeta(response.data, paymentTime);

    return { success: true, data: meta };
  } catch (error) {
    console.error("API Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    }
    const fallbackMeta = normalizeOrderMeta(undefined, paymentTime);
    return { success: false, data: fallbackMeta, error };
  }
};

export const requestNfcReceiptSession = async (
  payload: ReceiptIntentPayload
): Promise<ApiResult<NfcSessionResponse>> => {
  if (!NFC_SERVICE_URL) {
    console.warn("NFC 서비스 URL이 설정되어 있지 않습니다.");
  }
  const endpoint = `${NFC_SERVICE_URL}/api/receipts`;
  const requestBody = {
    orderId: payload.orderId,
    includeReceipt: payload.includeReceipt,
    orderType: payload.orderType,
    totalPrice: payload.totalPrice,
    receiptUrl: payload.receiptUrl,
    items: payload.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
    requestedAt: new Date().toISOString(),
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("NFC Session Response:", response.data);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("NFC Session Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    }
    return { success: false, error };
  }
};
