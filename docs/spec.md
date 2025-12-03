# 기술 명세서 (Technical Specification)

*   **프로젝트명:** Trade Mate (주식 매매 일지 관리 하이브리드 앱)

## 1. 개요

본 프로젝트는 React 기반의 웹 애플리케이션을 모바일 환경(Android/iOS)에 최적화하여 패키징하는 하이브리드 앱 개발 프로젝트입니다. 사용자는 주식 매매 기록을 작성(수기/OCR)하고, 대시보드를 통해 수익률을 확인하며, 추후 AI 분석 기능을 제공받습니다.

## 2. 기술 스택 (Tech Stack)

### 2.1. Frontend (Client)

*   **Core Framework:** React 18+ (Vite 빌드 시스템 사용 권장)
*   **Language:** JavaScript (ES6+) 또는 TypeScript
*   **State Management:** React Context API + Hooks (규모 확장 시 Zustand 고려)
*   **Styling:** Tailwind CSS (유틸리티 퍼스트, 모바일 반응형 최적화)
*   **Routing:** React Router DOM (SPA 라우팅 처리)
*   **Icons:** Lucide-React (경량화된 벡터 아이콘)
*   **Charting:** Recharts (대시보드 차트 구현용)

### 2.2. Backend & Database (Serverless)

*   **Platform:** Google Firebase
*   **Authentication:** Firebase Auth (Google Sign-In, Apple Sign-In, Anonymous)
*   **Database:** Cloud Firestore (NoSQL Document Store)
*   **Storage:** Firebase Cloud Storage (매매 일지 스크린샷 이미지 저장)
*   **Hosting:** Firebase Hosting (웹 배포용)

### 2.3. Hybrid Packaging

*   **Framework:** Capacitor (by Ionic)
*   **Modules:**
    *   `@capacitor/core`: 핵심 런타임
    *   `@capacitor/camera`: 네이티브 카메라 접근 (OCR 촬영용)
    *   `@capacitor/filesystem`: 로컬 파일 처리
    *   `@capacitor/splash-screen`: 앱 구동 화면

### 2.4. External APIs (Future)

*   **OCR:** Google Cloud Vision API (이미지 텍스트 추출)
*   **AI:** OpenAI API or Gemini API (매매 패턴 분석 및 조언)

## 3. 시스템 아키텍처

### 3.1. 디렉토리 구조 (제안)

```
/src
  /assets       # 정적 이미지, 폰트
  /components   # 재사용 가능한 UI 컴포넌트 (Button, Card, Modal)
  /contexts     # 전역 상태 관리 (AuthContext, ThemeContext)
  /hooks        # 커스텀 훅 (useFirestore, useStorage)
  /layouts      # 페이지 레이아웃 (MainLayout, AuthLayout)
  /pages        # 주요 화면 (Home, Journal, AddEntry, Profile)
  /services     # Firebase 및 외부 API 통신 로직
  /utils        # 헬퍼 함수 (날짜 포맷팅, 숫자 콤마 등)
```

### 3.2. 보안 및 인증 흐름

1.  앱 실행 시 `AuthContext`에서 로그인 상태 확인.
2.  **비로그인 시:** `LoginScreen`으로 라우팅 (또는 게스트 모드).
3.  **로그인 시:** Firebase Token을 획득하고 Firestore 보안 규칙에 따라 사용자 데이터 접근 권한 부여.

## 4. 핵심 기능 로직

### 4.1. 매매 일지 기록 (CRUD)

*   **Create:** 수기 입력 폼 데이터 + (옵션) 이미지 URL을 Firestore에 저장.
*   **Read:** 날짜 내림차순 정렬, 인피니트 스크롤(Pagination) 적용.
*   **Update/Delete:** 본인 작성 문서에 한해 수정/삭제 가능.

### 4.2. OCR 이미지 분석 (Smart Scan)

1.  Capacitor Camera로 사진 촬영/선택.
2.  이미지를 Blob 형태로 변환 후 Cloud Storage 임시 경로 업로드 (또는 Base64 전송).
3.  Cloud Function 트리거 또는 클라이언트에서 Vision API 호출.
4.  반환된 텍스트에서 정규식(Regex)을 이용해 '종목명', '단가', '수량', '매수/매도' 키워드 파싱.
5.  파싱된 데이터를 입력 폼에 프리필(Pre-fill).

### 4.3. 대시보드 계산

클라이언트 사이드 계산을 원칙으로 함 (데이터 양이 많아질 경우 Cloud Functions 집계 고려).

*   **총 손익:** `∑((매도단가 - 매수평단가) * 수량)`
*   **승률:** `(이익 거래 횟수 / 전체 청산 거래 횟수) * 100`

## 5. 배포 전략

*   **Web:** Firebase Hosting을 통한 HTTPS 제공.
*   **App:** Capacitor sync 명령어를 통해 android 및 ios 네이티브 프로젝트 생성 후 각 스토어 심사 제출.