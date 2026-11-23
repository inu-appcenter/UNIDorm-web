# UNIDorm-web UI/UX 가이드라인

이 문서는 `UNIDorm-web` 프론트엔드의 디자인 토큰, 레이아웃 셸, 공용 컴포넌트·에셋 재사용 원칙, AI 슬롭 차단 기준을 정의한 단일 기준 문서다. 모든 UI 신규 개발과 리팩토링 작업은 이 문서를 기준으로 삼는다.

---

## 1. 문서 목적 및 적용 대상

- **적용 범위**: `UNIDorm-web/src/pages/`, `UNIDorm-web/src/components/`, `UNIDorm-web/src/styles/` 전반의 모든 화면과 컴포넌트.
- **스타일링 스택**: `styled-components`를 단일 기준으로 사용한다. Tailwind CSS 유틸리티 클래스나 별도 CSS 프레임워크를 혼용하지 않는다.
- **경로 별칭**: `src/` 하위 모듈은 `@/` 별칭(`@/styles/tokens`, `@/components/...`)으로 가져온다. 상대 경로(`../../`) 중첩을 늘리지 않는다.
- **선행 아키텍처 준수**: 서버 데이터 조회·변경과 상태 동기화는 `CLAUDE.md`의 `src/queries/*` 및 `useInitFromQuery` 규칙을 그대로 따른다.

---

## 2. 디자인 시스템 및 토큰 체계

### 2.1 주 디자인 토큰 (`@/styles/tokens`)

일반 유니돔 화면은 Figma 토큰 원본(`src/styles/tokens/tokens.json`)에서 `npm run build:tokens`(`scripts/generate-tokens.js`)로 생성한 `@/styles/tokens`(`src/styles/tokens/index.ts`, `tokens.css`)를 기준으로 사용한다.

| 분류 | 토큰 키 / CSS 변수 | 값 | 용도 |
| :--- | :--- | :--- | :--- |
| 브랜드 메인 | `colors.main.main1` / `--color-main-main1` | `#1677ff` | 주요 포인트, 활성 탭, 배지 강조 |
| 브랜드 CTA | `colors.main.main2`, `colors.cta.default` / `--color-cta-default` | `#0958d9` | 주요 CTA 버튼 기본 배경, 짙은 강조 |
| CTA 상태 | `colors.cta.hover`, `colors.cta.disabled` | `#002c8c`, `#c1c1c1` | CTA 호버·눌림, 비활성 버튼 |
| 서브틀 블루 | `colors.blue.blue100` / `--color-blue-blue100` | `#e6f4ff` | 선택된 카드 배경, 소프트 칩 배경, 옅은 구분선 |
| 보조 골드 | `colors.main.main3`, `colors.main.main4` | `#ffd666`, `#ffc53d` | 포인트 보조 강조 |
| 기본 표면 | `colors.bg.bg1` / `--color-bg-bg1` | `#ffffff` | 카드, 위젯, 시트, 흰 배경 화면 |
| 섹션 배경 | `colors.bg.bg2` / `--color-bg-bg2` | `#f9fafb` | 회색 톤 기본 화면 배경, 프리뷰 박스 |
| 옅은 표면 | `colors.bg.bg3` / `--color-bg-bg3` | `#efefef` | 비활성·구분 영역 배경 |
| 텍스트 1 | `colors.text.text1` / `--color-text-text1` | `#242424` | 헤드라인, 카드 제목, 핵심 본문 |
| 텍스트 2 | `colors.text.text2` / `--color-text-text2` | `#6f6f6f` | 보조 설명, 부제목, 비활성 탭 |
| 텍스트 3 | `colors.text.text3` / `--color-text-text3` | `#a5a5a5` | 캡션, 플레이스홀더, 날짜 보조 문구 |
| 상태 색상 | `colors.status.positive`, `cautionary`, `destructive` | `#00bf40`, `#ff9200`, `#ff4242` | 완료·주의·삭제/경고 상태 |

#### 타이포그래피 (`typography.*` 및 `.typo-*`)

전역 폰트는 `Pretendard`(`src/resources/styles/CommonStyles.tsx`)를 사용한다. 임의의 시스템 폰트(`Inter`, `Roboto` 단독 지정 등)나 임의 `font-size` 조합보다 아래 토큰 우선 사용을 원칙으로 한다.

| 토큰 | 굵기(Weight) | 크기(px) | 행간(Line-height) | 자간(Letter-spacing) | 주 용도 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `typography.title2` | 700 | 28 | 1.2 | `-0.006em` | 온보딩·주요 인트로 대형 제목 |
| `typography.title3` | 600 | 24 | 1.2 | `-0.006em` | 화면 진입 섹션 타이틀 |
| `typography.heading1` | 600 | 22 | 1.5 | `0em` | 모달·상세 화면 상단 타이틀 |
| `typography.heading2` | 600 | 20 | 1.5 | `0em` | 홈 섹션 헤더(`TitleLine`) |
| `typography.headline1` | 700 | 18 | 1.5 | `0em` | 카드 주요 타이틀, 선택 리스트 라벨 |
| `typography.headline2` | 700 | 17 | 1.5 | `0em` | 서브 섹션 타이틀 |
| `typography.body1Normal` | 600 | 16 | 1.5 | `0em` | 강조 본문, 주요 버튼 텍스트 |
| `typography.body1Reading` | 400 | 16 | 1.6 | `0em` | 긴 안내문, 게시글 본문 |
| `typography.body2Normal` | 400 | 15 | 1.5 | `0em` | 목록 보조 본문, 카드 액션 링크 |
| `typography.label1Normal` | 400 | 14 | 1.5 | `0em` | 칩, 폼 라벨, '더보기' 버튼 |
| `typography.label2` | 400 | 13 | 1.5 | `0em` | 태그 칩, 약관·안내 문구 |
| `typography.caption1` | 400 | 12 | 1.5 | `0em` | 메타 정보, 날짜, 설명 캡션 |
| `typography.caption2` | 400 | 11 | 1.5 | `0em` | 보조 배지, 최소 단위 표기 |

- 토큰 값 변경이 필요할 때는 `src/styles/tokens/index.ts`나 `src/styles/tokens/tokens.css`를 직접 편집하지 않고 `src/styles/tokens/tokens.json`을 갱신한 뒤 `npm run build:tokens`를 실행한다.

### 2.2 포털·사생증 전용 토큰 분리 원칙

`src/styles/portalVariables.css`, `src/styles/unidormTypography.ts`, `src/styles/unidormEffects.ts`, `src/styles/shadows.ts`는 포털 연동·모바일 사생증 도메인(`src/pages/Dormitory/`, `src/components/portal/`, `CapsuleButton`, `ActionButton`)을 위해 구성된 별도 토큰 집합이다.

- 포털 CSS 변수: `--text-primary` (`#191f28`), `--text-secondary` (`#333d4b`), `--text-tertiary` (`#8b95a1`), `--bg-base` (`#ffffff`), `--bg-subtle` (`#f8f9fb`), `--bg-muted` (`#f1f3f5`), `--interactive-primary` (`#3b82f6`), `--space-1`~`--space-8` (`4px`~`32px`), `--radius-sm`~`--radius-2xl` (`8px`~`32px`), `--elevation-1-shadow`, `--bottom-sheet-shadow`.
- 일반 유니돔 화면에서는 `@/styles/tokens`를 기준으로 유지하고, 한 컴포넌트 안에서 두 토큰 체계를 뒤섞거나 새 HEX 색상(`#0a84ff`, `#007bff` 등 레거시 임의 색상 포함)을 하드코딩하지 않는다.

### 2.3 곡률(Radius)·그림자·반응형 기준

- **곡률 위계**:
  - `8px`: 입력창, 표준 사각 버튼(`SquareButton`, `RoundSquareButton`), 컴팩트 리스트 카드
  - `12px ~ 16px`: 일반 콘텐츠 카드, 폼 카드, 모달 본체, 하단 주요 CTA 버튼(`border-radius: 16px`)
  - `20px ~ 24px`: 프리뷰 컨테이너, 바텀시트 상단 모서리, 포털 모달(`--radius-2xl`)
  - `999px` (또는 `23px` / `60px`): 칩(`ChipButton`), 캡슐 버튼(`CapsuleButton`), 하단 플로팅 탭바(`BottomBar`)
- **표면 분리와 그림자**:
  - 카드와 섹션 분리는 두꺼운 테두리나 진한 그림자 대신 배경 명암 대비(`bg2` 위 `bg1` 위젯)와 `1px solid` 미세 경계선(`colors.gray.gray100`~`gray200`)을 우선한다.
  - 부유 요소나 카드에 그림자가 필요하면 `0 2px 8px rgba(0, 0, 0, 0.03)`~`0 4px 12px rgba(0, 0, 0, 0.08)` 범위로 제한한다.
- **반응형 및 여백**:
  - 브레이크포인트는 `src/styles/unidormResponsive.ts`(`DESKTOP_BREAKPOINT = 768px`)와 `src/styles/Layout.styles.ts`(`1024px` 이상 `padding-left/right: 10vw`)를 기준으로 삼는다.
  - 모바일 기본 좌우 거터는 `16px`(`MOBILE_PAGE_GUTTER`)~`20px`(`Header`·홈 위젯)을 유지하고, 데스크톱에서는 `max-width: 1200px`(홈·마이페이지·탭바) 또는 `440px`(온보딩 등 단일 집중 셸)으로 중앙 정렬한다.

---

## 3. 레이아웃 셸·배경색 SSOT·Safe Area·멀티 웹뷰 규칙

### 3.1 3개 레이아웃 셸 (`src/pages/layouts/`)

| 셸 컴포넌트 | 구성 | 적용 대상 | 규칙 |
| :--- | :--- | :--- | :--- |
| `RootPage` | `Header(hasBack=false)` + `ContentContainer` + `BottomBar` | 메인 5개 탭(`/home`, `/roommate`, `/groupPurchase`, `/chat`, `/complain`, `/mypage`) | 페이지 내부에서 `Header`나 `BottomBar`를 다시 렌더링하지 않는다. |
| `SubPage` | `Header(hasBack=true)` + `ContentContainer` | 상세, 작성, 필터, 설정, 관리자 하위 페이지 | 헤더 우측 액션·제목·배지·서브헤더는 `useSetHeader` 훅으로 주입한다. |
| `OutPage` | `PageWrapper` + `ContentContainer(hasHeader=false, hasBottomBar=false)` | 온보딩(`/onboarding`), 로그아웃(`/logout`) | 상·하단 바 없이 `100dvh` 전체 화면 셸을 직접 구성한다. |

- `OutPage`를 쓰는 집중 화면(예: `src/pages/OnboardingPage.tsx`)은 `height: 100dvh; max-height: 100dvh; overflow: hidden` 고정 셸 안에서 헤더와 하단 CTA 푸터를 고정하고, 본문 영역(`flex: 1; min-height: 0; overflow-y: auto`)만 내부 스크롤하도록 만든다.

### 3.2 배경색 선언적 단일 원본(SSOT)과 `verify:bg`

`UNIDorm-web`은 페이지별 배경색을 `src/routes/Router.tsx`에서 선언적으로 관리한다.

1. `src/routes/Router.tsx`의 모든 라우트 객체(`Navigate`, 레이아웃 셸 제외)에 `handle: { bg: "white" | "gray" }`를 반드시 명시한다.
2. `PageWrapper`(`src/styles/Layout.styles.ts`)가 `useCurrentRouteBg`로 `--layout-bg`를 `#ffffff`(`white`) 또는 `#f9fafb`(`gray`)로 결정하고, `Header` 반투명 블러 배경도 `--page-bg` / `--layout-bg`를 상속받는다.
3. **개별 페이지 최상위 루트 래퍼 `styled` 컴포넌트에 `background` 또는 `background-color`를 직접 선언하지 않는다.**(`transparent`·`none` 제외)
4. 라우트나 페이지 최상위 래퍼를 수정한 뒤에는 반드시 `npm run verify:bg`(`scripts/verify-page-backgrounds.js`)를 실행한다. 자신이 추가·수정한 라우트와 페이지에 신규 위반이 0건이어야 하며, 작업 범위 밖 기존 파일의 미해결 항목은 별도 이슈로 분리해 다룬다.

### 3.3 상위 레이아웃 여백 위임과 Safe Area

- `RootPage`와 `SubPage`의 `ContentContainer`가 이미 상단 `calc(70px + var(--safe-area-top, 0px))`, 하단(바텀바 존재 시) `calc(90px + var(--safe-area-bottom, 0px))` 패딩을 적용한다. 개별 페이지 최상단에서 헤더 높이만큼 상단 패딩을 중복 추가하지 않는다.
- `index.html`에 `viewport-fit=cover`가 설정되어 있으며, `src/resources/styles/CommonStyles.tsx`가 네이티브 인셋(`--native-safe-area-inset-*`)과 CSS `env(safe-area-inset-*)` 중 최댓값을 아래 변수로 계산한다.
  - `--safe-area-top`
  - `--safe-area-bottom`
  - `--safe-area-left`
  - `--safe-area-right`
- 하단 고정 플로팅 CTA(`position: fixed; bottom: 0`)를 배치할 때는 반드시 `padding-bottom: calc(16px~30px + var(--safe-area-bottom, 0px))`를 포함하고, 상단에는 배경과 자연스럽게 이어지는 페이드 그라데이션을 둔다. 본문 스크롤 영역 하단에는 고정 버튼 높이 이상의 `padding-bottom`을 확보해 마지막 항목이 가려지지 않게 한다.

### 3.4 Z-Index 계층표 (코드 기준)

새로운 플로팅 버튼·툴팁·모달·시트를 추가할 때 아래 계층과 충돌하지 않게 배치한다.

| 레이어 수준 | z-index | 해당 컴포넌트 / 영역 |
| :--- | :--- | :--- |
| 본문 플로팅 CTA / 준비중 오버레이 | `10` | `AuthButtonWrapper`(`src/styles/auth.ts`), `ComingSoonOverlay` |
| 하단 플로팅 검색바 | `990` | `FloatingSearchBar`(`src/components/common/FloatingSearchBar.tsx`) |
| 하단 탭바 | `1000` | `BottomBar` |
| 홈 AI 챗봇 플로팅 버튼 | `1002` | `AIChatFloatingButton` (버튼) |
| 말풍선 툴팁 | `2000` | `TooltipMessage` |
| 일반 모달 / 전체 로딩 / 드롭다운 | `9999` | `Modal`(`src/components/modal/Modal.tsx`), `LoadingSpinner(overlay)`, `TopRightDropdownMenu`, `PortalSyncProgressModal` |
| 상단 고정 헤더 | `10000` | `Header` |
| AI 챗봇 오버레이·창 | `10001` / `10003` | `AIChatFloatingButton` Backdrop / ModalContainer |
| 공용 바텀시트 | `10010` / `10011` | `CommonBottomSheet` Overlay / Content |
| 포털 확인 모달 / 상단 팝업 알림 | `19999` / `20000` | `PortalConfirmModal` Overlay / Content, `TopPopupNotification` |

- `Modal`(`src/components/modal/Modal.tsx`, `z-index: 9999`)은 `Header`(`10000`)보다 아래 계층에 있으므로, 헤더까지 덮어야 하는 확인 대화상자나 신규 모달을 만들 때는 `PortalConfirmModal`(`src/components/portal/PortalConfirmModal.tsx`)을 쓰거나 계층 위계를 먼저 점검한다.

### 3.5 멀티 웹뷰 내비게이션 규칙

- React Native 멀티 웹뷰 환경에서는 새 웹뷰가 열릴 때 `location.state`가 유실된다. 상세 페이지로 이동할 때 필요한 식별자(`id`, `boardId`, `tab` 등)는 반드시 URL 경로 파라미터나 쿼리 스트링(`?id=...`)으로 전달한다.
- `OutPage` 기반 다단계 화면은 `appBridge.onCheckBack`을 등록해 기기 뒤로가기 제스처와 단계 이동/종료 프롬프트를 연동한다(`src/pages/OnboardingPage.tsx` 참고).
- 전역 AI 챗봇 버튼 노출 제어는 `useSetAIChat` 훅으로 처리한다.

---

## 4. 공용 컴포넌트·에셋 우선 탐색 및 재사용 카탈로그

### 4.1 작업 전 3단계 탐색 절차

새 화면이나 UI 조각을 작성하기 전 반드시 아래 순서로 기존 자산을 확인한다.

1. **공용 계층 탐색**: `src/components/common/`, `src/components/button/`, `src/components/modal/`에 동일하거나 유사한 컴포넌트가 있는지 먼저 확인한다.
2. **도메인 계층 탐색**: 작업 대상 도메인 폴더(`home`, `roommate`, `chat`, `complain`, `GroupPurchase`, `mypage`, `portal`, `announce`, `calendar`, `comment`, `form`, `notification`, `tip`)에 이미 만든 카드·목록·폼 패턴이 있는지 확인한다.
3. **에셋·아이콘 탐색**: `src/assets/` 폴더를 확인해 기존 SVG·이미지가 있으면 그대로 사용하고, 없을 때만 `lucide-react` 아이콘을 사용한다.

### 4.2 재사용 강제 원칙

- 버튼, 모달, 바텀시트, 입력창, 스위치, 스켈레톤, 빈 상태, 구분선, 리치텍스트 에디터/뷰어를 페이지 파일 내부에 즉석으로 다시 작성하지 않는다.
- 기존 컴포넌트와 요구사항이 80% 이상 겹치면 새 파일을 복제하지 않고 기존 컴포넌트에 선택적 `props`를 확장하거나 `styled(기존컴포넌트)`로 스타일만 덧붙인다.
- 파일/이미지 업로드는 UI(`FileUploader`)와 상태 훅(`useFileHandler`)을 함께 쓴다.

### 4.3 카테고리별 공용 컴포넌트 카탈로그

#### 버튼·선택 칩
| 컴포넌트 | 경로 | 주요 Props | 용도 |
| :--- | :--- | :--- | :--- |
| `SquareButton` | `@/components/common/SquareButton` | `text`, `variant` (`"primary" \| "primaryDark" \| "secondary" \| "destructive"`), `disabled`, `onClick` | 표준 전체 폭 사각 버튼(`48px`, `tokens` 기반) |
| `RoundSquareButton` | `@/components/button/RoundSquareButton` | `btnName`, `color`, `disabled`, `onClick`, `className` | 리플 효과가 포함된 폼·모달·CTA 사각 버튼(`min-height: 50px`) |
| `RoundSquareWhiteButton` | `@/components/button/RoundSquareWhiteButton` | `btnName`, `onClick` | 보조 아웃라인 사각 버튼 |
| `ChipButton` | `@/components/button/ChipButton` | `active`, `children`, button HTML attrs | 필터·탭 전환용 단일 칩 버튼(`tokens` 기반) |
| `CapsuleButton` / `.Group` | `@/components/common/CapsuleButton` | `variant` (`"brand" \| "danger" \| "primary" \| "secondary"`), `fullWidth`, `loading`, `leftIcon`, `rightIcon` | 모달·포털 도메인 캡슐 버튼 및 버튼 그룹 |
| `ActionButton` | `@/components/common/ActionButton` | `disabled`, `as`, `href`, `children` | 알약형 단일 액션 버튼 |
| `HeartToggleButton` | `@/components/common/HeartToggleButton` | `liked`, button HTML attrs | 좋아요 토글 아이콘 버튼(`40x40px`) |
| `SelectableChipGroup` | `@/components/roommate/checklist/SelectableChipGroup` | `Groups`, `multi`, `selectedIndex` / `selectedIndices`, `onSelect`, `unselectable`, `rowScrollable` | 단일·다중 선택 칩 그룹 |

#### 모달·바텀시트·오버레이·피드백
| 컴포넌트 | 경로 | 주요 Props | 용도 |
| :--- | :--- | :--- | :--- |
| `PortalConfirmModal` | `@/components/portal/PortalConfirmModal` | `isOpen`, `onClose`, `title`, `description`, `children`, `primaryButton`, `secondaryButton`, `closeOnOverlayClick` | `@radix-ui/react-dialog` 기반 접근성 확인 모달(`z-index: 20000`, 신규 모달 우선 선택) |
| `CommonBottomSheet` | `@/components/modal/CommonBottomSheet` | `id`, `isOpen`, `setIsOpen`, `title`, `subtitle`, `headerImageId`, `closeButtonText`, `onCloseClick` | `vaul` 드래그 지원 하단 바텀시트(`z-index: 10011`) |
| `Modal` | `@/components/modal/Modal` | `show`, `onClose`, `title`, `subtitle`, `content`, `showHideOption`, `closeButtonText`, `secondaryButtonText` | 기존 공지/안내 모달(`z-index: 9999`, 헤더 아래 위치 유의) |
| `TopPopupNotification` | `@/components/common/TopPopupNotification` | `onClose`, `title`, `message`, `appName`, `appIcon`, `duration` | 스와이프 닫기 지원 상단 플로팅 알림 |
| `TooltipMessage` | `@/components/common/TooltipMessage` | `message`, `onClose`, `position` (`"top" \| "bottom"`), `align`, `width` | 헤더·바텀바 등 기능 안내 말풍선 |
| `TopRightDropdownMenu` | `@/components/common/TopRightDropdownMenu` | `items` (`{ label, onClick }[]`), `color`, `size` | 우상단 더보기(`⋮`) 드롭다운 메뉴 |

#### 섹션·카드·배지·내비게이션
| 컴포넌트 / 모듈 | 경로 | 주요 Props / 내보내기 | 용도 |
| :--- | :--- | :--- | :--- |
| `TitleContentArea` | `@/components/common/TitleContentArea` | `title`, `link`, `externalLink`, `description`, `gap`, `rightAction`, `children` | 제목·더보기·설명을 묶는 표준 섹션 래퍼 |
| `TitleLine` | `@/components/home/TitleLine` | `title`, `link`, `externalLink`, `location` | 섹션 제목 + '더보기' 이동 줄 |
| `Box` | `@/components/common/Box` | `children`, `onClick`, `style` | 기본 흰색 라운드 카드(`border-radius: 20px`) |
| `Divider` / `GrayDivider` | `@/components/common/Divider`, `GrayDivider` | `margin`, `thickness`, `color` | 수평 구분선 |
| `DormitoryBadge` | `@/components/common/DormitoryBadge` | `dormType`, `variant` (`"outline" \| "subtle"`), `size` (`"sm" \| "md"`), `parseDormitoryKind` | 1·2·3기숙사 자동 정규화 배지 |
| `TagIconBlueBackground` / `TagIconWhiteBackground` | `@/components/common/TagIconBlueBackground`, `@/components/common/TagIconWhiteBackground` | `tagTitle` | 채움형·테두리형 소형 카테고리 태그 |
| `UserInfo` | `@/components/common/UserInfo` | `authorImagePath`, `username`, `createDate`, `groupOrderType` | 작성자 프로필·닉네임·작성일시 행 |
| `SortDropBox` | `@/components/common/SortDropBox` | `sort`, `setSort` | 최신순/인기순 정렬 토글 |
| `MenuGroup` | `@/components/mypage/MenuGroup` | `title`, `menus`, `hasToggle`, `onToggle` | 마이페이지·설정 메뉴 목록 그룹 |
| `TermOfUse` | `@/components/TermOfUse` | - | 온보딩 하단 앱센터·생활원 안내 문구 |
| 공용 스타일 조각 | `@/styles/header`, `@/styles/auth`, `@/styles/common`, `@/styles/announcement` | `CategoryWrapper`, `CategoryItem`, `AuthFormWrapper`, `AuthButtonWrapper`, `TypeBadge`, `SearchBar` 등 | 상단 탭바, 인증 폼 레이아웃, 검색창, 공지 배지 |

#### 입력·검색·스위치·에디터·뷰어
| 컴포넌트 | 경로 | 주요 Props | 용도 |
| :--- | :--- | :--- | :--- |
| `FloatingSearchBar` | `@/components/common/FloatingSearchBar` | `value`, `onChange`, `onSearch`, `onClear`, `floating`, `hasBottomBar`, `rightAction` | 반투명 블러 알약형 하단 플로팅(또는 인라인) 검색바 |
| `StyledInput` | `@/components/common/StyledInput` | input attrs | 기본 단일 줄 입력창(`height: 50px`) |
| `StyledTextInput` / `StyledTextArea` | `@/components/roommate/StyledTextInput`, `StyledTextArea` | input / textarea attrs | 블루 포커스 테두리가 적용된 폼 입력·장문 입력 |
| `FormField` / `LabeledField` | `@/components/complain/FormField`, `LabeledField` | `label`, `required`, `description`, `descriptionGray`, `children` | 필수 표시·안내문 포함 입력 필드 래퍼 |
| `Switch` / `ToggleLine` | `@/components/common/Switch`, `ToggleLine` | `checked`, `onCheckedChange` / `label`, `offLabel`, `onToggle` | `@headlessui/react` 기반 토글 스위치 및 행 |
| `FileUploader` | `@/components/common/FileUploader` | `images`, `onAddImages`, `onDeleteImage`, `isLoading`, `mode` (`"image" \| "file"`) | `useFileHandler`(`@/hooks/useFileHandler`)와 조합하는 파일·이미지 업로더 |
| `RichTextEditor` | `@/components/common/Editor/RichTextEditor` | `content`, `onChange`, `placeholder`, `minHeight` | `@tiptap/react` 기반 본문 에디터 |
| `RichTextViewer` | `@/components/common/Viewer/RichTextViewer` | `content`, `className` | `dompurify` HTML 정제 및 자동 링크 변환 뷰어 |

#### 상태·모션·전역 훅
| 대상 | 경로 | 주요 API / Props | 용도 |
| :--- | :--- | :--- | :--- |
| `Skeleton` | `@/components/common/Skeleton` | `variant` (`"text" \| "tag" \| "card"`), `width`, `height`, `circle` | Shimmer 애니메이션 로딩 스켈레톤 |
| `LoadingSpinner` | `@/components/common/LoadingSpinner` | `message`, `overlay` | 초기 로딩 및 오버레이 스피너 |
| `EmptyState` | `@/components/common/EmptyState` | `children`, `padding` | 일반 목록 빈 상태 래퍼 |
| `RoommateEmptyState` / `OpenChatEmptyState` | `@/components/roommate/RoommateEmptyState`, `@/components/chat/OpenChatEmptyState` | `title`, `description`, `buttonText`, `onAction` / `tab`, `onClickMoveDormitory` | 행동 유도 CTA 포함 도메인 빈 상태 카드 |
| `EmptyMessage` | `@/constants/EmptyMessage` | `message`, `children` | 홈 위젯용 단순 빈 상태 문구 |
| `ComingSoonOverlay` | `@/components/common/ComingSoonOverlay` | `message`, `subMessage`, `imageAlt` | 준비 중 기능 블러 오버레이 |
| `FeatureFlagGate` | `@/components/common/FeatureFlagGate` | `flagKey`, `fallbackPath`, `children` | 피처 플래그 기반 라우트 가드 |
| `Ripple` | `@/components/common/Ripple` | `color`, `duration` | 터치·클릭 파동 효과(부모 `overflow: hidden`·`relative` 자동 보장) |
| `useCountUp` | `@/hooks/useCountUp` | `(target, { duration, start, decimals, enabled })` | 감속 이징 기반 60fps 숫자 카운트업 |
| `useSetHeader` / `useSetAIChat` | `@/hooks/useSetHeader`, `@/hooks/useSetAIChat` | `HeaderConfig` / `{ isVisible, shouldAnimate }` | 전역 헤더 및 AI 챗봇 플로팅 버튼 제어 |

### 4.4 에셋(`src/assets/`) 카탈로그 및 아이콘 정책

#### 프로젝트 에셋 목록
- **브랜드·마스코트**: `unidorm-logo.webp`, `unidorm-logo-white-bg.png`, `앱센터로고가로.webp`, `호랑이 횃불이_2.webp`, `눈물 닦아주는 횃불이.webp`, `profileimg.png`, `ai-chat/챗불이로고.svg`, `ai-chat/챗불이버튼.webp`, `roommate/hwatbuli-first-post.webp`, `roommate/궁금해하는횃불이.webp`, `roommate/매칭완료2.svg`
- **UI 기능 아이콘(SVG)**: `header/back.svg`, `header/noti.svg`, `bottombar/*.svg` (`home`, `roommate`, `chat`, `Complaint`, `buy`, `mypage` 및 `*-clicked.svg`), `arrow-right.svg`, `FaRight.svg`, `heart.svg`, `bookmark.svg`, `comment.svg`, `menu.svg`, `roommate/{heart-default,heart-liked,search-normal,settings-sliders,caret-down,Comment_light,Date_range_light,Flag_light,Friends}.svg`, `chat/{chat_bg,human,profile,send}.svg`, `notification/{announce,chat,purchase,roommate}.svg`
- **도메인 일러스트·기본 이미지**: `onboarding/{dorm-id-card,globe,speech-bubble,roommate-bubble-back,roommate-bubble-front}.svg`, `onboarding/onboarding1~5.webp`, `groupPurchase/default-image/{기타,배달,생활용품,식자재}.webp`, `home/{민원아이콘,폼아이콘}.webp`

#### 아이콘 라이브러리 기준
1. `src/assets/`에 프로젝트 고유 아이콘이나 일러스트가 있으면 해당 파일을 우선 사용한다.
2. 적합한 에셋이 없으면 `lucide-react` 아이콘을 사용한다.
3. `@mui/icons-material`(코드베이스 미사용)은 새로 도입하지 않고, `react-icons`는 기존 파일 유지 외 신규 화면에서 추가하지 않는다.

---

## 5. AI 슬롭(AI Slop) 차단 기준

AI가 생성한 UI에서 흔히 드러나는 전형적인 클리셰(과장된 그라데이션, 카드 남발, 장식 아이콘, 번역투 문구, 빈 상태 누락)를 아래 6개 영역별로 차단한다.

### 5.1 색상·표면 슬롭 금지

- **보라·인디고·시안·핑크 그라데이션 및 네온 글로우 금지**: 배경·버튼·배지에 임의의 다색 그라데이션이나 형광 발광 테두리를 쓰지 않는다. 강조 색상은 `colors.main.main1`~`main2`와 `colors.blue.blue100`으로 통일한다.
- **무분별한 글래스모피즘 금지**: `backdrop-filter: blur(...)`와 반투명 흰 테두리 조합은 `Header`, `BottomBar`, `TopPopupNotification`, 모달 딤 등 전역 크롬 계층에만 사용한다. 일반 본문 카드나 목록 아이템에는 단색 표면(`colors.bg.bg1`, `colors.bg.bg2`)만 사용한다.
- **카드 중첩(Card-in-Card) 및 과잉 여백 금지**: 흰 카드 안에 또 테두리가 있는 작은 카드를 여러 겹 쌓지 않는다. 정보 두 줄짜리 화면에 상하좌우 과도한 여백을 주어 빈 공간을 억지로 부풀리지 않는다.
- **획일적 극단 라운드 금지**: 모든 배지·입력창·카드를 똑같은 큰 곡률(`24px+`)로 둥글리지 않고 2.3절의 곡률 위계를 지킨다.

### 5.2 장식 아이콘·레이아웃 클리셰 금지

- **상투적 장식 아이콘·이모지 금지**: `🛡️`, `✨`, `🪄`, `🚀`, `⚡`, `🔒`, `💡`, `🔥`, `🎯`, `✅` 등을 제목·카드·배지에 습관적으로 붙이지 않는다. (단, 실제 AI 답변 기능 자체를 구분하는 `AIOverviewCard` 제목과 프로젝트 마스코트 횃불이 일러스트는 예외다.)
- **원형 배경 속 아이콘(`Icon-in-Circle`) 및 3열 피처 그리드(`Card Farm`) 금지**: 색깔 있는 원/사각형 배경 안에 아이콘을 넣고, 굵은 제목과 2줄 회색 설명을 붙인 카드 3개짜리 가로 그리드를 만들지 않는다. 정보 위계는 `TitleContentArea`, `MenuGroup`, 리스트 행으로 간결하게 잡는다.
- **마케팅 히어로·가짜 지표 카드 금지**: 기숙사 관리·목록·폼 등 실무 기능 화면 상단에 중앙 정렬 대형 헤드라인, 빛나는 필 배지, 듀얼 CTA가 들어간 랜딩 히어로 섹션을 넣거나 의미 없는 가짜 숫자 카드(`+24%` 등)로 빈 공간을 채우지 않는다.
- **무조건적인 가운데 정렬 금지**: 목록, 폼, 상세 본문, 설정 화면은 좌측 정렬을 기본으로 유지한다. 모달·온보딩 일러스트·빈 상태처럼 의도가 분명할 때만 중앙 정렬한다.

### 5.3 타이포그래피·라벨·네이밍 슬롭 금지

- **영문 대문자 아이브로우(오버라인/키커) 금지**: 한국어 제목 위에 `FIRST STEP · LANGUAGE`, `DORMITORY SERVICE`, `STEP 01 · ONBOARDING` 같은 장식용 영문 소제목(`uppercase`, 넓은 자간)을 얹지 않는다.
- **기계적 병기 라벨 금지**: 탭·배지·카드에 `01 · 사생증`, `KR · 한국어`, `대한민국 (KR)`처럼 번호나 국가·영문 코드를 가운뎃점(`·`)이나 괄호로 병기하지 않는다. 해당 언어의 단일 명칭(`사생증`, `한국어`)만 표기한다.
- **타사 브랜드·서비스 고유명사 오염 금지**: 컴포넌트명, 함수명, 변수명, CSS 클래스, 주석, 문서에 특정 외부 기업명이나 외부 디자인 시스템 약어를 적지 않는다. (기존 레거시 파일에 남아 있는 주석을 새 코드로 복제하지 않는다.)
- **한글 가독성 유지**: 한국어 제목·설명·모달 본문에는 `word-break: keep-all`을 지정해 단어 중간 줄바꿈을 방지하고, 전역 `Pretendard` 외 별도 폰트를 임의로 지정하지 않는다.

### 5.4 모션·인터랙션 슬롭 금지

- **과장된 바운스·등속 전환 금지**: 모든 카드와 버튼에 `hover: scale(1.05)` 튀어오르는 효과나 이유 없는 무한 부유·반짝임, 기계적인 `linear` 전환을 넣지 않는다.
- **표준 모션 규칙**:
  - 감속 곡선: `cubic-bezier(0.16, 1, 0.3, 1)`
  - 탭·클릭 피드백: `active` 시 `scale(0.97)`~`scale(0.985)` 또는 `Ripple` 컴포넌트
  - 진입 전환: 투명도·이동 중심 `200ms ~ 350ms` 페이드/슬라이드 인
  - 숫자 카운트업: `useCountUp` 훅 활용
- **모션 접근성**: `framer-motion`으로 움직임을 구현할 때는 `useReducedMotion()`을 확인해 모션 감소 설정 사용자에게 과도한 이동 애니메이션을 끄거나 축소한다(`src/pages/OnboardingPage.tsx` 참고).
- **터치 타겟**: 모바일에서 누르는 버튼과 아이콘 영역은 최소 `44x44px` 이상 확보한다(`unidormResponsive.ts`의 `48px` 헤더 타겟 참고).

### 5.5 UX 라이팅 및 문체 슬롭 금지

UI 문구, 빈 상태 안내, 모달, 에러 메시지, 버튼 라벨에는 AI 번역투와 과장 부사를 넣지 않는다.

#### 금지 어휘 및 대체 표현 표

| 구분 | 금지 어휘 예시 | 권장 대체 표현 |
| :--- | :--- | :--- |
| 과장 부사 | `실시간`, `즉시`, `철저히`, `완벽히`, `100%`, `안전하게`, `신속하게`, `원활하게`, `성공적으로` | `바로`, `지금`, `빠짐없이`, `문제없이`, `기기에 저장해요`, `마쳤어요` 등 구체적 동작과 사실 |
| 공허한 버즈워드 | `혁신적인`, `궁극의`, `차세대`, `스마트한`, `극대화`, `시너지`, `여정`, `강력한` | 삭제하고 실제 사용자가 얻는 기능 동작을 서술 (`한 번에 조회하기`, `방 조건으로 룸메 찾기`) |
| 번역투 구문 | `~에 대해`, `~를 통해`, `~에 기반하여`, `~를 제공합니다`, `~되어지다`, `시작할 준비가 되셨나요?`, `~를 경험해보세요` | 능동형 구어체 (`~를 확인해요`, `~로 이동하기`, `지금 시작하기`, `계속할까요?`) |

- **유니돔 한국어 UX 톤**: 친근하고 짧은 구어체(`~해요`, `~할게요`)를 기본으로 쓴다.
- **예측 가능한 버튼 라벨**: `확인`, `다음`, `제출` 같은 모호한 단어보다 눌렀을 때 일어나는 행동을 적는다(`사생증 발급받기`, `첫 글 작성하러 가기`, `로그인하러 가기`).
- **해결 중심 에러 문구**: `요청 처리 중 오류가 발생했습니다 (500)` 같은 기계적 문구나 사용자 탓 표현 대신, 현재 상태와 사용자가 할 수 있는 다음 행동을 안내한다(`비밀번호가 맞지 않아요. 다시 확인해 주세요.`).
- **다국어 연동**: 다국어를 지원하는 화면은 텍스트를 JSX에 하드코딩하지 않고 `src/locales/<ko|en|zh|vi>/*.json`과 `react-i18next`의 `useTranslation()`으로 연결한다.

### 5.6 해피 패스 전용(Happy-Path-Only) 슬롭 금지 — 상태·접근성·오버플로우

- **4대 UI 상태 구현**:
  1. **로딩**: 레이아웃 밀림이 없는 `Skeleton` 또는 `LoadingSpinner`
  2. **빈 상태**: `EmptyState`, `RoommateEmptyState`, `OpenChatEmptyState`, `EmptyMessage` 중 용도에 맞는 컴포넌트와 다음 행동 안내
  3. **에러 상태**: 흰 화면 중단 대신 안내 메시지와 `다시 시도하기` 버튼
  4. **상호작용 상태**: 처리 중 `disabled`/`loading`으로 중복 요청 방지, 시각적 눌림 피드백
- **긴 텍스트·오버플로우 방어**:
  - `flex` 행 내부 가변 텍스트 래퍼에는 `min-width: 0`을 지정해 말줄임(`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)이나 2줄 제한(`-webkit-line-clamp: 2`)이 실제로 동작하게 만든다.
  - 모바일 `360px` 폭 기준으로 가로 스크롤(`overflow-x`)이 새지 않도록 확인한다.
- **웹 접근성(a11y)**:
  - 클릭 가능한 동작에는 `div` 대신 `<button type="button">`을 우선 사용하고, 불가피하게 `div`에 클릭을 달 때는 `role="button"`, `tabIndex={0}`, 키보드(`Enter`/`Space`) 처리를 함께 둔다(`HomeDormitoryCardButton.tsx` 참고).
  - 아이콘만 있는 버튼에는 반드시 `aria-label`을 지정한다.
  - `src/index.css`의 `:focus-visible` 포커스 링을 임의로 제거하지 않는다.
  - 본문 텍스트는 최소 `colors.text.text2` (`#6f6f6f`) 이상의 명도 대비를 유지하고, 비활성 요소에만 `text3`/`gray300` 이하 연한 회색을 사용한다.

---

## 6. 작업 완료 전 자가 점검 체크리스트 및 검증 명령

### 자가 점검 체크리스트 (12항목)

1. [ ] `src/components/`와 `src/assets/`를 먼저 확인해 기존 공용 컴포넌트와 에셋을 재사용했는가?
2. [ ] `styled-components`와 `@/styles/tokens`(포털·사생증 도메인은 `portalVariables.css`)를 사용해 임의 HEX·폰트 하드코딩을 피했는가?
3. [ ] `Router.tsx`에 `handle: { bg: "white" | "gray" }`를 선언하고, 페이지 루트 래퍼의 `background` 선언을 피했는가?
4. [ ] `Header`/`BottomBar` 중복 렌더링 없이 `useSetHeader`, `useSetAIChat`을 사용했는가?
5. [ ] `var(--safe-area-top/bottom/left/right)`와 고정 하단 CTA 여백, z-index 계층을 지켰는가?
6. [ ] 멀티 웹뷰 이동 시 `location.state` 대신 URL 경로/쿼리로 식별자를 전달했는가?
7. [ ] 보라·네온 그라데이션, 본문 글래스모피즘, 카드 다층 중첩(Card-in-Card)이 없는가?
8. [ ] 상투적 장식 아이콘, `Icon-in-Circle`, 3열 피처 카드 그리드, 가짜 통계 카드가 없는가?
9. [ ] 영문 대문자 아이브로우, 번호·코드 병기(`01 · ...`, `KR · ...`), 타사 브랜드명 오염이 없는가?
10. [ ] 과장 바운스·등속 모션 대신 `cubic-bezier(0.16, 1, 0.3, 1)`과 `useReducedMotion()`을 적용했는가?
11. [ ] UI 문구에 과장 부사·허세 버즈워드·번역투가 없고 동사형 버튼 라벨과 해결 중심 에러 문구를 썼는가?
12. [ ] 로딩·빈 상태·에러·상호작용 4대 상태와 `min-width: 0` 오버플로우 방어, `:focus-visible`/`aria-label`이 갖춰졌는가?

### 필수 검증 명령

`UNIDorm-web` 루트에서 작업 후 아래 명령을 실행해 통과를 확인한다.

```sh
npm run verify:bg
npm run lint
npm run build
npm test
```
