# UNIDorm-web AI 세션 상시 규칙

`UNIDorm-web`에서 UI, 컴포넌트, 페이지, 스타일을 작성하거나 수정하는 모든 AI 세션은 작업 시작 전 아래 규칙과 상세 가이드라인(`docs/ui-ux-guideline.md`)을 먼저 확인하고 따른다.

---

## 1. 작업 시작 전 필수 탐색

1. 상세 기준 문서 `docs/ui-ux-guideline.md`를 확인한다.
2. 서버 데이터 조회·쓰기·폼 초기화 규칙은 `CLAUDE.md`를 따른다(`src/queries/*` 훅 사용, `useInitFromQuery` 사용, `axios`/`tokenInstance`/`instance` 직접 import 금지).
3. 새 UI를 만들기 전 아래 경로를 순서대로 탐색해 기존 자산을 먼저 재사용한다.
   - 공용 컴포넌트: `src/components/common/`, `src/components/button/`, `src/components/modal/`
   - 도메인 컴포넌트: `src/components/<domain>/` (`home`, `roommate`, `chat`, `complain`, `GroupPurchase`, `mypage`, `portal`, `announce`, `calendar`, `comment`, `form`, `notification`, `tip`)
   - 이미지·아이콘 에셋: `src/assets/`
   - 공용 스타일 조각: `src/styles/` (`header.ts`, `auth.ts`, `common.ts`, `announcement.ts`, `groupPurchase.ts`)

---

## 2. 스타일링·토큰·레이아웃 강제 규칙

1. **스타일링 스택**: `styled-components`만 사용한다. Tailwind 유틸리티 클래스를 쓰지 않는다. `src/` 내부 import는 `@/` 별칭을 사용한다.
2. **디자인 토큰**:
   - 일반 화면은 `@/styles/tokens`(`colors`, `typography`)를 사용한다.
   - 포털·사생증 도메인(`src/pages/Dormitory/`, `src/components/portal/`, `CapsuleButton`, `ActionButton`)은 `src/styles/portalVariables.css`, `unidormTypography.ts`, `unidormEffects.ts`를 사용한다.
   - 두 토큰 체계를 한 컴포넌트에서 임의로 혼용하거나 새 HEX 색상·폰트를 하드코딩하지 않는다.
3. **배경색 단일 원본(SSOT)**:
   - `src/routes/Router.tsx`의 모든 라우트에 `handle: { bg: "white" | "gray" }`를 선언한다.
   - 페이지 최상위 루트 래퍼 styled 컴포넌트에 `background` / `background-color`를 직접 선언하지 않는다(`transparent`/`none` 제외).
4. **레이아웃 셸과 헤더 위임**:
   - `RootPage` / `SubPage` 하위 페이지에서 `Header`나 `BottomBar`를 중복 렌더링하지 않는다.
   - 헤더 제어는 `useSetHeader`, 전역 AI 챗봇 버튼 제어는 `useSetAIChat`을 사용한다.
   - `ContentContainer`가 상단 헤더(`70px + var(--safe-area-top, 0px)`)와 하단 바 여백을 이미 확보하므로 상단 패딩을 중복 적용하지 않는다.
5. **Safe Area와 z-index**:
   - 상하좌우 안전 영역에는 `var(--safe-area-top, 0px)`, `var(--safe-area-bottom, 0px)`, `var(--safe-area-left, 0px)`, `var(--safe-area-right, 0px)`를 사용한다.
   - 하단 고정 CTA(`position: fixed; bottom: 0`)를 둘 때는 `padding-bottom`에 `var(--safe-area-bottom, 0px)`를 더하고, 스크롤 본문 하단 여백을 버튼 높이 이상 확보한다.
   - `Header`(`10000`)를 덮어야 하는 확인 모달은 `PortalConfirmModal`(`20000`)을 우선 사용한다(`Modal`은 `9999`).
6. **멀티 웹뷰 이동**:
   - 새 웹뷰 전환 시 `location.state`가 유실되므로 상세 식별자는 URL 경로 또는 쿼리(`?id=...`)로 전달한다.

---

## 3. 공용 컴포넌트·에셋 재사용 매핑

페이지 파일 안에 버튼·모달·입력창·스켈레톤·빈 상태를 즉석으로 새로 작성하지 않는다. 기존 컴포넌트에 선택적 props를 추가하거나 `styled(기존컴포넌트)`로 감싸서 쓴다.

- **버튼·칩**: `SquareButton` (`@/components/common/SquareButton`), `RoundSquareButton` / `RoundSquareWhiteButton` (`@/components/button/*`), `ChipButton` (`@/components/button/ChipButton`), `CapsuleButton` / `CapsuleButton.Group` (`@/components/common/CapsuleButton`), `ActionButton`, `HeartToggleButton`, `SelectableChipGroup`
- **모달·시트·알림**: `PortalConfirmModal` (`@/components/portal/PortalConfirmModal`), `CommonBottomSheet` (`@/components/modal/CommonBottomSheet`), `Modal` (`@/components/modal/Modal`), `TopPopupNotification`, `TooltipMessage`, `TopRightDropdownMenu`
- **섹션·배지·목록**: `TitleContentArea`, `TitleLine`, `Box`, `Divider`, `GrayDivider`, `DormitoryBadge`, `TagIconBlueBackground`, `TagIconWhiteBackground`, `UserInfo`, `SortDropBox`, `MenuGroup`
  - **기숙사별 고유 컬러 표준**: 기숙사를 표시할 때는 반드시 `DormitoryBadge`를 사용해 `1기숙사`(회색: `#8e8e93`/`#6f6f6f`, subtle `#f2f4f6`/`#4e5968`), `2기숙사`(파란색: `#1677ff`/`#0958d9`, subtle `#e8f3ff`/`#0958d9`), `3기숙사`(빨간색: `#ff6b6b`/`#e03131`, subtle `#fff1f0`/`#cf1322`) 고유 컬러를 유지한다. 복수 기숙사(`1·2기숙사`, `2·3기숙사`)를 임의 단일 색상 태그로 묶지 않고 기숙사별 `DormitoryBadge`를 개별 표시하며, 비기숙사 상태 라벨(`앱 미지원` 등)에는 `DormitoryBadge`를 쓰지 않는다.
- **입력·에디터·업로드**: `StyledInput`, `StyledTextInput`, `StyledTextArea`, `FormField`, `LabeledField`, `Switch`, `ToggleLine`, `FileUploader` + `useFileHandler` (`@/hooks/useFileHandler`), `RichTextEditor`, `RichTextViewer`
- **상태·모션**: `Skeleton`, `LoadingSpinner`, `EmptyState`, `RoommateEmptyState`, `OpenChatEmptyState`, `EmptyMessage`, `ComingSoonOverlay`, `Ripple`, `useCountUp`
- **에셋·아이콘 정책**: `src/assets/`(로고, 횃불이 마스코트, `header/*`, `bottombar/*`, `roommate/*`, `chat/*`, `onboarding/*`, `groupPurchase/default-image/*`)를 먼저 확인하고, 없는 아이콘만 `lucide-react`를 쓴다. `@mui/icons-material` 신규 도입 금지, `react-icons` 신규 추가 지양.

---

## 4. AI 슬롭 차단 8대 규칙

1. **색상·표면**: 보라·인디고·시안·핑크 그라데이션, 네온 글로우, 캔디 컬러, 본문 카드 글래스모피즘(`backdrop-filter`), 카드 안의 카드 다층 중첩(Card-in-Card), 억지 여백(Fake Whitespace) 금지.
2. **장식 아이콘·3열 카드 그리드**: 방패·스파클·로켓·번개·자물쇠·전구 같은 장식 아이콘과 이모지 남발 금지. 원형 배경 속 아이콘(`Icon-in-Circle`), 3열 피처 카드 그리드(`Card Farm`), 실무 화면의 마케팅 히어로·가짜 통계 카드 금지.
3. **영문 아이브로우·병기 라벨**: 제목 위 `FIRST STEP · LANGUAGE` 같은 영문 대문자 오버라인과 `01 · 기능`, `KR · 한국어`, `대한민국 (KR)` 같은 번호·코드 병기 라벨 금지.
4. **타사 브랜드명 오염 금지**: 컴포넌트명, 변수명, CSS 클래스, 주석, 문서에 특정 외부 기업명이나 외부 디자인 시스템 약어를 적지 않는다.
5. **모션·인터랙션**: 과장된 `hover: scale(1.05)` 바운스와 `linear` 전환 금지. `cubic-bezier(0.16, 1, 0.3, 1)` 이징, 절제된 `active` 축소(`0.97~0.985`) 또는 `Ripple`, `framer-motion` 사용 시 `useReducedMotion()` 대응, 모바일 터치 영역 최소 `44x44px` 유지.
6. **UX 라이팅·문체**: 과장 부사(`실시간`, `즉시`, `철저히`, `완벽히`, `100%`, `안전하게`, `신속하게`, `원활하게`, `성공적으로`), 버즈워드(`혁신적인`, `궁극의`, `차세대`, `스마트한`, `극대화`, `시너지`), 번역투(`~에 대해`, `~를 통해`, `~에 기반하여`, `~를 제공합니다`, `~되어지다`, `~를 경험해보세요`) 금지. 쉽고 짧은 구어체(`~해요`)와 동사형 버튼 라벨, 해결 중심 에러 문구를 쓴다. 다국어 화면은 `src/locales/<ko|en|zh|vi>/*.json`과 `useTranslation()`을 사용한다.
7. **4대 UI 상태 구현**: 모든 데이터 화면에 로딩(`Skeleton`/`LoadingSpinner`), 빈 상태(`EmptyState` 계열 + 다음 행동), 에러 상태(재시도 CTA), 상호작용 상태(`disabled`/`loading`)를 구현한다.
8. **오버플로우·접근성**: `flex` 내부 가변 텍스트에 `min-width: 0`과 말줄임(`ellipsis`/`-webkit-line-clamp`), 한글 `word-break: keep-all`, `<button type="button">` 시맨틱 사용, 아이콘 버튼 `aria-label`, `:focus-visible` 유지를 확인한다.

---

## 5. 작업 완료 전 필수 검증

UI 또는 라우트를 변경한 뒤 아래 명령을 실행해 통과를 확인한다.

```sh
npm run verify:bg
npm run lint
npm run build
```
