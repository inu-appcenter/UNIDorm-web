# UNIDorm-web 아키텍처 및 서버 데이터 동기화 가이드

이 문서는 UNIDorm 웹 프론트엔드의 서버 데이터 관리 원칙과 자동 동기화 아키텍처 가이드를 설명합니다.

---

## 1. 서버 데이터 아키텍처 핵심 원칙

React Native 멀티 웹뷰 환경에서는 화면(라우트)마다 독립된 JS 런타임과 React Query 캐시를 가집니다.
데이터 정합성을 유지하기 위해 화면 코드에서 수동으로 화면 포커스(`usePageFocus`)나 `invalidateQueries`를 관리하지 않고, **중앙 인프라 차원에서 자동 동기화**합니다.

### 📌 2가지 개발 규칙
1. **조회(Query)**: 반드시 `src/queries/*`에 정의된 `useQuery` 커스텀 훅을 사용합니다.
   - 🚫 컴포넌트 내부에서 `@/apis/*`의 `get*`, `fetch*`, `search*` API 함수를 직접 호출하지 마세요. (ESLint 규칙으로 강제됨)
   - 🚫 `axios`, `tokenInstance`, `instance`를 컴포넌트/화면에서 직접 import하지 마세요.
2. **쓰기(Mutation/Action)**: 평소처럼 `@/apis/*`의 함수를 호출하기만 하면 됩니다.
   - Axios 응답 인터셉터(`serverDataSync`)가 쓰기 요청(`POST`, `PUT`, `PATCH`, `DELETE`) 성공을 자동 감지합니다.
   - 현재 웹뷰의 쿼리는 microtask 단위로 디바운스되어 자동 무효화(`invalidateQueries`)됩니다.
   - 다른 웹뷰에는 브로드캐스트 채널(`MultiWebViewChannel` + 네이티브 앱 브릿지)로 변경 사실이 전파되며, 사용자가 해당 화면으로 복귀(`pageFocus`)할 때 필요한 쿼리만 조건부로 갱신됩니다.

---

## 2. 쿼리 자동 재조회 범위 (`meta.sync`)

쿼리 생성 시 `meta.sync` 옵션을 통해 무효화 범위를 지정할 수 있습니다.

| `meta.sync` 모드 | 동작 방식 | 주요 적용 대상 |
| :--- | :--- | :--- |
| `"all"` (기본값) | 현재 웹뷰 및 다른 웹뷰에서 쓰기 발생 시 모두 자동 재조회 | 대부분의 목록, 프로필 정보, 공지, 게시글 등 |
| `"otherWebViews"` | 다른 웹뷰에서 쓰기가 발생하여 복귀했을 때만 재조회 (현재 웹뷰 내 쓰기 시 재조회 건너뜀) | **조회 시 조회수가 자동 증가하는 상세 API** (공지 상세, 공동구매 상세 등) |
| `"none"` | 서버 데이터 변경이 있어도 자동으로 재조회하지 않음 | 앱 외부 API (유튜브 비디오), 화면 이동으로 바뀌지 않는 실험 그룹 (A/B 테스트 등) |

### ⚠️ 조회수 부수효과 API 주의사항
상세 조회 시 서버에서 조회수 카운트가 올라가는 API(공지 상세, 공동구매 상세)는 동일 화면에서 사용자가 '좋아요'나 '댓글'을 달았을 때 다시 조회수가 증가하면 안 됩니다.
따라서 이 경우 반드시 `meta: { sync: "otherWebViews" }`를 지정해야 합니다.

```typescript
export const useAnnouncementDetail = (id: number) =>
  useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => getAnnouncementDetail(id).then((res) => res.data),
    meta: { sync: "otherWebViews" },
  });
```

---

## 3. 폼/입력 편집 상태 보호 (`useInitFromQuery`)

수정 페이지(내 정보 수정, 방 규칙 수정, 알림 설정 등)에서 서버 쿼리 데이터로 폼 상태를 초기화할 때, 단순 `useEffect([data])`를 쓰면 사용자가 입력하는 도중에 다른 웹뷰의 쓰기로 인해 쿼리가 갱신되어 입력 중인 내용이 덮어씌워질 위험이 있습니다.

반드시 `useInitFromQuery` 훅을 사용하여 **첫 성공 응답 1회만** 폼 상태로 복사하도록 설계하세요:

```typescript
const { data: memberImage } = useMemberImage();
const [profileUrl, setProfileUrl] = useState<string | null>(null);

// 첫 데이터 수신 시 1회만 상태를 초기화하여 사용자 입력 덮어쓰기 방지
useInitFromQuery(memberImage, (image) => {
  setProfileUrl(image.photoUrl);
});
```

---

## 4. 디렉터리 구조 및 쿼리 키 컨벤션

```
src/
├── apis/          # 순수 HTTP 요청 함수 (POST, PUT, DELETE, GET 정의)
│   └── tokenInstance.ts
├── queries/       # React Query 전용 훅 및 키 팩토리 (컴포넌트는 여기만 바라봄)
│   ├── announcements.ts
│   ├── calendar.ts
│   ├── chat.ts
│   ├── complaints.ts
│   ├── groupPurchases.ts
│   ├── members.ts
│   ├── notifications.ts
│   ├── roommates.ts
│   ├── surveys.ts
│   └── tips.ts
└── utils/
    └── serverDataSync.ts  # 쓰기 인터셉터 및 멀티 웹뷰 포커스 동기화 코어
```

모든 쿼리 모듈은 일관된 키 팩토리 패턴(`*Keys`)을 유지해야 합니다:
```typescript
export const calendarKeys = {
  all: ["calendar"] as const,
  month: (year: number, month: number) =>
    [...calendarKeys.all, "month", year, month] as const,
  detail: (id: number) => [...calendarKeys.all, "detail", id] as const,
};
```
