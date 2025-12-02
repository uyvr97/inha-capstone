# Raspberry Pi NFC Bridge Service

Raspberry Pi에서 실행되는 PN532 NFC 칩을 제어하는 Node.js 백엔드 서비스입니다.

## 주요 기능

- PN532 NFC 칩을 I2C로 제어
- 카드 에뮬레이션 모드 지원
- NDEF URL 레코드 생성 및 전송
- NFC 세션 큐 관리 (다중 태깅 순차 처리)
- RESTful API 제공

## 시스템 요구사항

### 하드웨어
- Raspberry Pi (3/4/5 권장)
- PN532 NFC 모듈
- I2C 연결 (또는 SPI/UART)

### 소프트웨어
- Raspberry Pi OS (Debian 기반)
- Node.js 18.x 이상
- I2C 활성화

## 설치 방법

### 1. I2C 활성화

```bash
# Raspberry Pi 설정 열기
sudo raspi-config

# Interface Options -> I2C -> Enable 선택
# 재부팅
sudo reboot
```

### 2. I2C 도구 설치 및 확인

```bash
# I2C 도구 설치
sudo apt-get update
sudo apt-get install -y i2c-tools

# I2C 장치 확인
i2cdetect -y 1

# PN532가 0x24 주소에 표시되어야 함
```

### 3. Node.js 설치

```bash
# Node.js 18.x 설치 (권장)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 4. 프로젝트 클론 및 설치

```bash
# 프로젝트 디렉토리로 이동
cd raspberry-pi-bridge

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
nano .env  # 필요에 따라 수정
```

### 5. 빌드

```bash
# TypeScript 빌드
npm run build
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# 서버 설정
PORT=3001
HOST=0.0.0.0

# PN532 I2C 설정
I2C_BUS=1
I2C_ADDRESS=0x24

# 타임아웃 설정 (밀리초)
READY_TIMEOUT_MS=3000
TAGGING_TIMEOUT_MS=10000
SESSION_TIMEOUT_MS=30000

# 재시도 설정
MAX_RETRIES=3

# 영수증 뷰어 URL
RECEIPT_BASE_URL=http://localhost:3000
```

## 실행 방법

### 개발 모드

```bash
npm run dev
```

### 프로덕션 모드

```bash
npm run build
npm start
```

### systemd 서비스로 등록 (자동 시작)

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/nfc-bridge.service
```

다음 내용을 입력:

```ini
[Unit]
Description=Raspberry Pi NFC Bridge Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/raspberry-pi-bridge
ExecStart=/usr/bin/node /home/pi/raspberry-pi-bridge/dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=nfc-bridge

[Install]
WantedBy=multi-user.target
```

서비스 활성화:

```bash
# 서비스 리로드
sudo systemctl daemon-reload

# 서비스 시작
sudo systemctl start nfc-bridge

# 부팅 시 자동 시작 설정
sudo systemctl enable nfc-bridge

# 상태 확인
sudo systemctl status nfc-bridge

# 로그 확인
sudo journalctl -u nfc-bridge -f
```

## API 엔드포인트

### 1. 영수증 NFC 세션 생성

**POST** `/api/receipts`

**Request Body:**
```json
{
  "orderId": "order-123",
  "includeReceipt": true,
  "orderType": "takeout",
  "totalPrice": 15000,
  "receiptUrl": "https://example.com/receipts/order-123",
  "items": [
    {
      "name": "아메리카노",
      "quantity": 2
    }
  ],
  "requestedAt": "2025-12-02T10:30:00Z"
}
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "expiresAt": "2025-12-02T10:31:00Z",
  "message": "NFC session created successfully"
}
```

### 2. 세션 상태 조회

**GET** `/api/receipts/:sessionId`

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "expiresAt": "2025-12-02T10:31:00Z"
}
```

세션 상태:
- `pending`: 대기 중
- `ready`: PN532 준비 완료
- `tagging`: 태깅 대기 중
- `completed`: 완료
- `expired`: 만료
- `failed`: 실패

### 3. 모든 세션 조회

**GET** `/api/receipts`

**Response:**
```json
{
  "total": 5,
  "sessions": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "orderId": "order-123",
      "status": "completed",
      "createdAt": "2025-12-02T10:30:00Z",
      "expiresAt": "2025-12-02T10:31:00Z",
      "completedAt": "2025-12-02T10:30:15Z"
    }
  ]
}
```

### 4. 헬스 체크

**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T10:30:00Z",
  "sessions": {
    "total": 5,
    "pending": 1,
    "ready": 0,
    "tagging": 0,
    "completed": 3,
    "expired": 1,
    "failed": 0
  }
}
```

## 프론트엔드 연동

프론트엔드에서는 `VITE_NFC_SERVICE_URL` 환경 변수를 설정하여 이 서비스와 통신합니다:

```env
# 프론트엔드 .env 파일
VITE_NFC_SERVICE_URL=http://192.168.1.100:3001
```

## 문제 해결

### PN532를 찾을 수 없음

```bash
# I2C 장치 확인
i2cdetect -y 1

# I2C가 활성화되어 있는지 확인
ls /dev/i2c-*

# 사용자 권한 확인
sudo usermod -aG i2c pi
```

### 권한 에러

```bash
# I2C 장치에 대한 권한 부여
sudo chmod a+rw /dev/i2c-1

# 또는 udev 규칙 추가
sudo nano /etc/udev/rules.d/99-i2c.rules
```

다음 내용 추가:
```
SUBSYSTEM=="i2c-dev", MODE="0666"
```

### 서비스가 시작되지 않음

```bash
# 로그 확인
sudo journalctl -u nfc-bridge -n 50

# Node.js 경로 확인
which node

# 작업 디렉토리 확인
ls -la /home/pi/raspberry-pi-bridge/dist/index.js
```

## 아키텍처

```
┌─────────────────┐
│  Frontend       │
│  (React/Vite)   │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Express API    │
│  (Receipt       │
│   Controller)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Session Manager │
│  (Queue System) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PN532 Service  │
│  (I2C Control)  │
└────────┬────────┘
         │ I2C
         ↓
┌─────────────────┐
│   PN532 NFC     │
│   Hardware      │
└─────────────────┘
```

## 개발

### 디렉토리 구조

```
raspberry-pi-bridge/
├── src/
│   ├── controllers/       # API 컨트롤러
│   ├── services/          # 비즈니스 로직
│   │   ├── pn532.ts       # PN532 통신
│   │   └── session-manager.ts  # 세션 관리
│   ├── types/             # TypeScript 타입
│   ├── utils/             # 유틸리티
│   │   └── ndef.ts        # NDEF 인코딩
│   └── index.ts           # 엔트리 포인트
├── dist/                  # 빌드 출력
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### 테스트

```bash
# 헬스 체크
curl http://localhost:3001/api/health

# 세션 생성 테스트
curl -X POST http://localhost:3001/api/receipts \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-123",
    "includeReceipt": true,
    "orderType": "takeout",
    "totalPrice": 5000,
    "items": [{"name": "테스트", "quantity": 1}],
    "requestedAt": "2025-12-02T10:30:00Z"
  }'
```

## 라이센스

MIT

## 기여

이슈와 PR은 환영합니다!
