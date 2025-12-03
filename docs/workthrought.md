# 개발 작업 목록 (Roadmap & Tasks)

## Phase 0: 프로젝트 초기 설정 (Setup)

- [x] React + Vite 프로젝트 생성 (Javascript/Typescript 선택)
- [x] Tailwind CSS 설치 및 `tailwind.config.js` 설정
- [x] Firebase 프로젝트 생성 (Console) 및 Web App 등록
- [x] `.env` 환경 변수 설정 (Firebase Config Key 등)
- [x] 기본 디렉토리 구조 생성 및 Router 설정 (`react-router-dom`)

## Phase 1: 인증 및 회원가입 (Authentication)

- [x] Firebase Authentication 활성화 (Google, Apple, Anonymous)
- [x] `AuthContext` 구현 (로그인 상태 전역 관리)
- [x] 로그인 화면 (`LoginScreen`) UI 개발
- [x] 소셜 로그인 버튼 연동 및 리다이렉트 처리
- [x] 로그아웃 기능 구현

## Phase 2: 매매 일지 핵심 기능 (Core Feature)

- [x] Firestore 데이터베이스 구조 설계 및 보안 규칙 설정
- [x] 매매 일지 작성 폼 (`AddEntryScreen`) UI 개발
- [x] **[CRUD]** 매매 일지 생성 (Create) 기능 구현 (수기 입력)
- [x] **[CRUD]** 매매 일지 리스트 조회 (Read) 기능 구현 (메인/일지 탭)
- [x] **[CRUD]** 매매 일지 삭제 (Delete) 기능 구현
- [x] **[CRUD]** 매매 일지 수정 (Update) 기능 구현

## Phase 3: 대시보드 및 통계 (Dashboard)

- [x] 메인 홈 화면 (`HomeScreen`) UI 개발
- [x] 이번 달 실현 손익 계산 로직 구현
- [x] 승률 및 총 매매 횟수 집계 로직 구현
- [x] 최근 매매 활동 리스트 위젯 구현

## Phase 4: 이미지 및 OCR (Advanced)

- [x] Firebase Storage 활성화 및 보안 규칙 설정
- [x] `AddEntryScreen`에 이미지 업로드 기능 추가
- [x] (Mockup) OCR 시뮬레이션 로직 구현 (실제 API 연동 전 단계)
- [x] (Optional) Google Vision API 연동 테스트

## Phase 5: 하이브리드 앱 패키징 (Mobile)

- [x] Capacitor 설치 및 초기화 (`npx cap init`)
- [x] Android 플랫폼 추가 및 빌드 테스트 (`npx cap add android`)
- [x] iOS 플랫폼 추가 및 빌드 테스트 (`npx cap add ios`)
- [x] 앱 아이콘 및 스플래시 스크린 설정 (`@capacitor/assets`)
- [x] 모바일 네이티브 기능 테스트 (Safe Area, 뒤로가기 버튼 등)

## Phase 6: 마무리 및 배포 (Deploy)

- [x] 로딩 스피너 및 스켈레톤 UI 적용
- [x] 에러 핸들링 (네트워크 끊김, 데이터 없음 등)
- [x] Firebase Hosting 배포
- [x] (Optional) 스토어 배포용 APK/IPA 빌드