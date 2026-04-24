import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

/**
 * Mixpanel 초기화
 */
export const initMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: false, // SPA이므로 수동 추적 권장
      persistence: "localStorage",

      record_sessions_percent: 100, // 0~100 (샘플링 비율)
    });

    // 모든 이벤트에 공통으로 포함될 전역 속성 등록
    mixpanel.register({
      platform: "Web",
      service_name: "inu-portal-web",
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
 * 일반 이벤트 추적
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
 * 사용자 식별
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
 * 로그아웃 시 사용자 정보 초기화
 */
export const resetMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
};

/**
 * 페이지 뷰 추적
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
