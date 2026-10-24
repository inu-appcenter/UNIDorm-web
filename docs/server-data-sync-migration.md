# 서버 데이터 자동 동기화 · useQuery 마이그레이션 (진행 중)

> 작업 브랜치: `UNIDorm-web` `feat/query-data-sync` (`origin/test` 기준, **아직 커밋 안 함**)
> 마지막 갱신: 2026-10-24 · 현재 `tsc -b` 통과

## 1. 목표

기능 개발자가 특별히 신경 쓰지 않아도, 다른 웹뷰(서브 화면)에서 작성·수정·삭제한
내용이 다른 화면에 자동으로 반영되게 한다.

규칙은 단 두 가지:

1. **조회는 `src/queries/*` 의 `useQuery` 훅으로만** 한다 (페이지에서 GET API 직접 호출 금지).
2. **쓰기는 평소처럼 `src/apis/*` 함수를 호출**한다. 캐시 무효화는 인프라가 자동 처리.

## 2. 배경

- 앱(`unidorm-app`)은 메인 탭이 아닌 화면마다 **별도 웹뷰**(별도 JS 런타임·QueryClient)를 띄운다.
- 스택 아래 웹뷰는 마운트된 채 남고, 브라우저 `focus`/`visibilitychange` 도 받지 못한다.
- 그래서 위 웹뷰에서 쓴 글이 아래 목록에 반영되지 않았다.
- 1차 수정(PR #390, `test` 머지됨): 네이티브 `pageFocus` 이벤트 + 화면별 `usePageFocus`.
  화면마다 손으로 붙여야 해서, 이번 작업으로 **인프라 자동화 + useQuery 전면 전환**을 진행 중.
- 앱 쪽 `pageFocus` 전송: `unidorm-app` PR #50 (`main` 머지됨). 새 앱 빌드에 포함돼야 동작.

## 3. 설계 (구현 완료)

### `src/utils/serverDataSync.ts`
- `trackServerWrites(instance)`: axios 응답 인터셉터. `POST/PUT/PATCH/DELETE` 성공 시
  - **이 웹뷰**: `meta.sync` 가 `"all"`(기본)인 쿼리를 `invalidateQueries` (화면에 떠 있는 것만 재조회)
  - **다른 웹뷰**: `unidorm-server-data-changed` 채널로 알림 (BroadcastChannel + 네이티브 `relayBroadcastSync`)
  - 제외: `/users/refreshToken`, `/fcm/token` (`NON_DATA_WRITES`)
  - 한 틱에 여러 쓰기는 한 번만 처리 (`queueMicrotask`)
- `installServerDataSync(queryClient)`: `App.tsx` 에서 호출. `pageFocus` 수신 시 **다른 웹뷰에서
  쓰기가 있었던 경우에만** `meta.sync !== "none"` 쿼리를 무효화. 변경이 없으면 요청 0.
- `tokenInstance.ts`, `axiosInstance.ts` 끝에서 `trackServerWrites(...)` 호출 (적용됨).

### 쿼리 `meta.sync` (`QuerySyncMode`, react-query `Register` 로 타입 지정됨)
| 값 | 의미 | 사용처 |
|---|---|---|
| `"all"` (기본) | 어느 웹뷰에서든 쓰기 후 재조회 | 대부분 |
| `"otherWebViews"` | 다른 웹뷰 쓰기 후 복귀 시에만 | **조회 시 조회수가 오르는 상세**: 공지 상세, 공동구매 상세 (서버 확인: 이 두 개뿐) |
| `"none"` | 자동 재조회 안 함 | 유튜브, A/B 테스트, 활성 팝업 공지(다시 열림 방지), 오늘의 꿀팁(무작위) |

### `src/hooks/useInitFromQuery.ts`
- 쿼리 데이터를 폼 상태로 **처음 한 번만** 복사 (수정 폼 초기값). 자동 재조회가 입력 중인 내용을 덮어쓰지 않게.
- `key` 인자가 바뀌면(다른 글 수정) 다시 복사.

### `src/queries/` (작성 완료)
- `announcements.ts` — `useAnnouncementScroll`, `useLatestAnnouncements`(홈용, **아직 홈에서 미사용**), `useAnnouncementDetail`
- `popupNotifications.ts` — `useActivePopupNotifications`, `useAdminPopupNotifications`, `usePopupNotification`
- `complaints.ts` — `useMyComplaints`, `useComplaintDetail(id, { asAdmin })`, `useAdminComplaints(filters)`
- `tips.ts` — `useTips`, `useDailyRandomTips`(홈용, 미사용), `useTipDetail`
- `groupPurchases.ts` — `useGroupPurchaseList`, `useGroupPurchaseDetail`, `useGroupPurchaseKeywordAlerts`, `useGroupPurchaseCategoryAlerts`
- `surveys.ts` — `useSurveys`, `useSurveyDetail`, `useSurveyResults`

키 규칙: `<domain>Keys` 팩토리, 첫 원소는 도메인 이름 (`["announcements", ...]`).

## 4. 마이그레이션 현황

### 완료 (useQuery 전환 + `usePageFocus`/`notifyDataChanged`/수동 `invalidateQueries` 제거)
- 공지: `AnnouncementPage`, `AnnounceDetailPage`, `Admin/AnnounceWritePage`
- 팝업 공지: `Admin/PopupNotiListPage`, `Admin/PopupNotiFormPage`
- 민원: `ComplainListPage`, `ComplainDetailPage`, `Admin/ComplainAdminPage`
- 꿀팁: `TipListPage`, `TipDetailPage`, `TipWritePage` (페이지의 `tokenInstance` 직접 호출 → `apis/tips.ts` 함수로 이동)
- 공동구매: `GroupPurchaseMainPage`, `GroupPurchasePostPage`, `GroupPurchaseWritePage`, `KeywordAlertSettingPage`
- 설문: `FormListPage`, `FormDetailPage`, `Admin/FormResultPage`
- `components/comment/CommentSection.tsx`: `setisneedupdate` prop 제거 (삭제 후 재조회는 자동 / 공동구매는 `handleDeleteComment` 에서 `refetch()`)

### ⚠️ 현재 브랜치의 일시적 회귀
`App.tsx` 가 `installPageFocusRefresh` 대신 `installServerDataSync` 를 호출하므로, 아직 전환 안 된
화면의 `usePageFocus` 콜백은 **지금 동작하지 않는다**. 아래 화면을 모두 전환한 뒤
`src/hooks/usePageFocus.ts`, `src/utils/pageFocus.ts`, `src/utils/__tests__/pageFocus.test.ts` 를 삭제할 것.
(`usePageFocus` 사용 중: `MyInfoArea`, `ChatListPage`, `openChatPage`, `HomePage`, `MyLikesPage`, `MyPage`, `MyPostsPage`, `MyRoomMatePage`)

### 남은 작업 (화면별 메모)

**캘린더** — 새 모듈 `queries/calendar.ts`
- [ ] `components/calendar/Calendar.tsx`: 보이는 날짜 범위의 월들(`getCalendarByMonth`)을 `useQueries` 로. 날짜 클릭 시 `getCalendarDetail` 은 사용자 동작이라 `queryClient.fetchQuery` 로 바꾸거나 `useQuery(enabled: 선택됨)`.
- [ ] `Admin/CalendarAdminPage.tsx`: `getAllCalendars` → `useQuery`. 저장 후 `await fetchCalendar()` 호출 제거 (자동).

**홈** — `HomePage.tsx`
- [ ] `fetchHomeLists`(공동구매·공지·설문) → `useGroupPurchaseList({sort:"마감임박순", type:"전체"})`, `useLatestAnnouncements()`, `useSurveys()` + 정렬은 `useMemo`.
- [ ] 팝업 공지 → `useActivePopupNotifications()`. `modalOpenStates` 는 `useInitFromQuery` 로 한 번만 초기화, `mixpanelTrack.popupViewed` 도 한 번만.
- [ ] 오늘의 꿀팁 → `useDailyRandomTips()`.
- [ ] 룸메이트 useQuery 는 `queries/roommates.ts` 로 이동. `homeLoadComplete` mixpanel 은 공지 첫 로드 시 한 번.

**마이페이지·회원** — 새 모듈 `queries/members.ts`
- [ ] `MyPage.tsx` (`getMyRoommateInfo`, 404 = 룸메이트 없음 처리 유지, mixpanel 한 번)
- [ ] `components/mypage/MyInfoArea.tsx` (`getMemberImage`)
- [ ] `MyPage/MyInfoEditPage.tsx` (`getMemberInfo`, `getMemberImage` → `useInitFromQuery`)
- [ ] `MyPostsPage.tsx` (`getMemberPosts`), `MyLikesPage.tsx` (`getMemberLikePosts`)
- [ ] `MyPage/NotificationSettingPage.tsx` (`getUserNotificationPreferences` → `useInitFromQuery`)
- [ ] `MyPage/DebugLogPage.tsx`: `tokenInstance` 직접 사용 — 디버그 화면이라 lint 예외 처리해도 됨

**룸메이트** — 새 모듈 `queries/roommates.ts`
- [ ] `RoomMate/MyRoomMatePage.tsx`: 룸메이트 정보·시간표 2종은 useQuery. **방 규칙(`getMyRoommateRules`)은 편집 텍스트라 `useInitFromQuery`**. 404 안내 alert 는 첫 로드 때만.
- [ ] `RoomMate/RoomMateBoardDetailPage.tsx` (`getRoomMateDetail`/`getOpponentChecklist`, `getMemberInfo`). 수동 `invalidateQueries(["roommates"...])` 제거.
- [ ] `RoomMate/RoomMateChecklistPage.tsx` (`getMyChecklist` → `useInitFromQuery`, 수동 invalidate 제거)
- [ ] `RoomMate/RoomMateFindSettingPage.tsx` (`getNotificationFilter` → `useInitFromQuery`, 수동 invalidate 제거)
- [ ] `RoomMate/RoomMateListPage.tsx`, `RoomMate/RoomMatePage.tsx`: 이미 useQuery — queryFn 을 `queries/roommates.ts` 로 이동
- [ ] `components/roommate/RoomMateBottomBar.tsx` (`getBlockedUsers`, `getRoommateLiked`; 수동 invalidate 제거)
- [ ] `hooks/useRoommateMatchingStatus.ts`: 이미 useQuery, 그대로 두거나 `queries/roommates.ts` 로 이동

**채팅** — 새 모듈 `queries/chat.ts`
- [ ] `components/common/BottomBar/BottomBar.tsx`: **안 읽음 배지가 `pathname` 바뀔 때만 조회 → 채팅 읽고 돌아와도 안 줄어드는 버그**. `useQuery` 로 전환하면 해결 (읽음 처리 PATCH 가 쓰기로 감지됨). `getMyRoommateInfo` 도.
- [ ] `components/chat/ChatListItem.tsx` (`getRoommateChatUnreadCount`)
- [ ] `Chat/ChatListPage.tsx` (탭별 `getGroupOrderChatRooms`/`getRoommateChatRooms`)
- [ ] `Chat/openChatPage.tsx`: 직접 구현한 페이지네이션 + `useChatListStore` + 10초 폴링. `useInfiniteQuery` 로 바꾸면 폴링은 `refetchInterval` 로. 범위가 커서 조심.
- [ ] `Chat/BlockListPage.tsx` (`getBlockedUsers`)
- [ ] `Chat/ChatNotificationSettingsPage.tsx` (`getOpenChatNotificationMode` → `useInitFromQuery`)
- [ ] `Chat/OpenChatEditPage.tsx` (`getOpenChatRooms` 로 방 정보 → `useInitFromQuery`)
- [ ] `Chat/ChatMembersPage.tsx` (참여자·차단·방 정보)
- [ ] `Chat/ChattingPage.tsx` (2600줄, 소켓·메시지 히스토리 페이지네이션): **메시지 히스토리는 전환하지 말고** 방 정보·참여자·공개 상태만 useQuery 로. 나머지는 lint 예외 주석(사유 명시).

**관리자 기타**
- [ ] `Admin/CreateNotificationPage.tsx` (`getFcmStats`)
- [ ] `Admin/FeatureFlagManagePage.tsx` (이미 `useFeatureFlags`; 수동 `invalidateQueries` 제거)
- [ ] `Admin/OpenChatAdminPage.tsx`, `Admin/OpenChatBotPage.tsx` (`getAdminOpenChatRooms`), `Admin/OpenChatReportAdminPage.tsx` (`getOpenChatReports`)
- [ ] `Admin/StatisticsPage.tsx` (`getStatistics`, `getStatisticsTotal`)

**알림**
- [ ] `NotificationPage.tsx`: 이미 `useInfiniteQuery` — queryFn 을 `queries/notifications.ts` 로 이동

**그대로 두는 것**
- `hooks/useAppInit.ts` (앱 부트스트랩), `hooks/useFcmToken.ts` (`/fcm/token` 쓰기), 다운로드 함수(`download*`, `getSurveyResultExcel`) 같은 사용자 동작 GET

## 5. 마무리 단계

1. [ ] 위 화면 전부 전환 후 `usePageFocus.ts`, `pageFocus.ts`, `pageFocus.test.ts` 삭제
2. [ ] `serverDataSync` 단위 테스트 추가 (`pageFocus.test.ts` 참고: `vi.stubGlobal("window", { ReactNativeWebView: { postMessage } ... })`)
   - 쓰기 성공 → 이 웹뷰 invalidate (`sync:"all"` 만) + 다른 웹뷰로 relay
   - `/users/refreshToken`, `/fcm/token` 은 무시
   - `pageFocus` 는 다른 웹뷰 쓰기가 있었을 때만 invalidate, `sync:"none"` 제외
3. [ ] lint 규칙 (`eslint.config.js`, `src/pages/**`, `src/components/**` 대상):
   - `no-restricted-imports` → `patterns: [{ group: ["@/apis/*", "**/apis/*"], importNamePattern: "^(get|fetch|search)", message: "조회는 src/queries 의 useQuery 훅을 쓰세요 (docs/server-data-sync-migration.md)" }]`
   - `tokenInstance`/`axiosInstance` 직접 import 금지 (`paths`)
   - 예외(ChattingPage 메시지 히스토리, DebugLogPage)는 `// eslint-disable-next-line ... -- 사유` 로
4. [ ] `CLAUDE.md` 생성(웹 레포에 없음): 위 "규칙 두 가지" + `meta.sync` 표 + `useInitFromQuery` + 조회수 API 주의를 짧게
5. [ ] 검증: `npx tsc -b`, `npx eslint .`(기존 경고 대비 신규 없음), `npx vitest run`
6. [ ] 커밋 → `test` 로 PR → 머지 (사용자 지시: 웹은 `test`, 앱은 `main`)

## 6. 주의사항 (삽질 방지)

- **줄바꿈**: `core.autocrlf=true` + 파일마다 CRLF/LF 가 섞여 있음.
  - 수정 시 원래 줄바꿈 유지 (`patchlib.py` 처럼 읽을 때 `\r\n→\n`, 쓸 때 되돌리기). Write/Edit 도구는 CRLF 로 쓸 수 있음.
  - diff 는 `git -c core.autocrlf=false diff`, 커밋도 `git -c core.autocrlf=false commit` 으로 (안 그러면 파일 통째로 바뀐 것처럼 보임).
  - 브랜치 전환 후 줄바꿈만 다른 노이즈가 생기면 `git -c core.autocrlf=false checkout -- .`
- **조회수**: 서버(`UNIDorm-Server`, 읽기 전용)에서 상세 GET 이 조회수를 올리는 건 공지(`AnnouncementService.plushViewCountIfManualAnnouncement`)와 공동구매(`GroupOrderService.findGroupOrder`) 두 곳뿐. 새 게시판 상세에 조회수가 있으면 `meta: { sync: "otherWebViews" }`.
- **스피너**: `isLoading` 은 첫 로드에만 true. 필터 변경 시 스피너가 필요하면 `placeholderData: prev` + `isPlaceholderData` (민원 관리자 화면 참고).
- **mixpanel 조회 추적**: 데이터 바뀔 때마다 찍히지 않게 `useRef` 로 id 당 한 번 (공지·민원·꿀팁 상세 참고).
- **좋아요 등 즉시 반영**: 로컬 state 를 쿼리 데이터에서 `useEffect` 로 동기화하고 클릭 시 로컬 갱신 → 재조회되면 서버 값으로 맞춰짐 (꿀팁·공동구매 상세 참고).
- `npm`/`npx` 실행 전 `unset -f npm node npx 2>/dev/null` (앱 레포 AGENTS.md 참고).
