# Raspberry Pi Kiosk (React + Vite)

이 저장소는 라즈베리파이 기반 키오스크 UI를 구현한 React + TypeScript + Vite 프론트엔드입니다. 터치 기반 메뉴 선택 → 결제 → NFC 번호표/영수증 발급 과정을 시뮬레이션하며, PN532 센서를 이용해 스마트폰으로 영수증 URL을 전달하는 시나리오를 염두에 두고 있습니다.

## 주요 화면 흐름
1. 주문 유형(매장/포장) 선택
2. 메뉴 선택 및 장바구니 결제
3. 결제 성공 시 영수증 발급 여부 선택
4. NFC 태깅 화면 → PN532를 통해 번호표/영수증 URL 전송

## PN532 기반 NFC 영수증
- 브라우저는 SPI/I2C 같은 하드웨어 버스를 직접 다룰 수 없으므로, 라즈베리파이에서 백엔드 서비스가 PN532를 제어해야 합니다.
- 프론트엔드는 결제 완료 후 PN532 브릿지 API를 호출해 NDEF URL 세션을 예약합니다.
- 상세한 설계와 API 규약은 [`docs/pn532-nfc-architecture.md`](docs/pn532-nfc-architecture.md)에 정리돼 있습니다.

### 환경 변수
| 변수 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 주문/결제 API 베이스 URL |
| `VITE_NFC_SERVICE_URL` | PN532 브릿지 API (미설정 시 `VITE_API_BASE_URL` 사용) |
| `VITE_RECEIPT_BASE_URL` | 영수증 뷰어 URL (미설정 시 `VITE_API_BASE_URL` 또는 현재 origin) |

루트에 `.env.local`을 생성해 개발 환경에서 값을 지정합니다.
