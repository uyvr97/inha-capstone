import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { CartItem, OrderType } from "../types";
import { sendOrderData } from "../lib/api";

interface PaymentScreenProps {
  orderType: OrderType;
  items: CartItem[];
  totalPrice: number;
  onReceiptSelect: (type: "paper" | "electronic") => void;
}

export default function PaymentScreen({
  orderType,
  items,
  totalPrice,
  onReceiptSelect,
}: PaymentScreenProps) {
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const processPayment = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sendOrderData(items, totalPrice, orderType);
      if (result.success) {
        console.log("주문 데이터 전송 성공:", result.data);
      } else {
        console.error("주문 데이터 전송 실패:", result.error);
      }
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
    } finally {
      setIsPaymentComplete(true);
      setIsLoading(false);
    }
  }, [items, totalPrice, orderType]);

  useEffect(() => {
    processPayment();
  }, [processPayment]);

  const handlePaperReceipt = useCallback(() => {
    onReceiptSelect("paper");
  }, [onReceiptSelect]);

  const handleElectronicReceipt = useCallback(() => {
    onReceiptSelect("electronic");
  }, [onReceiptSelect]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 결제 완료 헤더 */}
        <div className="bg-linear-to-r from-blue-500 to-purple-500 p-8 text-center">
          {isLoading ? (
            <>
              <Loader2 className="w-16 h-16 text-white mx-auto mb-3 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-2">
                결제 처리중...
              </h1>
              <p className="text-xl text-white/90">잠시만 기다려주세요</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-white mb-2">
                결제가 완료되었습니다
              </h1>
              <p className="text-xl text-white/90">이용해 주셔서 감사합니다</p>
            </>
          )}
        </div>

        {/* 영수증 선택 */}
        {!isLoading && isPaymentComplete && (
          <div className="p-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                영수증 발급하기
              </h2>
              <p className="text-lg text-slate-500">
                원하는 발급 방식을 선택해주세요
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePaperReceipt}
                className="flex-1 bg-white border-2 border-slate-300 text-slate-700 py-6 rounded-xl transition-all duration-300 flex flex-col items-center justify-center"
              >
                <span className="text-xl font-bold">종이영수증</span>
                <span className="text-base text-slate-500 mt-1">즉시 발급</span>
              </button>

              <button
                onClick={handleElectronicReceipt}
                className="flex-1 bg-linear-to-r from-blue-500 to-purple-500 text-white py-6 rounded-xl transition-all duration-300 flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-xl font-bold">전자영수증</span>
                <span className="text-base text-white/80 mt-1">NFC 전송</span>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="p-8">
            <p className="text-center text-slate-400 text-base">
              주문 정보를 서버로 전송하는 중입니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
