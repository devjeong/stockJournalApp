# 데이터베이스 설계 (Firestore Schema)

Firestore는 NoSQL 문서(Document) 기반 데이터베이스입니다. 관계형 DB와 달리 컬렉션(Collection)과 문서(Document) 구조를 사용합니다.

## 1. 최상위 구조

**Root Collections:**

*   `users`: 사용자 정보 및 하위 컬렉션 관리
*   `public_data`: 뉴스, 공지사항 등 공용 데이터 (추후 확장)

## 2. 컬렉션 상세 설계

### 2.1. Users Collection

*   **Path:** `/artifacts/{appId}/users/{userId}`
*   **Description:** 각 사용자의 기본 정보 및 설정값을 저장합니다.

**Fields:**

| Field Name    | Type      | Description                            | Example               |
| :------------ | :-------- | :------------------------------------- | :-------------------- |
| `uid`         | String    | Firebase Auth UID (Document ID와 동일) | `7d8f9a...`           |
| `email`       | String    | 사용자 이메일                          | `user@example.com`    |
| `displayName` | String    | 사용자 닉네임                          | `주식왕`              |
| `createdAt`   | Timestamp | 가입 일시                              | `2023-10-01 12:00:00` |
| `preferences` | Map       | 사용자 설정 (테마, 알림 등)            | `{ theme: 'light' }`  |

### 2.2. Trade Logs Collection (Sub-collection)

*   **Path:** `/artifacts/{appId}/users/{userId}/trade_logs/{logId}`
*   **Description:** 사용자의 개별 매매 기록을 저장합니다. `users` 컬렉션의 하위 컬렉션(Sub-collection)으로 설계하여 사용자 데이터 격리 및 쿼리 효율성을 높입니다.

**Fields:**

| Field Name    | Type      | Description                          | Example                      |
| :------------ | :-------- | :----------------------------------- | :--------------------------- |
| `id`          | String    | 로그 고유 ID (Auto ID)               | `log_abc123`                 |
| `date`        | String    | 매매 날짜 (ISO 8601 YYYY-MM-DD 권장) | `2023-10-25`                 |
| `ticker`      | String    | 종목명                               | `삼성전자`                   |
| `type`        | String    | 매매 유형 (`buy` 또는 `sell`)        | `buy`                        |
| `price`       | Number    | 단가 (숫자형으로 저장)               | `68000`                      |
| `quantity`    | Number    | 수량                                 | `10`                         |
| `totalAmount` | Number    | 총액 (`price * quantity` - 수수료)   | `680000`                     |
| `imageUrl`    | String    | (Optional) 업로드한 스크린샷 URL     | `https://firebasestorage...` |
| `notes`       | String    | (Optional) 매매 일지/메모            | `지지선 터치하여 매수함`     |
| `createdAt`   | Timestamp | 기록 생성 일시 (정렬용)              | `serverTimestamp()`          |

## 3. 인덱스 설정 (Indexing)

복합 쿼리(정렬 및 필터 동시 사용)를 위해 다음과 같은 인덱스가 필요할 수 있습니다.

1.  **날짜별 조회:** `trade_logs` 컬렉션
    *   Fields: `date` (Descending)
2.  **종목별 + 날짜순 조회:** `trade_logs` 컬렉션
    *   Fields: `ticker` (Ascending) + `date` (Descending)

## 4. 보안 규칙 (Security Rules)

데이터 무결성과 프라이버시를 위해 다음과 같은 규칙 적용이 필수입니다.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId} {
      // 본인 데이터만 읽기/쓰기 허용
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /trade_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
