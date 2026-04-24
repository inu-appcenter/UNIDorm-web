import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

/**
 * Mixpanel 초기화
 */
export const initMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: false, // SPA이므로 수동 추적(trackPageView) 권장
      persistence: "localStorage",
      record_sessions_percent: 100,
    });

    // 모든 이벤트에 공통으로 포함될 전역 속성 등록
    mixpanel.register({
      platform: "Web",
      service_name: "unidorm-web",
    });
  } else {
    if (import.meta.env.DEV) {
      console.warn(
        "Mixpanel token이 없습니다. .env에 VITE_MIXPANEL_TOKEN을 등록해주세요.",
      );
    }
  }
};

/**
 * 기본 이벤트 추적 함수
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>,
) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  }
};

/**
 * 페이지 뷰 추적 (SPA 수동 호출용)
 */
export const trackPageView = (
  pageName: string,
  properties?: Record<string, any>,
) => {
  trackEvent("페이지 조회", {
    page_name: pageName,
    ...properties,
  });
};

/**
 * 유니돔 프로젝트 맞춤형 이벤트 프리셋
 * 함수명은 코드 가독성을 위해 영문 camelCase를 사용하고, 
 * Mixpanel 이벤트명은 직관적인 한글을 사용합니다.
 */
export const mixpanelTrack = {
  // --- 1. 인증 및 온보딩 (Auth & Onboarding) ---
  loginCompleted: (method: string) => {
    trackEvent("로그인 완료", { method });
  },
  onboardingCompleted: () => {
    trackEvent("온보딩 완료");
  },
  freshmanMigrationCompleted: () => {
    trackEvent("신입생 계정 통합 완료");
  },

  // --- 2. 네비게이션 및 홈 유입 (Navigation) ---
  navTabClicked: (tabName: string) => {
    trackEvent("하단 탭 클릭", { tab_name: tabName });
  },
  homeServiceClicked: (serviceName: string, location: string = "홈_서비스박스") => {
    trackEvent("홈 서비스 클릭", { service_name: serviceName, location });
  },
  moreClicked: (sectionName: string) => {
    trackEvent("더보기 클릭", { section_name: sectionName });
  },
  itemClicked: (
    itemType: "공지" | "꿀팁" | "룸메이트" | "공동구매",
    id: number | string,
    title: string,
    location: string,
  ) => {
    trackEvent("아이템 클릭", {
      item_type: itemType,
      item_id: id,
      title: title,
      location: location,
    });
  },

  // --- 3. 콘텐츠 소비 (Contents) ---
  postViewed: (
    boardType:
      | "공지사항"
      | "꿀팁"
      | "민원"
      | "공동구매"
      | "룸메이트"
      | "설문조사",
    id: number | string,
    title: string,
  ) => {
    trackEvent("게시글 조회", {
      board_type: boardType,
      post_id: id,
      title: title,
    });
  },

  // --- 4. 사용자 액션 (Actions) ---
  postCreated: (boardType: string) => {
    trackEvent("게시글 작성 완료", { board_type: boardType });
  },
  complainStarted: () => {
    trackEvent("민원 작성 시작");
  },
  complainSubmitted: (category: string, hasImage: boolean) => {
    trackEvent("민원 작성 완료", {
      category: category,
      has_image: hasImage,
    });
  },
  commentCreated: (boardType: string) => {
    trackEvent("댓글 작성 완료", { board_type: boardType });
  },
  likeClicked: (itemType: string, itemId: number | string) => {
    trackEvent("좋아요 클릭", { item_type: itemType, item_id: itemId });
  },

  // --- 5. 룸메이트 매칭 (Roommate Matching) ---
  roommateFilterApplied: (filters: Record<string, any>) => {
    trackEvent("룸메이트 필터 적용", { ...filters });
  },
  roommateMatchSuccess: () => {
    trackEvent("룸메이트 매칭 성공");
  },

  // --- 6. 프로모션 및 알림 (Promotion & Notification) ---
  bannerClicked: (bannerName: string, location: string) => {
    trackEvent("배너 클릭", { banner_name: bannerName, location });
  },
  popupViewed: (popupTitle: string) => {
    trackEvent("팝업 노출", { popup_title: popupTitle });
  },
  notificationClicked: (notiType: string, title: string) => {
    trackEvent("알림 클릭", { notification_type: notiType, title });
  },
  appInstallImpression: () => {
    trackEvent("앱 설치 유도 노출");
  },
  appInstallClicked: (platform: string) => {
    trackEvent("앱 설치 클릭", { platform });
  },
  externalLinkClicked: (linkName: string, url: string) => {
    trackEvent("외부 링크 이동", { link_name: linkName, url: url });
  },

  // --- 7. 계정 관리 (Account) ---
  profileUpdated: (fields: string[]) => {
    trackEvent("프로필 수정 완료", { updated_fields: fields });
  },
  logout: () => {
    trackEvent("로그아웃");
  },
};

/**
 * 사용자 식별 (로그인 시 호출)
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }
};

/**
 * 사용자 정보 초기화 (로그아웃 시 호출)
 */
export const resetMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
};
