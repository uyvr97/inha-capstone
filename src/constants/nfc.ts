export const NFC_STATUS_TEXT = {
  preparing: {
    title: "PN532 초기화 중",
    description: "리더기가 영수증 데이터를 준비하고 있습니다",
  },
  ready: {
    title: "휴대폰을 태그해 주세요",
    description: "키오스크 하단 NFC 리더에 스마트폰을 가까이 대주세요",
  },
  error: {
    title: "전송 준비에 실패했습니다",
    description: "다시 시도하거나 직원에게 문의해주세요",
  },
} as const;

export const NFC_CONSTANTS = {
  PREPARE_RETRY_LIMIT: 3,
  ERROR_RETRY_DELAY_MS: 4000,
} as const;

