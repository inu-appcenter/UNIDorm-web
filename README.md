# 🏠 UNI Dorm (유니돔)

> **인천대학교 기숙사 생활을 더욱 편리하고 즐겁게!**  
> UNIDorm은 기숙사 사생들을 위한 룸메이트 매칭, 공동구매, 민원 접수 및 커뮤니티 기능을 제공하는 통합 플랫폼입니다.

---

## ✨ Key Features (주요 기능)

### 👥 룸메이트 매칭 (Roommate Matching)
- **생활 패턴 기반 필터링**: 수면 시간, 흡연 여부, 청소 주기 등 본인과 맞는 룸메이트를 쉽게 찾을 수 있습니다.
- **체크리스트**: 룸메이트와 함께 확인해야 할 항목들을 관리합니다.

### 📦 공동구매 (Group Purchase)
- **배달비/배송비 절약**: 기숙사 근처에서 함께 물건이나 음식을 주문할 파티원을 모집합니다.
- **키워드 알림**: 관심 있는 공동구매 품목이 올라오면 즉시 알림을 받습니다.

### 💬 실시간 채팅 (Real-time Chat)
- **룸메이트 & 공동구매**: 매칭된 상대나 공동구매 참여자들과 실시간으로 소통할 수 있습니다.

### 📋 기숙사 행정 & 커뮤니티
- **민원 접수**: 시설 보수 등 기숙사 관련 민원을 관리자에게 직접 전달하고 답변을 확인합니다.
- **공지사항 & 꿀팁**: 기숙사 공지사항과 사생들만의 생활 꿀팁을 공유합니다.
- **학사 일정**: 기숙사 및 학교의 주요 일정을 캘린더로 한눈에 확인합니다.

### 🛠 관리자 페이지 (Admin Panel)
- **통계 대시보드**: 사용자 및 서비스 이용 현황을 파악합니다.
- **콘텐츠 관리**: 공지사항 작성, 민원 답변, 팝업 알림 설정 등을 통합 관리합니다.

---

## 🛠 Tech Stack (기술 스택)

### Frontend
- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) v19
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### State Management & Data Fetching
- ![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)
- ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

### Styling & Animation
- ![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer-motion&logoColor=white)

### Communication & Real-time
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
- ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white) (STOMP)
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) (FCM & Push)

---

## 📁 Project Structure (프로젝트 구조)

```text
src/
├── apis/          # Axios 인스턴스 및 API 정의
├── assets/        # 이미지, 아이콘 등 정적 자원
├── components/    # 재사용 가능한 UI 컴포넌트
├── constants/     # 고정 값, 경로 설정
├── hooks/         # 커스텀 훅
├── pages/         # 주요 화면 페이지
├── routes/        # 라우팅 설정
├── stores/        # Zustand 상태 관리
├── styles/        # 전역 및 공통 스타일 (Styled-components)
├── types/         # TypeScript 타입 정의
└── utils/         # 공통 유틸리티 함수
```

---

## 🚀 Getting Started (시작하기)

### 1. Repository Clone
```bash
git clone https://github.com/inu-appcenter/UNIDorm-web.git
cd unidorm-web
```

### 2. Dependencies Install
```bash
npm install
```

### 3. Environment Variables (.env)
루트 디렉토리에 `.env` 파일을 생성하고 필요한 API Key 및 설정을 입력하세요.
```env
VITE_API_SUBDOMAIN=your_api_url
...
```

### 4. Run Development Server
```bash
npm run dev
```

---


© 2026 INU Appcenter. All rights reserved.
