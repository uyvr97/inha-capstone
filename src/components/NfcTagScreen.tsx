import { useEffect, useMemo } from "react";
import { Smartphone } from "lucide-react";
import { TIMINGS } from "../constants/animations";

interface NfcTagScreenProps {
  includeReceipt: boolean;
  onTagComplete: () => void;
}

const LOADING_DOTS_DELAYS = [0, 0.3, 0.6] as const;

export default function NfcTagScreen({
  includeReceipt,
  onTagComplete,
}: NfcTagScreenProps) {
  const headerText = useMemo(
    () => (includeReceipt ? "번호표와 영수증을" : "번호표를"),
    [includeReceipt]
  );

  useEffect(() => {
    // 10초 후 태그 완료 화면으로 이동, 실제로는 NFC 태그 감지 시
    const timer = setTimeout(onTagComplete, TIMINGS.NFC_TAG_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [onTagComplete]);

  return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden kiosk-scale-in">
        {/* 헤더 */}
        <div className="bg-linear-to-r from-indigo-500 to-blue-500 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            {headerText} 전송중
          </h1>
          <p className="text-base text-white/90">NFC로 데이터를 전송합니다</p>
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
            휴대폰을 태그해 주세요
          </h2>
          <p className="text-base text-slate-600 mb-2">
            키오스크 하단의 NFC 리더기에
          </p>
          <p className="text-base text-slate-600">휴대폰을 가까이 대주세요</p>

          {/* 로딩 */}
          <div className="mt-12 flex justify-center gap-2">
            {LOADING_DOTS_DELAYS.map((delay, index) => (
              <div
                key={index}
                className="kiosk-dot w-3 h-3 bg-indigo-500 rounded-full"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
