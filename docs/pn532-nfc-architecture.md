# PN532 NFC 영수증 아키텍처

## 1. 브라우저 접근 한계
- 키오스크 브라우저(Chromium·WebKit)는 하드웨어 버스(GPIO, I2C, SPI)에 직접 접근할 수 없습니다.
- WebUSB/WebSerial은 HTTPS·사용자 승인 조건과 드라이버 추상화 때문에 키오스크 모드에서 사실상 비활성화됩니다.
- 따라서 PN532 같은 NFC 칩은 브라우저 밖(예: Raspberry Pi OS)에서 데몬/백엔드가 제어해야 합니다.

## 2. Raspberry Pi 브릿지 서비스
- PN532를 I2C/SPI/UART 중 하나로 연결하고 `libnfc`, `pn532`(Node.js) 또는 `nxppy`(Python)로 카드 에뮬레이션 모드를 제어합니다.
- 백엔드는 `POST /api/receipts` 요청을 받아 주문 ID, 금액, 영수증 URL을 NDEF URL 레코드로 직렬화합니다.
- NDEF 세션 큐를 유지해 다중 태깅을 순차 처리하고, PN532가 태깅 이벤트를 보고하면 세션을 완료/만료 처리합니다.
- 재시도·타임아웃 기본값: 준비 3초, 태깅 대기 10초, 실패 시 자동 재초기화.

## 3. 프론트엔드 연동 흐름
1. 결제 완료 시 주문 API(`sendOrderData`)가 반환하는 `orderId`, `receiptUrl`을 저장합니다.
2. 사용자가 영수증 발급을 선택하면 `/api/receipts`로 전달할 페이로드(번호표 정보, includeReceipt 플래그)를 생성합니다.
3. `NfcTagScreen` 컴포넌트가 백엔드를 호출해 PN532 세션을 예약하고, 성공 시 태그 대기 UI를 표시합니다.
4. 태그 완료/타임아웃 이벤트를 받아 `NfcTagComplete` 화면으로 전환하고, 실패 시 재시도 옵션을 제공합니다.

## 4. 테스트 및 운영
- 실제 PN532 + 스마트폰(안드로이드·iOS)에서 URL 오픈 여부와 지연 시간을 측정합니다.
- 백엔드 장애 시 QR 코드/문자 등 대체 채널을 안내하고, PN532 초기화 실패 시 자동 재부팅 스크립트를 준비합니다.
- 내부망/HTTPS로 API를 보호하고, 영수증 URL에 주문 토큰을 포함해 무단 접근을 막습니다.

## 5. 환경 변수 요약
- `VITE_API_BASE_URL`: 주문 서버
- `VITE_NFC_SERVICE_URL`: PN532 브릿지 API
- `VITE_RECEIPT_BASE_URL`: 영수증 뷰어(없으면 주문 서버 URL 사용)

