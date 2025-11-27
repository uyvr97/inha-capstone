import { ShoppingBag, Store } from "lucide-react";
import type { OrderType } from "../types";
import { markInteractionStart } from "../utils/perf";

interface StartScreenProps {
  onSelect: (type: OrderType) => void;
}

const ORDER_OPTIONS = [
  {
    type: "takeout" as const,
    icon: ShoppingBag,
    label: "포장",
    color: "blue",
    animationDelay: 0.1,
    slideFrom: -50,
  },
  {
    type: "dinein" as const,
    icon: Store,
    label: "매장",
    color: "purple",
    animationDelay: 0.1,
    slideFrom: 50,
  },
];

export default function StartScreen({ onSelect }: StartScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-around py-16 px-8 text-center">
      {/* 헤더 */}
      <div className="kiosk-fade-up">
        <h1 className="text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
          주문을 시작하시려면
        </h1>
        <p className="text-2xl text-slate-600">이용 방법을 선택해주세요</p>
      </div>

      {/* 선택 버튼 */}
      <div className="flex flex-col gap-10 items-center justify-center w-full px-6">
        {ORDER_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => {
                markInteractionStart("interaction:start-to-menu", {
                  orderType: option.type,
                });
                onSelect(option.type);
              }}
              className={`group relative w-full max-w-sm h-72 bg-white rounded-3xl shadow-lg transition-shadow duration-200 overflow-hidden border-4 border-transparent hover:border-${option.color}-500 kiosk-fade-up`}
              style={{ animationDelay: `${option.animationDelay}s` }}
            >
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                <div
                  className={`w-32 h-32 rounded-full bg-${option.color}-50 flex items-center justify-center mb-6 transition-colors duration-200`}
                >
                  <Icon
                    className={`w-16 h-16 text-${option.color}-600`}
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="text-4xl font-bold text-slate-800">
                  {option.label}
                </h2>
              </div>
            </button>
          );
        })}
      </div>

      {/* 푸터 */}
      <div className="text-center kiosk-fade-up" style={{ animationDelay: "0.4s" }}>
        <p className="text-lg text-slate-500">
          도움이 필요하시면 직원을 호출해주세요
        </p>
      </div>
    </div>
  );
}
