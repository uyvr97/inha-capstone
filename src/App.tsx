import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import StartScreen from "./components/StartScreen";
import type {
  CartItem,
  OrderSubmissionMeta,
  OrderSummary,
  OrderType,
  ScreenType,
} from "./types";
import { markInteractionEnd } from "./utils/perf";

const MenuScreen = lazy(() => import("./components/MenuScreen"));
const PaymentScreen = lazy(() => import("./components/PaymentScreen"));
const NfcTagScreen = lazy(() => import("./components/NfcTagScreen"));
const NfcTagCompleteScreen = lazy(
  () => import("./components/NfcTagComplete")
);

export default function App() {
  const [screen, setScreen] = useState<ScreenType>("start");
  const [orderType, setOrderType] = useState<OrderType>("takeout");
  const [completedOrder, setCompletedOrder] = useState<OrderSummary | null>(null);
  const [orderMeta, setOrderMeta] = useState<OrderSubmissionMeta | null>(null);
  const [includeReceipt, setIncludeReceipt] = useState(false);

  useEffect(() => {
    if (screen === "menu") {
      markInteractionEnd("interaction:start-to-menu");
    }
  }, [screen]);

  const handleSelectOrderType = useCallback((type: OrderType) => {
    setOrderType(type);
    setScreen("menu");
  }, []);

  const handleBackToStart = useCallback(() => {
    setCompletedOrder(null);
    setIncludeReceipt(false);
    setOrderMeta(null);
    setScreen("start");
  }, []);

  const handleCheckout = useCallback(
    (items: CartItem[], totalPrice: number) => {
      setCompletedOrder({ items, totalPrice });
      setScreen("payment");
    },
    []
  );

  const handleOrderReady = useCallback((meta: OrderSubmissionMeta) => {
    setOrderMeta(meta);
  }, []);

  const handleNfcTransfer = useCallback(
    (withReceipt: boolean) => {
      if (!orderMeta) {
        console.warn("주문 메타데이터가 없어 PN532 세션을 생성할 수 없습니다.");
        return;
      }
      setIncludeReceipt(withReceipt);
      setScreen("nfcTag");
    },
    [orderMeta]
  );

  const handleNfcTagComplete = useCallback(() => {
    setScreen("nfcComplete");
  }, []);

  const handleNfcComplete = useCallback(() => {
    handleBackToStart();
  }, [handleBackToStart]);

  return (
    <div className="w-[720px] h-[1280px] bg-slate-50 overflow-hidden relative font-sans">
      <div className="relative h-full">
        {screen === "start" && <StartScreen onSelect={handleSelectOrderType} />}

        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg">
              화면을 준비하는 중입니다...
            </div>
          }
        >
          {screen === "menu" && (
            <MenuScreen
              orderType={orderType}
              onBack={handleBackToStart}
              onCheckout={handleCheckout}
            />
          )}

          {screen === "payment" && completedOrder && (
            <PaymentScreen
              orderType={orderType}
              items={completedOrder.items}
              totalPrice={completedOrder.totalPrice}
              onNfcTransfer={handleNfcTransfer}
              onOrderReady={handleOrderReady}
            />
          )}

          {screen === "nfcTag" && completedOrder && orderMeta && (
            <NfcTagScreen
              includeReceipt={includeReceipt}
              orderSummary={completedOrder}
              orderMeta={orderMeta}
              orderType={orderType}
              onTagComplete={handleNfcTagComplete}
            />
          )}

          {screen === "nfcComplete" && (
            <NfcTagCompleteScreen onComplete={handleNfcComplete} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
