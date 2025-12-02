import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCcw, Smartphone } from "lucide-react";
import { TIMINGS, NFC_CONSTANTS, NFC_STATUS_TEXT } from "../constants";
import type {
  OrderSubmissionMeta,
  OrderSummary,
  OrderType,
} from "../types";
import { requestNfcReceiptSession } from "../lib/api";

interface NfcTagScreenProps {
  includeReceipt: boolean;
  orderSummary: OrderSummary;
  orderMeta: OrderSubmissionMeta;
  orderType: OrderType;
  onTagComplete: () => void;
}

const LOADING_DOTS_DELAYS = [0, 0.3, 0.6] as const;

export default function NfcTagScreen({
  includeReceipt,
  orderSummary,
  orderMeta,
  orderType,
  onTagComplete,
}: NfcTagScreenProps) {
  const headerText = useMemo(
    () => (includeReceipt ? "번호표와 영수증을" : "번호표를"),
    [includeReceipt]
  );

  const [status, setStatus] =
    useState<keyof typeof NFC_STATUS_TEXT>("preparing");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initiateNfcSession = useCallback(async () => {
    setStatus("preparing");
    setErrorMessage(null);
    setSessionId(null);

    const response = await requestNfcReceiptSession({
      ...orderSummary,
      orderId: orderMeta.orderId,
      includeReceipt,
      orderType,
      receiptUrl: includeReceipt ? orderMeta.receiptUrl : undefined,
    });

    if (response.success && response.data) {
      setStatus("ready");
      setSessionId(
        response.data.sessionId ??
          (typeof response.data.id === "string" ? response.data.id : null)
      );
      return true;
    }

    setStatus("error");
    setErrorMessage("PN532 세션 생성에 실패했습니다. 다시 시도해주세요.");
    return false;
  }, [includeReceipt, orderMeta.orderId, orderMeta.receiptUrl, orderSummary, orderType]);

  useEffect(() => {
    let tagCompleteTimer: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const prepare = async () => {
      const ready = await initiateNfcSession();
      if (!isMounted) return;
      if (ready) {
        tagCompleteTimer = setTimeout(
          onTagComplete,
          TIMINGS.NFC_TAG_TIMEOUT_MS
        );
      }
    };

    prepare();

    return () => {
      isMounted = false;
      if (tagCompleteTimer) {
        clearTimeout(tagCompleteTimer);
      }
    };
  }, [initiateNfcSession, onTagComplete, retryCount]);

  useEffect(() => {
    if (status !== "error") {
      return;
    }

    if (retryCount >= NFC_CONSTANTS.PREPARE_RETRY_LIMIT - 1) {
      return;
    }

    const retryTimer = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
    }, NFC_CONSTANTS.ERROR_RETRY_DELAY_MS);

    return () => clearTimeout(retryTimer);
  }, [retryCount, status]);

  const handleManualRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const statusCopy = NFC_STATUS_TEXT[status];

  useEffect(() => {
    // includeReceipt가 바뀌면 리트라이 초기화
    setRetryCount(0);
  }, [includeReceipt]);

  return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden kiosk-scale-in">
        {/* 헤더 */}
        <div className="bg-linear-to-r from-indigo-500 to-blue-500 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{headerText} 전송중</h1>
          <p className="text-base text-white/90">
            {status === "preparing"
              ? "PN532 리더기를 초기화 중입니다"
              : "NFC로 데이터를 전송합니다"}
          </p>
        </div>

        {/* NFC 태그 */}
        <div className="p-12 text-center">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="kiosk-pulse-ring absolute inset-0 rounded-full border-4 border-indigo-400/40" />
            <div className="kiosk-pulse-ring kiosk-pulse-ring--slow absolute inset-0 rounded-full border-4 border-indigo-400/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="kiosk-floating-phone bg-linear-to-br from-indigo-500 to-blue-500 rounded-full p-8 shadow-xl">
                <Smartphone className="w-20 h-20 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {statusCopy.title}
          </h2>
          <p className="text-base text-slate-600 mb-2">{statusCopy.description}</p>
          {status === "ready" && sessionId && (
            <p className="text-sm text-slate-500">
              세션 ID: <span className="font-mono">{sessionId}</span>
            </p>
          )}
          {status === "preparing" && (
            <p className="text-base text-slate-500 mt-2">
              최대 {TIMINGS.NFC_TAG_TIMEOUT_MS / 1000}초 정도 소요될 수 있습니다.
            </p>
          )}
          {status === "error" && (
            <div className="mt-4 flex flex-col items-center gap-3 text-red-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={handleManualRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                다시 시도
              </button>
            </div>
          )}

          {/* 로딩 */}
          {(status === "preparing" || status === "ready") && (
            <div className="mt-12 flex justify-center gap-2">
              {LOADING_DOTS_DELAYS.map((delay, index) => (
                <div
                  key={index}
                  className="kiosk-dot w-3 h-3 bg-indigo-500 rounded-full"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
