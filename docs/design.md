# UI/UX 디자인 가이드라인

*   **프로젝트명:** Trade Mate

## 1. 디자인 컨셉

*   **Keywords:** 신뢰성(Reliable), 직관성(Intuitive), 전문성(Professional).
*   **Theme:** 정보의 가독성을 최우선으로 하는 미니멀리즘 디자인. 복잡한 차트보다는 핵심 숫자 위주의 UI.

## 2. 컬러 팔레트 (Color Palette)

### 2.1. Primary Colors

*   **Brand Blue:** `#3B82F6` (Tailwind `blue-500`)
    *   주요 버튼, 강조, 활성화 탭.
*   **Background:** `#F9FAFB` (Tailwind `gray-50`)
    *   앱 전체 배경색.
*   **Surface:** `#FFFFFF` (White)
    *   카드, 모달, 바텀 시트 배경.

### 2.2. Semantic Colors (국내 주식 시장 기준)

*   **상승/매수 (Buy/Profit):** `#EF4444` (Tailwind `red-500`)
    *   *주의: 미국 시장 타겟 변경 시 Green으로 교체 필요. 현재는 한국 정서(빨강=상승) 반영.*
*   **하락/매도 (Sell/Loss):** `#3B82F6` (Tailwind `blue-500`)
*   **보합/중립:** `#6B7280` (Tailwind `gray-500`)

### 2.3. Text Colors

*   **Heading:** `#111827` (Tailwind `gray-900`) - 강한 강조.
*   **Body:** `#374151` (Tailwind `gray-700`) - 일반 텍스트.
*   **Caption:** `#9CA3AF` (Tailwind `gray-400`) - 날짜, 보조 설명.

## 3. 타이포그래피 (Typography)

*   **Font Family:** 시스템 폰트 (`-apple-system`, `Roboto`, `Pretendard` 등) 사용을 권장하여 로딩 속도 최적화.

**Scale:**

| Role        | Size        | Weight         | Usage             |
| :---------- | :---------- | :------------- | :---------------- |
| **H1**      | 24px ~ 30px | Bold (700)     | 금액 등 핵심 숫자 |
| **H2**      | 20px        | Bold (700)     | 화면 타이틀       |
| **H3**      | 16px        | SemiBold (600) | 카드 타이틀       |
| **Body**    | 14px        | Regular (400)  | 일반 텍스트       |
| **Caption** | 12px        | Regular (400)  | 날짜, 보조 설명   |

## 4. 컴포넌트 가이드

### 4.1. 버튼 (Buttons)

*   **Primary:** Full width (모바일 기준), 12px~16px 둥근 모서리(`rounded-xl`), 높이 48px~56px (터치 영역 확보).
*   **Action Button (FAB):** 탭 바 중앙에 위치, 그림자 효과(`shadow-lg`) 적용하여 떠있는 느낌 강조.

### 4.2. 카드 (Cards)

*   **매매 일지 리스트:** 흰색 배경, 옅은 그림자(`shadow-sm`), 16px 둥근 모서리.
*   **상태 표시:** 카드의 왼쪽 혹은 뱃지(Badge) 형태로 매수(RED)/매도(BLUE)를 명확히 구분.

### 4.3. 입력 폼 (Forms)

*   **Input Field:** 테두리가 없는 회색 배경(`bg-gray-50`) 스타일. 포커스 시 테두리나 링(`ring-2`)으로 강조.
*   **Label:** 필드 상단에 작게 배치하여 명확성 유지.

## 5. UX 인터랙션 규칙

*   **네비게이션:** 하단 고정 탭 바 (Bottom Navigation) 사용.
*   **로딩 상태:** 데이터 로드 시 빈 화면 대신 스켈레톤(Skeleton) UI 노출.
*   **피드백:** 저장, 삭제 등 액션 완료 시 Toast 메시지 (하단 팝업) 노출.
*   **에러 처리:** 네트워크 오류 시 "재시도" 버튼이 포함된 Empty State 화면 제공.